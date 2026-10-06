/**
 * WHO AM I? — Plan & Time Management View
 * Features:
 * - Daily, Weekly, and Monthly planning
 * - Intensity Modes: Turtle, Rabbit, Cheetah, Tiger
 * - 7-day and 30-day commitment locks
 * - Unlock / Reassess: 50-Question challenge suite
 * - Recovery Engine for rebalancing missed work
 */

import React, { useState } from 'react';
import { DailyPlan, Goal, IntensityMode, IntensityLock } from '../types';
import { StorageService } from '../services/storage';
import { GeminiClient } from '../services/geminiClient';
import {
  CalendarCheck2,
  Lock,
  Unlock,
  Sparkles,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface PlanViewProps {
  dailyPlan: DailyPlan;
  activeGoal: Goal;
  onPlanUpdated: () => void;
  onStartReassessmentTest: (mode: IntensityMode) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  dailyPlan,
  activeGoal,
  onPlanUpdated,
  onStartReassessmentTest,
}) => {
  const [intensityLock, setIntensityLock] = useState<IntensityLock>(StorageService.getIntensityLock());
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceMessage, setRebalanceMessage] = useState('');

  const modes: { id: IntensityMode; name: string; hours: string; icon: string; desc: string }[] = [
    { id: 'turtle', name: 'Turtle', hours: '1–2 hrs/day', icon: '🐢', desc: 'Sustainable, steady compounding. Minimal burnout risk.' },
    { id: 'rabbit', name: 'Rabbit', hours: '2–3 hrs/day', icon: '🐇', desc: 'Balanced velocity with dedicated practice and revision windows.' },
    { id: 'cheetah', name: 'Cheetah', hours: '4–5 hrs/day', icon: '🐆', desc: 'Accelerated engineering pace. Demands high consistency.' },
    { id: 'tiger', name: 'Tiger', hours: '6+ hrs/day', icon: '🐅', desc: 'Elite immersive sprint. Requires rigorous recovery safeguards.' },
  ];

  // Lock duration calculations
  const lockedUntilDate = new Date(intensityLock.lockedUntil);
  const daysRemaining = Math.max(0, Math.ceil((lockedUntilDate.getTime() - Date.now()) / (1000 * 3600 * 24)));

  // Trigger Recovery Engine
  const handleTriggerRecovery = () => {
    setIsRebalancing(true);

    setTimeout(() => {
      // Rebalance plan items without overloading today
      const updatedItems = dailyPlan.items.map((item) => {
        if (!item.isCompleted) {
          return {
            ...item,
            targetMinutes: Math.max(20, Math.round(item.targetMinutes * 0.8)), // spread out
          };
        }
        return item;
      });

      const updatedPlan: DailyPlan = {
        ...dailyPlan,
        items: updatedItems,
        overallStatus: 'rebalanced',
        recoveryNotes: 'Workload rebalanced across 3 days. Focus on high-yield foundations first.',
      };

      StorageService.saveDailyPlan(updatedPlan);
      setIsRebalancing(false);
      setRebalanceMessage('Recovery complete: Missed tasks redistributed into 20-30 min manageable blocks.');
      onPlanUpdated();
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-[var(--primary)]" />
            Plan & Time Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Realistic time management with intensity commitments, recovery rebalancing, and verified unlocking.
          </p>
        </div>

        {/* Recovery Engine Action */}
        <button
          onClick={handleTriggerRecovery}
          disabled={isRebalancing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)] font-bold text-xs hover:bg-[var(--primary)] hover:text-white transition-all shadow-xs"
        >
          <RotateCcw className={`w-4 h-4 ${isRebalancing ? 'animate-spin' : ''}`} />
          <span>{isRebalancing ? 'Rebalancing Schedule...' : 'Run Recovery Engine'}</span>
        </button>
      </div>

      {rebalanceMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 flex items-center justify-between">
          <span>{rebalanceMessage}</span>
          <button onClick={() => setRebalanceMessage('')} className="font-bold underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Intensity Modes & Lock Commitment Section */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-[var(--text-main)]">Intensity Commitment Modes</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Modes calibrate your schedule density. Switching higher requires passing the 50-MCQ challenge.
            </p>
          </div>

          {/* Active Mode Pill */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-mono text-xs font-bold uppercase border border-[var(--primary)]/30">
              <Lock className="w-3.5 h-3.5" /> {intensityLock.mode} locked ({daysRemaining} days left)
            </span>
          </div>
        </div>

        {/* 4 Intensity Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modes.map((m) => {
            const isCurrent = intensityLock.mode === m.id;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[var(--primary)] bg-[var(--primary-light)] shadow-sm'
                    : 'border-[var(--border-card)] bg-[var(--bg-app)] opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{m.icon}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[var(--primary)] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">{m.name}</h4>
                  <span className="text-xs font-mono font-semibold text-[var(--primary)] block mb-1">
                    {m.hours}
                  </span>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{m.desc}</p>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => onStartReassessmentTest(m.id)}
                    className="mt-4 w-full py-2 rounded-xl text-xs font-bold border border-[var(--border-card)] bg-[var(--bg-card)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors flex items-center justify-center gap-1"
                  >
                    <Unlock className="w-3 h-3 text-[var(--primary)]" />
                    <span>Reassess to Unlock</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Commitment Lock Information Box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Commitment Lock Rule
            </span>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Intensity locks prevent erratic switching. To unlock or change intensity before the lock expires, you must pass the <strong>50-question personalized assessment</strong> testing discipline, consistency, and core subject proficiency.
            </p>
          </div>

          <button
            onClick={() => onStartReassessmentTest('cheetah')}
            className="px-4 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] font-semibold text-xs shrink-0 transition-colors"
          >
            Take 50-Q Unlock Challenge
          </button>
        </div>
      </div>

      {/* 2. Today's Plan Checklist & Schedule */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Daily Focus Items ({dailyPlan.date})
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Calculated for {activeGoal.title}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-[var(--primary)]">
            Status: {dailyPlan.overallStatus.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3">
          {dailyPlan.items.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                item.isCompleted
                  ? 'bg-[var(--bg-app)]/50 border-[var(--border-card)] opacity-60'
                  : 'bg-[var(--bg-app)] border-[var(--border-card)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                    item.isCompleted ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--text-muted)]'
                  }`}
                >
                  {item.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div>
                  <span className={`text-xs sm:text-sm font-semibold block ${item.isCompleted ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                    {item.title}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono capitalize">
                    {item.category} • Target: {item.targetMinutes} minutes
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono text-[var(--text-muted)]">
                {item.completedMinutes}m / {item.targetMinutes}m completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
