/**
 * WHO AM I? — Header Component
 * Displays brand identity, active goal, Success Track health pill with recovery guidance,
 * LYRA voice call trigger, theme switcher, and user profile badge.
 */

import React, { useState } from 'react';
import { Goal, UserProfile } from '../../types';
import { LyraAvatar } from '../lyra/LyraAvatar';
import { PhoneCall, Palette, Sparkles, ChevronDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AppHeaderProps {
  user: UserProfile;
  goals: Goal[];
  activeGoal: Goal;
  onSelectGoal: (goalId: string) => void;
  onOpenVoiceCall: () => void;
  onOpenLyraChat: () => void;
  onOpenThemeCustomizer: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  goals,
  activeGoal,
  onSelectGoal,
  onOpenVoiceCall,
  onOpenLyraChat,
  onOpenThemeCustomizer,
}) => {
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const [showTrackInfo, setShowTrackInfo] = useState(false);

  // Status mapping
  const trackConfig = {
    green: {
      label: 'TRACK: HEALTHY',
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
      dot: 'bg-emerald-500',
      icon: CheckCircle,
      description: 'Progressing correctly on schedule with optimal practice performance.',
    },
    yellow: {
      label: 'TRACK: WARNING',
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      description: activeGoal.deviationReason || 'Missed sessions or low accuracy in weak topics detected.',
    },
    red: {
      label: 'TRACK: DEVIATION',
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-600',
      dot: 'bg-rose-500',
      icon: AlertTriangle,
      description: activeGoal.deviationReason || 'Critical milestone risk. Recovery plan recommended.',
    },
  }[activeGoal.trackStatus || 'green'];

  const StatusIcon = trackConfig.icon;

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-card)] px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Active Goal */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onOpenLyraChat}>
            <LyraAvatar state="idle" size="sm" />
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-[var(--text-main)] flex items-center gap-1">
                WHO AM I?
              </h1>
              <p className="text-[10px] text-[var(--text-muted)] font-mono hidden sm:block">
                AI Personal OS • LYRA
              </p>
            </div>
          </div>

          {/* Goal Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowGoalDropdown(!showGoalDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] text-left transition-colors"
            >
              <div className="max-w-[130px] sm:max-w-[200px] truncate">
                <span className="text-[9px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                  Active Goal
                </span>
                <span className="text-xs font-bold text-[var(--text-main)] truncate block">
                  {activeGoal.title}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            </button>

            {showGoalDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                  Switch Active Goal
                </div>
                {goals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      onSelectGoal(g.id);
                      setShowGoalDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      g.id === activeGoal.id
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold'
                        : 'hover:bg-[var(--bg-app)] text-[var(--text-main)]'
                    }`}
                  >
                    <span className="truncate">{g.title}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        g.trackStatus === 'green'
                          ? 'bg-emerald-500'
                          : g.trackStatus === 'yellow'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Success Track Status Indicator */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowTrackInfo(!showTrackInfo)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${trackConfig.bg}`}
          >
            <span className={`w-2 h-2 rounded-full ${trackConfig.dot} animate-pulse`} />
            <span>{trackConfig.label}</span>
            <Info className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showTrackInfo && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl text-left z-50 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-1.5">
                <StatusIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-xs font-bold text-[var(--text-main)]">Track Diagnostics</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-3 leading-relaxed">
                {trackConfig.description}
              </p>
              {activeGoal.recoverySuggestion && (
                <div className="p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] text-[11px] text-[var(--text-main)]">
                  <span className="font-bold text-[var(--primary)] block mb-0.5">Recovery Engine:</span>
                  {activeGoal.recoverySuggestion}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons & Profile */}
        <div className="flex items-center gap-2">
          {/* LYRA Voice Call Trigger */}
          <button
            onClick={onOpenVoiceCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 transition-all text-xs font-semibold shadow-xs"
            title="Launch Real-Time LYRA Voice Call"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Call LYRA</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={onOpenThemeCustomizer}
            className="p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] transition-colors"
            title="Appearance & Themes (Cloud, Dark, Futuristic)"
          >
            <Palette className="w-4 h-4 text-[var(--primary)]" />
          </button>

          {/* User Avatar Badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-[var(--border-card)]">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs flex items-center justify-center border border-[var(--border-card)]">
              {user.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <span className="text-xs font-semibold text-[var(--text-main)] block leading-tight">
                {user.displayName}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono capitalize">
                {activeGoal.intensityMode} mode
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
