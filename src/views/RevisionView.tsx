/**
 * WHO AM I? — Revision Engine View
 * Spaced repetition and targeted reinforcement for weak topics,
 * saved questions, and missed attempts.
 */

import React, { useState } from 'react';
import { Question, Goal } from '../types';
import { StorageService } from '../services/storage';
import {
  RotateCcw,
  Bookmark,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  Brain,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface RevisionViewProps {
  activeGoal: Goal;
  onStartRevisionSession: (questions: Question[]) => void;
  onNavigateTab: (tab: any) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  activeGoal,
  onStartRevisionSession,
  onNavigateTab,
}) => {
  const allQuestions = StorageService.getQuestions();
  const savedIds = StorageService.getSavedQuestionIds();
  const attempts = StorageService.getAttempts();

  const savedQuestions = allQuestions.filter((q) => savedIds.includes(q.id));
  const missedAttempts = attempts.filter((a) => !a.isCorrect);
  const missedQuestionIds = new Set(missedAttempts.map((a) => a.questionId));
  const missedQuestions = allQuestions.filter((q) => missedQuestionIds.has(q.id));

  const weakTopics = activeGoal.knowledgeTopics.filter((t) => t.isWeakArea || t.masteryLevel < 50);

  const [activeTab, setActiveTab] = useState<'saved' | 'missed' | 'weak_topics'>('saved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-[var(--primary)]" />
            Intelligent Revision Engine
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Algorithmic spaced repetition targeting missed questions, saved problems, and vulnerable topics.
          </p>
        </div>

        <button
          onClick={() => {
            const set = savedQuestions.length > 0 ? savedQuestions : allQuestions.slice(0, 5);
            onStartRevisionSession(set);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Rapid Revision</span>
        </button>
      </div>

      {/* Tabs: Saved Questions | Missed Questions | Weak Topics */}
      <div className="flex gap-2 p-1.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl max-w-md">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved ({savedQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('missed')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'missed'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Missed ({missedQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('weak_topics')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'weak_topics'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Weak Areas ({weakTopics.length})</span>
        </button>
      </div>

      {/* Tab 1: Saved Questions */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedQuestions.length === 0 ? (
            <div className="rounded-3xl p-8 bg-[var(--bg-card)] border border-[var(--border-card)] text-center text-xs text-[var(--text-muted)]">
              No saved questions yet. Click the bookmark icon during practice to add tricky problems to this revision deck.
            </div>
          ) : (
            savedQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl p-5 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span className="font-mono px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--primary)]">
                    {q.topic}
                  </span>
                  <button
                    onClick={() => StorageService.toggleSaveQuestion(q.id)}
                    className="text-[11px] text-[var(--primary)] font-semibold hover:underline"
                  >
                    Remove from Deck
                  </button>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[var(--text-main)]">
                  {q.questionText}
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                  <strong className="text-[var(--text-main)] block mb-1">Key Insight:</strong>
                  {q.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Missed Questions */}
      {activeTab === 'missed' && (
        <div className="space-y-3">
          {missedQuestions.length === 0 ? (
            <div className="rounded-3xl p-8 bg-[var(--bg-card)] border border-[var(--border-card)] text-center text-xs text-[var(--text-muted)]">
              No missed questions recorded. Great accuracy!
            </div>
          ) : (
            missedQuestions.map((q) => (
              <div
                key={q.id}
                className="rounded-3xl p-5 bg-[var(--bg-card)] border border-rose-500/30 bg-rose-500/5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-rose-600 font-bold">{q.topic}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Attempted & Missed</span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[var(--text-main)]">
                  {q.questionText}
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                  <strong className="text-[var(--text-main)] block mb-1">Solution Explanation:</strong>
                  {q.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Weak Topics */}
      {activeTab === 'weak_topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weakTopics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-3xl p-5 bg-[var(--bg-card)] border border-amber-500/30 bg-amber-500/5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-main)]">{topic.topic}</span>
                <span className="text-xs font-mono font-bold text-amber-600">
                  {topic.masteryLevel}% Mastery
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {topic.subject} • Chapter: {topic.chapter}
              </p>
              <div className="flex flex-wrap gap-1">
                {topic.subtopics.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onNavigateTab('practice')}
                  className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
                >
                  Generate Targeted Drill <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
