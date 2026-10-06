/**
 * WHO AM I? — Settings & Appearance View
 * Controls:
 * - Appearance & Themes (Default Futuristic, Cloud warm white+brown, Midnight, Minimal Light, Deep Space)
 * - AI Provider Connections (OpenAI, Gemini, NotebookLM export, Firebase, Workspace)
 * - Permissions & Privacy
 * - Profile and Data Export/Import
 */

import React, { useState } from 'react';
import { UserProfile, AppPermissions, ExternalIntegration, LyraVoiceSettings } from '../types';
import { StorageService } from '../services/storage';
import { GeminiClient } from '../services/geminiClient';
import { THEME_PRESETS, getStoredTheme } from '../services/themeEngine';
import {
  Settings,
  Palette,
  Cpu,
  Shield,
  User,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Database,
  Globe,
  ArrowRight,
  Volume2,
  Music,
  Mic,
} from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  onOpenThemeCustomizer: () => void;
  onProfileUpdated: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onOpenThemeCustomizer,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(user);
  const [permissions, setPermissions] = useState<AppPermissions>(StorageService.getPermissions());
  const [integrations, setIntegrations] = useState<ExternalIntegration[]>(StorageService.getIntegrations());
  const [voiceSettings, setVoiceSettings] = useState<LyraVoiceSettings>(StorageService.getVoiceSettings());
  const [isVoiceTesting, setIsVoiceTesting] = useState(false);
  const [isVoiceSaved, setIsVoiceSaved] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [exportNotice, setExportNotice] = useState('');

  const currentTheme = getStoredTheme();

  const handleSaveVoiceSettings = () => {
    StorageService.saveVoiceSettings(voiceSettings);
    setIsVoiceSaved(true);
    setTimeout(() => setIsVoiceSaved(false), 2000);
  };

  const handleTestVoiceAudio = async () => {
    setIsVoiceTesting(true);
    await GeminiClient.testVoice();
    setIsVoiceTesting(false);
  };

  const handleSaveProfile = () => {
    StorageService.saveUserProfile(profile);
    setIsSaved(true);
    onProfileUpdated();
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Export Data as JSON
  const handleExportData = () => {
    const data = {
      profile: StorageService.getUserProfile(),
      goals: StorageService.getGoals(),
      resources: StorageService.getResources(),
      questions: StorageService.getQuestions(),
      attempts: StorageService.getAttempts(),
      dailyPlan: StorageService.getDailyPlan(),
      nexora: StorageService.getNexoraProjects(),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `who_am_i_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Export complete! Downloaded sovereign JSON backup.');
    setTimeout(() => setExportNotice(''), 4000);
  };

  // NotebookLM Export Workflow
  const handleExportForNotebookLM = () => {
    const activeGoal = StorageService.getActiveGoal();
    const resources = StorageService.getResources();

    let md = `# WHO AM I? — Research Dossier: ${activeGoal.title}\n\n`;
    md += `## Dream & Purpose\n${activeGoal.dreamStatement}\n\n`;
    md += `## Core Skills Architecture\n`;
    activeGoal.requiredSkills.forEach((s) => {
      md += `- **${s.name}** (Target: ${s.targetMastery}%): ${s.subtopics.join(', ')}\n`;
    });
    md += `\n## Resources & Knowledge Notes\n`;
    resources.forEach((r) => {
      md += `### ${r.title}\n${r.summary || r.extractedText.slice(0, 500)}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notebooklm_source_pack_${activeGoal.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Generated structured Markdown notebook source pack ready for import into NotebookLM!');
    setTimeout(() => setExportNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
          <Settings className="w-6 h-6 text-[var(--primary)]" />
          System Settings & Appearance
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Manage visual theme styling, AI orchestrator connections, permissions, and sovereign user data.
        </p>
      </div>

      {exportNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 flex items-center justify-between">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice('')} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. APPEARANCE & THEMES SECTION */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Visual Appearance & Themes</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Active: <strong className="text-[var(--primary)]">{currentTheme.name}</strong> • Density: {currentTheme.uiDensity} • Animation: {currentTheme.animationIntensity}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenThemeCustomizer}
            className="px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-2 transition-all"
          >
            <Palette className="w-4 h-4" />
            <span>Customize Appearance</span>
          </button>
        </div>

        {/* Theme Showcase Summary */}
        <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[var(--text-main)] block mb-0.5">
              Featured: The Cloud Theme (Warm White & Brown)
            </span>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Warm off-white surface, rich amber-brown accents, soft neutral cards, and calm visual rhythm designed for prolonged deep study.
            </p>
          </div>

          <button
            onClick={onOpenThemeCustomizer}
            className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
          >
            Open Theme Switcher <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. LYRA VOICE & SPEECH CUSTOMIZATION (MEETHA AWAZ & PERSONA) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">LYRA Voice & Speech Customization</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Customize voice sweetness, pitch, speech speed, and language for real-time calls and audio explanations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestVoiceAudio}
              disabled={isVoiceTesting}
              className="px-4 py-2.5 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isVoiceTesting ? 'Playing Voice...' : 'Test Lyra Voice (आवाज़ सुनें 🌸)'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Persona */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Voice Persona
            </label>
            <select
              value={voiceSettings.persona}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, persona: e.target.value as any })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
            >
              <option value="sweet_fairy">🌸 Sweet Fairy (मीठी व प्यारी परी)</option>
              <option value="warm_mentor">🌟 Warm Mentor (शांत मार्गदर्शक)</option>
              <option value="gentle_calm">🍃 Gentle & Calm (धीमी व मधुर)</option>
              <option value="clear_guide">🚀 Clear Guide (तेज व स्पष्ट)</option>
            </select>
          </div>

          {/* Language Preference */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Voice Language
            </label>
            <select
              value={voiceSettings.language}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, language: e.target.value as any })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
            >
              <option value="auto">⚡ Auto-Detect (Hindi / English)</option>
              <option value="hi-IN">🇮🇳 Hindi & Hinglish (प्राथमिक)</option>
              <option value="en-US">🌐 Global English (US)</option>
            </select>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] mb-1">
              <span>Voice Pitch (Sweetness)</span>
              <span className="font-mono text-[var(--primary)]">{voiceSettings.pitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={voiceSettings.pitch}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseFloat(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
            <span className="text-[10px] text-[var(--text-muted)] block">Higher is sweeter & lighter</span>
          </div>

          {/* Speed Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)] mb-1">
              <span>Speech Speed</span>
              <span className="font-mono text-[var(--primary)]">{voiceSettings.rate}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.3"
              step="0.05"
              value={voiceSettings.rate}
              onChange={(e) => setVoiceSettings({ ...voiceSettings, rate: parseFloat(e.target.value) })}
              className="w-full accent-[var(--primary)]"
            />
            <span className="text-[10px] text-[var(--text-muted)] block">1.0x is natural pace</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveVoiceSettings}
            className="px-5 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-1.5 transition-all"
          >
            {isVoiceSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isVoiceSaved ? 'Voice Settings Saved!' : 'Save Voice Preferences'}</span>
          </button>
        </div>
      </div>

      {/* 3. AI CONNECTIONS & ORCHESTRATION ARCHITECTURE */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-base font-bold text-[var(--text-main)]">AI Connections & Provider Orchestrator</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Server-side routing architecture for Gemini, OpenAI adapters, NotebookLM research export, and Firebase storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-main)]">{item.name}</span>
                <span
                  className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                    item.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : item.status === 'configured'
                      ? 'bg-sky-500/10 text-sky-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1 pt-1">
                {item.capabilities.map((c, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)] font-mono"
                  >
                    {c}
                  </span>
                ))}
              </div>

              {item.id === 'int_notebooklm' && (
                <div className="pt-2">
                  <button
                    onClick={handleExportForNotebookLM}
                    className="w-full py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--primary)] text-[var(--text-main)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span>Export Structured Dossier for NotebookLM</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. USER PROFILE SETTINGS */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            <h3 className="text-base font-bold text-[var(--text-main)]">User Profile & Daily Cadence</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Personalize your display identity, default study allocation, and career focus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Display Name</label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Daily Study Hours</label>
            <select
              value={profile.availableHoursPerDay}
              onChange={(e) => setProfile({ ...profile, availableHoursPerDay: Number(e.target.value) })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
            >
              <option value={2}>2 Hours / day</option>
              <option value={3}>3 Hours / day</option>
              <option value={4}>4 Hours / day</option>
              <option value={6}>6 Hours / day</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Experience Level</label>
            <select
              value={profile.currentLevel}
              onChange={(e) => setProfile({ ...profile, currentLevel: e.target.value as any })}
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all flex items-center gap-1.5"
          >
            {isSaved && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
            <span>{isSaved ? 'Changes Saved!' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </div>

      {/* 4. SOVEREIGN DATA MANAGEMENT */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="pb-3 border-b border-[var(--border-card)]">
          <h3 className="text-base font-bold text-[var(--text-main)]">Sovereign Data & Backup</h3>
          <p className="text-xs text-[var(--text-muted)]">
            Export all your curriculum, goals, questions, and attempt logs to a portable JSON backup.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] hover:border-[var(--primary)] text-[var(--text-main)] text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-[var(--primary)]" />
            <span>Export Complete JSON Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all stored data to factory defaults?')) {
                StorageService.resetAllData();
                window.location.reload();
              }
            }}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Factory Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};
