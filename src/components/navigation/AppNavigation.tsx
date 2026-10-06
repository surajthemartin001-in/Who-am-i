/**
 * WHO AM I? — Navigation Bar
 * Responsive bottom-bar on mobile / top-tab bar on desktop.
 * Primary modules: Home, Goals, Resources, Plan, Practice, Revision, Questions, Analytics, NEXORA, Settings.
 */

import React from 'react';
import {
  Compass,
  Target,
  FileBox,
  CalendarCheck2,
  Brain,
  RotateCcw,
  BookOpen,
  LineChart,
  Cpu,
  Settings,
  Sparkles,
} from 'lucide-react';

export type NavigationTab =
  | 'home'
  | 'lyra'
  | 'goals'
  | 'resources'
  | 'plan'
  | 'practice'
  | 'revision'
  | 'questions'
  | 'analytics'
  | 'nexora'
  | 'settings';

interface AppNavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { id: NavigationTab; label: string; icon: any; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'lyra', label: 'LYRA', icon: Sparkles, badge: 'OS' },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'resources', label: 'Resources', icon: FileBox },
    { id: 'plan', label: 'Plan', icon: CalendarCheck2 },
    { id: 'practice', label: 'Practice', icon: Brain },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
    { id: 'questions', label: 'Questions', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'nexora', label: 'NEXORA', icon: Cpu, badge: 'PRO' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-[var(--bg-card)] border-b border-[var(--border-card)] px-3 sm:px-6 sticky top-[57px] z-30 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative shrink-0 ${
                isActive
                  ? 'bg-[var(--primary)] text-[var(--primary-text)] shadow-xs font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] px-1 py-0.2 rounded-md bg-[var(--accent)] text-white font-mono tracking-tight font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
