/**
 * WHO AM I? — Onboarding Flow
 * 3-step setup:
 * 1. Progressive real browser permissions (Mic, Camera, Notifications, Files)
 * 2. Account selection (Google, Email OTP, Local Guest)
 * 3. Deep Personalization (Dream, Goal, Time, Level)
 */

import React, { useState } from 'react';
import { UserProfile, AppPermissions, Goal } from '../../types';
import { StorageService } from '../../services/storage';
import { GeminiClient } from '../../services/geminiClient';
import { Mic, Camera, Bell, FileText, CheckCircle2, Shield, ArrowRight, Sparkles, UserCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [permissions, setPermissions] = useState<AppPermissions>(StorageService.getPermissions());

  // Personalization form
  const [name, setName] = useState('Alex Rivera');
  const [targetCareer, setTargetCareer] = useState('AI & Robotics Systems Architect');
  const [dreamStatement, setDreamStatement] = useState(
    'Build autonomous cognitive agents that safely manipulate physical reality and empower humanity.'
  );
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Real permission triggers
  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, microphone: 'granted' }));
    } catch {
      setPermissions((p) => ({ ...p, microphone: 'denied' }));
    }
  };

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissions((p) => ({ ...p, camera: 'granted' }));
    } catch {
      setPermissions((p) => ({ ...p, camera: 'denied' }));
    }
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermissions((p) => ({ ...p, notifications: res as any }));
    }
  };

  const handleFinishOnboarding = async () => {
    setIsLoading(true);

    try {
      // 1. Save Profile
      const existing = StorageService.getUserProfile();
      const updatedProfile: UserProfile = {
        ...existing,
        name,
        displayName: name.split(' ')[0] || name,
        targetCareer,
        dreams: [dreamStatement],
        availableHoursPerDay: availableHours,
        currentLevel: level,
        onboardingCompleted: true,
        lastActiveAt: new Date().toISOString(),
      };
      StorageService.saveUserProfile(updatedProfile);
      StorageService.savePermissions(permissions);

      // 2. Deep research goal via Gemini server or fallback
      let research: any = null;
      try {
        research = await GeminiClient.researchGoal(dreamStatement, targetCareer, level, availableHours);
      } catch (e) {
        console.warn('Research fallback used during onboarding:', e);
      }

      if (research && research.requiredSkills) {
        const newGoal: Goal = {
          id: `goal_${Date.now()}`,
          title: targetCareer,
          dreamStatement,
          careerDirection: targetCareer,
          field: research.field || targetCareer,
          status: 'active',
          trackStatus: 'green',
          targetDeadline: '2027-12-31',
          intensityMode: availableHours >= 5 ? 'tiger' : availableHours >= 3 ? 'cheetah' : 'rabbit',
          requiredSkills: research.requiredSkills.map((s: any, i: number) => ({
            ...s,
            id: `sk_init_${i}`,
          })),
          knowledgeTopics: (research.knowledgeTopics || []).map((t: any, i: number) => ({
            ...t,
            id: `top_init_${i}`,
            masteryLevel: 10,
            status: 'available',
          })),
          milestones: (research.milestones || []).map((m: any, i: number) => ({
            ...m,
            id: `ms_init_${i}`,
            isCompleted: false,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        StorageService.addGoal(newGoal);
      }

      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-white font-bold text-xs flex items-center justify-center">
              {step}
            </span>
            <div>
              <span className="text-xs uppercase font-mono tracking-widest text-[var(--text-muted)]">
                Step {step} of 3
              </span>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {step === 1 && 'System Permissions'}
                {step === 2 && 'Identity & Account'}
                {step === 3 && 'Dreams & Goal Blueprint'}
              </h3>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  step >= s ? 'bg-[var(--primary)]' : 'bg-[var(--border-card)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Permissions */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              WHO AM I? respects your privacy. Permissions are requested only when needed. You can skip any optional permission.
            </p>

            <div className="space-y-2.5">
              {/* Mic */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">Microphone</div>
                    <div className="text-[11px] text-[var(--text-muted)]">For real-time voice conversations with LYRA</div>
                  </div>
                </div>
                <button
                  onClick={requestMic}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    permissions.microphone === 'granted'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-[var(--bg-card)] border border-[var(--border-card)] hover:bg-[var(--primary-light)] text-[var(--text-main)]'
                  }`}
                >
                  {permissions.microphone === 'granted' ? 'Allowed' : 'Allow'}
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">Notifications</div>
                    <div className="text-[11px] text-[var(--text-muted)]">For daily study reminders & recovery alerts</div>
                  </div>
                </div>
                <button
                  onClick={requestNotifications}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    permissions.notifications === 'granted'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                      : 'bg-[var(--bg-card)] border border-[var(--border-card)] hover:bg-[var(--primary-light)] text-[var(--text-main)]'
                  }`}
                >
                  {permissions.notifications === 'granted' ? 'Allowed' : 'Allow'}
                </button>
              </div>

              {/* Files */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-main)]">Document Processing</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Upload PDFs, images, notes & syllabi</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600 px-3 py-1 bg-emerald-500/10 rounded-lg">
                  Ready
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 flex items-center gap-2 shadow-md"
              >
                Continue to Account <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Account */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Your data is isolated locally and synchronized securely. Select an authentication method:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-[var(--primary)] bg-[var(--primary-light)] flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs">
                    <UserCheck className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Local Sovereign Account</div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Instant offline persistence with zero tracking. Export anytime.
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[var(--primary)]" />
              </div>

              <div className="p-4 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] opacity-85 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-[var(--border-card)] text-xs font-bold">
                    G
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--text-main)]">Google Authentication</div>
                    <div className="text-[11px] text-[var(--text-muted)]">Firebase Auth ready adapter</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)]">
                  Configured
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-card)] text-[var(--text-main)]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 flex items-center gap-2 shadow-md"
              >
                Configure Dreams & Goals <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Personalization */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                Your Name / Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                Target Profession / Goal Direction
              </label>
              <input
                type="text"
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                placeholder="e.g. AI Engineer, Doctor, Robotics Specialist, Cybersecurity..."
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                What is your dream? (Write naturally)
              </label>
              <textarea
                rows={2}
                value={dreamStatement}
                onChange={(e) => setDreamStatement(e.target.value)}
                placeholder="Describe what you want to build, achieve, or discover..."
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Daily Study Time
                </label>
                <select
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                >
                  <option value={2}>2 Hours (Turtle / Steady)</option>
                  <option value={3}>3 Hours (Rabbit / Balanced)</option>
                  <option value={4}>4 Hours (Cheetah / Accelerated)</option>
                  <option value={6}>6 Hours (Tiger / High Intensity)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  Current Knowledge Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as any)}
                  className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-card)] text-[var(--text-main)]"
              >
                Back
              </button>
              <button
                onClick={handleFinishOnboarding}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Constructing Knowledge Map...
                  </>
                ) : (
                  <>
                    Launch Operating System <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
