/**
 * WHO AM I? — Appearance & Theme Customizer
 * Allows live theme preview, selection of 5 professional themes (with spotlight on Cloud),
 * and custom theme editing (colors, radius, animation, density).
 */

import React, { useState } from 'react';
import { THEME_PRESETS, getStoredTheme, saveTheme, applyThemeToDOM } from '../../services/themeEngine';
import { ThemeTokens, ThemePreset, AnimationIntensity, UIDensity } from '../../types';
import { Palette, Check, RotateCcw, Eye, Sparkles, X, Sun, Moon } from 'lucide-react';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChanged?: (theme: ThemeTokens) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  onThemeChanged,
}) => {
  const [activeTheme, setActiveTheme] = useState<ThemeTokens>(getStoredTheme());
  const [previewTheme, setPreviewTheme] = useState<ThemeTokens>(activeTheme);
  const [isEditingCustom, setIsEditingCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Preset Select
  const handleSelectPreset = (presetKey: ThemePreset) => {
    const selected = THEME_PRESETS[presetKey];
    setPreviewTheme(selected);
    applyThemeToDOM(selected); // Live preview
  };

  // Apply Changes Permanently
  const handleApply = () => {
    saveTheme(previewTheme);
    setActiveTheme(previewTheme);
    if (onThemeChanged) onThemeChanged(previewTheme);
    onClose();
  };

  // Reset to Default
  const handleResetToDefault = () => {
    const defaultTheme = THEME_PRESETS.cloud;
    setPreviewTheme(defaultTheme);
    setActiveTheme(defaultTheme);
    saveTheme(defaultTheme);
    applyThemeToDOM(defaultTheme);
    if (onThemeChanged) onThemeChanged(defaultTheme);
  };

  // Cancel Preview
  const handleCancel = () => {
    applyThemeToDOM(activeTheme); // Revert to active
    onClose();
  };

  // Update Custom Field
  const updateCustomToken = <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => {
    const updated: ThemeTokens = {
      ...previewTheme,
      preset: 'custom',
      name: 'Custom Theme',
      [key]: value,
    };
    setPreviewTheme(updated);
    applyThemeToDOM(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-main)]">Appearance & Themes</h2>
              <p className="text-xs text-[var(--text-muted)]">
                Personalize your workspace palette, typography feel, and LYRA glow.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-app)] hover:text-[var(--text-main)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Theme Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Curated Design Systems
              </span>
              <span className="text-[11px] text-[var(--primary)] font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" /> Live preview active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(THEME_PRESETS) as ThemePreset[])
                .filter((p) => p !== 'custom')
                .map((key) => {
                  const theme = THEME_PRESETS[key];
                  const isSelected = previewTheme.preset === key;
                  const isCloud = key === 'cloud';

                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-md'
                          : 'border-[var(--border-card)] hover:border-[var(--text-muted)]/40 hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      {isCloud && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-800 text-amber-100 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Spotlight
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--text-main)]">{theme.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-[var(--primary)]" />}
                      </div>

                      {/* Theme Palette Swatch Preview */}
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[var(--bg-app)] border border-[var(--border-card)]">
                        <div
                          className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.bgApp }}
                          title="Background"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.bgCard }}
                          title="Card"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.primary }}
                          title="Primary Accent"
                        />
                        <div
                          className="w-5 h-5 rounded-md border border-black/10 shadow-xs"
                          style={{ backgroundColor: theme.accent }}
                          title="Accent Glow"
                        />
                        <span className="ml-auto text-[10px] text-[var(--text-muted)] font-mono">
                          {theme.isDark ? 'Dark' : 'Warm Light'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Toggle Custom Editor */}
          <div className="pt-2 border-t border-[var(--border-card)]">
            <button
              onClick={() => setIsEditingCustom(!isEditingCustom)}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              {isEditingCustom ? 'Hide Custom Theme Editor' : 'Open Custom Theme Editor (Fine-tune colors & radius)'}
            </button>
          </div>

          {/* Custom Theme Editor Section */}
          {isEditingCustom && (
            <div className="p-4 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-4 animate-in fade-in duration-200">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Custom Color Adjustments
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Primary Color */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewTheme.primary}
                      onChange={(e) => updateCustomToken('primary', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border-card)]"
                    />
                    <span className="text-xs font-mono text-[var(--text-main)] uppercase">
                      {previewTheme.primary}
                    </span>
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewTheme.accent}
                      onChange={(e) => updateCustomToken('accent', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border-card)]"
                    />
                    <span className="text-xs font-mono text-[var(--text-main)] uppercase">
                      {previewTheme.accent}
                    </span>
                  </div>
                </div>

                {/* Background */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    App Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewTheme.bgApp}
                      onChange={(e) => updateCustomToken('bgApp', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border-card)]"
                    />
                    <span className="text-xs font-mono text-[var(--text-main)] uppercase">
                      {previewTheme.bgApp}
                    </span>
                  </div>
                </div>

                {/* Card Surface */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                    Card Surface
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={previewTheme.bgCard}
                      onChange={(e) => updateCustomToken('bgCard', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-[var(--border-card)]"
                    />
                    <span className="text-xs font-mono text-[var(--text-main)] uppercase">
                      {previewTheme.bgCard}
                    </span>
                  </div>
                </div>
              </div>

              {/* Animation Intensity & Density */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--border-card)]">
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5">
                    Animation Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-card)]">
                    {(['minimal', 'normal', 'enhanced'] as AnimationIntensity[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateCustomToken('animationIntensity', level)}
                        className={`text-xs py-1 rounded-md font-medium capitalize transition-colors ${
                          previewTheme.animationIntensity === level
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1.5">
                    UI Density
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-card)]">
                    {(['compact', 'comfortable', 'spacious'] as UIDensity[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => updateCustomToken('uiDensity', d)}
                        className={`text-xs py-1 rounded-md font-medium capitalize transition-colors ${
                          previewTheme.uiDensity === d
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-card)] bg-[var(--bg-app)]">
          <button
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-card)] hover:bg-[var(--bg-card)] text-[var(--text-main)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 shadow-md transition-all"
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
