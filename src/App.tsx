/**
 * WHO AM I? — Personal AI Operating System
 * Central Application Root
 */

import React, { useState, useEffect } from 'react';
import { StorageService, subscribeToStore } from './services/storage';
import { getStoredTheme, applyThemeToDOM } from './services/themeEngine';
import { UserProfile, Goal, DailyPlan, QuestionPack, Question, IntensityMode } from './types';
import { AppHeader } from './components/navigation/AppHeader';
import { AppNavigation, NavigationTab } from './components/navigation/AppNavigation';
import { LyraAvatar } from './components/lyra/LyraAvatar';
import { LyraChatModal } from './components/lyra/LyraChatModal';
import { LyraVoiceCall } from './components/lyra/LyraVoiceCall';
import { ThemeCustomizerModal } from './components/themes/ThemeCustomizerModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

// Views
import { HomeView } from './views/HomeView';
import { LyraWorkspaceView } from './views/LyraWorkspaceView';
import { GoalsView } from './views/GoalsView';
import { ResourcesView } from './views/ResourcesView';
import { PlanView } from './views/PlanView';
import { PracticeView } from './views/PracticeView';
import { RevisionView } from './views/RevisionView';
import { QuestionsView } from './views/QuestionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { NexoraView } from './views/NexoraView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [user, setUser] = useState<UserProfile>(StorageService.getUserProfile());
  const [goals, setGoals] = useState<Goal[]>(StorageService.getGoals());
  const [activeGoal, setActiveGoal] = useState<Goal>(StorageService.getActiveGoal());
  const [dailyPlan, setDailyPlan] = useState<DailyPlan>(StorageService.getDailyPlan());

  // UI State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isLyraChatOpen, setIsLyraChatOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!user.onboardingCompleted);

  // Active Practice Pack State
  const [activePracticeQuestions, setActivePracticeQuestions] = useState<Question[] | undefined>(undefined);

  // Apply Theme & Listen for Store Updates
  useEffect(() => {
    const theme = getStoredTheme();
    applyThemeToDOM(theme);

    const unsubscribe = subscribeToStore(() => {
      setUser(StorageService.getUserProfile());
      setGoals(StorageService.getGoals());
      setActiveGoal(StorageService.getActiveGoal());
      setDailyPlan(StorageService.getDailyPlan());
    });

    return () => unsubscribe();
  }, []);

  const handleSelectGoal = (goalId: string) => {
    StorageService.setActiveGoalId(goalId);
    setActiveGoal(StorageService.getActiveGoal());
  };

  const handleTogglePlanItem = (itemId: string) => {
    const updatedItems = dailyPlan.items.map((i) =>
      i.id === itemId
        ? {
            ...i,
            isCompleted: !i.isCompleted,
            completedMinutes: !i.isCompleted ? i.targetMinutes : 0,
          }
        : i
    );
    const updatedPlan: DailyPlan = { ...dailyPlan, items: updatedItems };
    StorageService.saveDailyPlan(updatedPlan);
    setDailyPlan(updatedPlan);
  };

  // Launch specific question pack
  const handleLaunchPack = (pack: QuestionPack) => {
    setActivePracticeQuestions(pack.questions);
    setActiveTab('practice');
  };

  // Start 50-Q Reassessment Test
  const handleStartReassessmentTest = (mode: IntensityMode) => {
    // Generate 50 questions suite
    const challengeQuestions: Question[] = Array.from({ length: 50 }).map((_, i) => ({
      id: `reassess_q_${i + 1}`,
      questionText: `[Question ${i + 1} of 50 — ${mode.toUpperCase()} Mode Reassessment Assessment] In the context of ${activeGoal.title}: When unexpected schedule disruption occurs, what is the mathematically sustainable recovery protocol?`,
      type: 'single_mcq',
      difficulty: 'hard',
      field: activeGoal.field,
      subject: activeGoal.title,
      chapter: 'Discipline & System Architecture',
      topic: 'Workload Redistribution',
      options: [
        'Run the Recovery Engine: rebalance missed workload across multiple days without eliminating sleep or breaks',
        'Cram 20 hours into a single sleep-deprived sprint',
        'Abandon the goal and reset progress to zero',
        'Ignore all missed work and pretend nothing happened',
      ],
      correctAnswer: '0',
      explanation: 'High-intensity modes require disciplined rebalancing rather than volatile binge-burnout cycles.',
      relatedConcepts: ['Cognitive Fatigue', 'Spaced Repetition', 'Workload Balancing'],
      sourceType: 'ai_generated',
      isAiGenerated: true,
      createdAt: new Date().toISOString(),
    }));

    setActivePracticeQuestions(challengeQuestions);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col transition-colors duration-200 selection:bg-[var(--primary)] selection:text-white">
      {/* 1. Header */}
      <AppHeader
        user={user}
        goals={goals}
        activeGoal={activeGoal}
        onSelectGoal={handleSelectGoal}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
        onOpenLyraChat={() => setIsLyraChatOpen(true)}
        onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
      />

      {/* 2. Primary Navigation Bar */}
      <AppNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 3. Main View Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'home' && (
          <HomeView
            user={user}
            activeGoal={activeGoal}
            dailyPlan={dailyPlan}
            onNavigate={setActiveTab}
            onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
            onStartPractice={(packId) => {
              setActivePracticeQuestions(undefined);
              setActiveTab('practice');
            }}
            onTogglePlanItem={handleTogglePlanItem}
          />
        )}

        {activeTab === 'lyra' && (
          <LyraWorkspaceView
            activeGoal={activeGoal}
            onNavigateTab={setActiveTab}
            onStartPracticePack={(packId) => {
              setActivePracticeQuestions(undefined);
              setActiveTab('practice');
            }}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={goals}
            activeGoal={activeGoal}
            onSelectGoal={handleSelectGoal}
            onGoalUpdated={() => {
              setGoals(StorageService.getGoals());
              setActiveGoal(StorageService.getActiveGoal());
            }}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            onStartPracticeWithDoc={(doc) => {
              setActivePracticeQuestions(undefined);
              setActiveTab('practice');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'plan' && (
          <PlanView
            dailyPlan={dailyPlan}
            activeGoal={activeGoal}
            onPlanUpdated={() => setDailyPlan(StorageService.getDailyPlan())}
            onStartReassessmentTest={handleStartReassessmentTest}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            activeGoal={activeGoal}
            initialPackQuestions={activePracticeQuestions}
            onOpenLyraChatWithContext={(query) => setIsLyraChatOpen(true)}
          />
        )}

        {activeTab === 'revision' && (
          <RevisionView
            activeGoal={activeGoal}
            onStartRevisionSession={(revQuestions) => {
              setActivePracticeQuestions(revQuestions);
              setActiveTab('practice');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsView onLaunchPack={handleLaunchPack} onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'analytics' && <AnalyticsView user={user} activeGoal={activeGoal} />}

        {activeTab === 'nexora' && <NexoraView />}

        {activeTab === 'settings' && (
          <SettingsView
            user={user}
            onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
            onProfileUpdated={() => setUser(StorageService.getUserProfile())}
          />
        )}
      </main>

      {/* 4. Floating LYRA Fairy Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <div
          onClick={() => setIsLyraChatOpen(true)}
          className="group flex items-center gap-2 p-2 sm:px-4 sm:py-2.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xl hover:border-[var(--primary)] cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
          title="Open LYRA Chat Assistant"
        >
          <LyraAvatar state="idle" size="sm" />
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-[var(--text-main)] block leading-tight">
              Ask LYRA
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              AI Operating System
            </span>
          </div>
        </div>
      </div>

      {/* 5. Modals & Full-Screen Interfaces */}
      <LyraChatModal
        isOpen={isLyraChatOpen}
        onClose={() => setIsLyraChatOpen(false)}
        onNavigateTab={setActiveTab}
        onStartPracticePack={(packId) => {
          setActivePracticeQuestions(undefined);
          setActiveTab('practice');
        }}
      />

      <LyraVoiceCall isOpen={isVoiceCallOpen} onClose={() => setIsVoiceCallOpen(false)} />

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        onThemeChanged={() => {}}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          setUser(StorageService.getUserProfile());
          setGoals(StorageService.getGoals());
          setActiveGoal(StorageService.getActiveGoal());
        }}
      />
    </div>
  );
}
