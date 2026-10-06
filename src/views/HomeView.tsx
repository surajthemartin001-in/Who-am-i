/**
 * WHO AM I? — Home View
 * Displays Intelligent Daily Briefing from LYRA, broad Success Track visualization,
 * today's study items, and rapid launch pad.
 */

import React from 'react';
import { Goal, UserProfile, DailyPlan } from '../types';
import { LyraAvatar } from '../components/lyra/LyraAvatar';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  PhoneCall,
  Brain,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react';

interface HomeViewProps {
  user: UserProfile;
  activeGoal: Goal;
  dailyPlan: DailyPlan;
  onNavigate: (tab: any) => void;
  onOpenVoiceCall: () => void;
  onStartPractice: (packId?: string) => void;
  onTogglePlanItem: (itemId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  activeGoal,
  dailyPlan,
  onNavigate,
  onOpenVoiceCall,
  onStartPractice,
  onTogglePlanItem,
}) => {
  const completedTasks = dailyPlan.items.filter((i) => i.isCompleted).length;
  const totalTasks = dailyPlan.items.length;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Track state details
  const trackColors = {
    green: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-600',
      badge: 'bg-emerald-500 text-white',
      desc: 'Optimal velocity. Your consistency and practice scores indicate you are right on target.',
    },
    yellow: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-500/5',
      text: 'text-amber-600',
      badge: 'bg-amber-500 text-white',
      desc: activeGoal.deviationReason || 'Slight lag detected in scheduled hours or weak topics. Recovery active.',
    },
    red: {
      border: 'border-rose-500/40',
      bg: 'bg-rose-500/5',
      text: 'text-rose-600',
      badge: 'bg-rose-500 text-white',
      desc: activeGoal.deviationReason || 'Severe deviation risk. Complete recovery drills before advancing.',
    },
  }[activeGoal.trackStatus || 'green'];

  return (
    <div className="space-y-6">
      {/* 0. Compact Prominent LYRA Shortcut Bar */}
      <div className="rounded-3xl p-4 sm:p-5 bg-[var(--bg-card)] border-2 border-[var(--primary)]/30 hover:border-[var(--primary)] shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4">
        <div
          onClick={() => onNavigate('lyra')}
          className="flex items-center gap-3.5 cursor-pointer w-full md:w-auto"
        >
          <LyraAvatar state="idle" size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[var(--primary)]">
                LYRA Control Center
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-mono font-bold">
                Tap to Open
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Ask questions, give app commands, create documents, or call LYRA.
            </p>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={onOpenVoiceCall}
            className="px-3.5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-xs transition-all"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Voice Call</span>
          </button>
          <button
            onClick={() => onNavigate('lyra')}
            className="px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>Chat & Commands</span>
          </button>
          <button
            onClick={() => onNavigate('resources')}
            className="px-3 py-2 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* 1. LYRA Intelligent Morning Briefing Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <LyraAvatar state="idle" size="lg" showLabel={true} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-bold">
                  Daily Briefing
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">• {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] mb-2">
                Good day, {user.displayName}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-2xl leading-relaxed">
                You are pursuing <strong className="text-[var(--text-main)]">{activeGoal.title}</strong> in{' '}
                <span className="capitalize font-semibold text-[var(--primary)]">{activeGoal.intensityMode} mode</span> ({user.availableHoursPerDay} hrs/day).
                Today your highest priority is mastering attention algorithms and reinforcing rotation geometries.
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
            <button
              onClick={onOpenVoiceCall}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Voice Call LYRA</span>
            </button>
            <button
              onClick={() => onStartPractice()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] text-[var(--text-main)] font-semibold text-xs transition-colors"
            >
              <Brain className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Quick Practice</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Success Track Visualization */}
      <div className={`rounded-3xl p-6 border ${trackColors.border} ${trackColors.bg} bg-[var(--bg-card)] transition-colors shadow-xs`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <TrendingUp className={`w-5 h-5 ${trackColors.text}`} />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Success Track: {activeGoal.title}
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Broad trajectory toward destination deadline ({activeGoal.targetDeadline})
              </p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${trackColors.badge}`}>
            {activeGoal.trackStatus} TRACK
          </span>
        </div>

        {/* Visual Broad Track Representation */}
        <div className="relative py-4">
          <div className="w-full h-8 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] relative overflow-hidden flex items-center px-4">
            {/* Broad Track Corridor */}
            <div
              className="h-full absolute left-0 top-0 rounded-2xl opacity-40 transition-all duration-500"
              style={{
                width: '68%',
                background:
                  activeGoal.trackStatus === 'green'
                    ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                    : activeGoal.trackStatus === 'yellow'
                    ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)'
                    : 'linear-gradient(90deg, #EF4444 0%, #B91C1C 100%)',
              }}
            />

            {/* User Position in Corridor */}
            <div
              className="absolute z-10 flex items-center gap-2 -translate-x-1/2"
              style={{ left: '68%' }}
            >
              <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center ring-4 ring-white shadow-md">
                YOU
              </div>
            </div>

            <div className="w-full flex justify-between text-[10px] font-mono font-bold text-[var(--text-muted)] z-0">
              <span>Foundation Start</span>
              <span className="text-[var(--text-main)] font-semibold">Active Milestone 2</span>
              <span>Mastery Goal</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2">
          <p className="text-[var(--text-muted)] leading-relaxed max-w-xl">
            {trackColors.desc}
          </p>
          {activeGoal.recoverySuggestion && (
            <button
              onClick={() => onNavigate('revision')}
              className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1 shrink-0"
            >
              Execute Recovery Plan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Two-Column Dashboard: Today's Plan & Fast Launch Pad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Plan Checklist */}
        <div className="lg:col-span-2 rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">Today's Focus Plan</h3>
              <p className="text-xs text-[var(--text-muted)]">
                {completedTasks} of {totalTasks} items completed ({percentComplete}%)
              </p>
            </div>
            <button
              onClick={() => onNavigate('plan')}
              className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              View Full Plan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] overflow-hidden mb-4">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Items */}
          <div className="space-y-2.5">
            {dailyPlan.items.map((item) => (
              <div
                key={item.id}
                onClick={() => onTogglePlanItem(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.isCompleted
                    ? 'bg-[var(--bg-app)]/50 border-[var(--border-card)] opacity-65'
                    : 'bg-[var(--bg-app)] border-[var(--border-card)] hover:border-[var(--primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      item.isCompleted
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                        : 'border-[var(--text-muted)]/40 bg-[var(--bg-card)]'
                    }`}
                  >
                    {item.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <div>
                    <span
                      className={`text-xs sm:text-sm font-medium block ${
                        item.isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono capitalize">
                      {item.category} • {item.targetMinutes} mins
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]">
                  {item.completedMinutes}m / {item.targetMinutes}m
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Jump Actions */}
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
              Fast Launch Pad
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('practice')}
                className="w-full text-left p-3 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Adaptive Practice</div>
                    <div className="text-[10px] text-[var(--text-muted)]">AI Auto or 3-Level Config</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>

              <button
                onClick={() => onNavigate('revision')}
                className="w-full text-left p-3 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Spaced Revision</div>
                    <div className="text-[10px] text-[var(--text-muted)]">Reinforce weak topics</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>

              <button
                onClick={() => onNavigate('resources')}
                className="w-full text-left p-3 rounded-2xl bg-[var(--bg-app)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-card)] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Import & Intelligence</div>
                    <div className="text-[10px] text-[var(--text-muted)]">PDFs, notes & syllabi</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* Active Goal Quick Summary Card */}
          <div className="rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Goal Dream Statement
            </h4>
            <blockquote className="text-xs italic text-[var(--text-main)] border-l-2 border-[var(--primary)] pl-3 py-1 my-2">
              "{activeGoal.dreamStatement}"
            </blockquote>
            <button
              onClick={() => onNavigate('goals')}
              className="text-xs font-semibold text-[var(--primary)] hover:underline mt-2 flex items-center gap-1"
            >
              Explore Knowledge Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
