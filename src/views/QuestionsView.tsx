/**
 * WHO AM I? — Question Packs & Bank View
 * Manages 20/50/100 question packs, PYQs, weak topic sets, custom exams,
 * and custom question creator.
 */

import React, { useState } from 'react';
import { QuestionPack, Question } from '../types';
import { StorageService } from '../services/storage';
import {
  BookOpen,
  Plus,
  Play,
  Bookmark,
  Sparkles,
  Layers,
  Clock,
  Award,
  ArrowRight,
  Filter,
} from 'lucide-react';

interface QuestionsViewProps {
  onLaunchPack: (pack: QuestionPack) => void;
  onNavigateTab: (tab: any) => void;
}

export const QuestionsView: React.FC<QuestionsViewProps> = ({
  onLaunchPack,
  onNavigateTab,
}) => {
  const [packs, setPacks] = useState<QuestionPack[]>(StorageService.getQuestionPacks());
  const [questions, setQuestions] = useState<Question[]>(StorageService.getQuestions());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredPacks = filterCategory === 'all'
    ? packs
    : packs.filter((p) => p.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--primary)]" />
            Question Packs & Repository
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Preset 20, 50, and 100-question packs, PYQ challenges, and saved custom tests.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('practice')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Pack</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Packs' },
          { id: 'quick_20', label: '20-Question Quick' },
          { id: 'pack_50', label: '50-Question Deep' },
          { id: 'weak_topics', label: 'Weak Topics' },
          { id: 'pyq', label: 'PYQs (Previous Years)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors border ${
              filterCategory === cat.id
                ? 'bg-[var(--primary)] text-[var(--primary-text)] border-[var(--primary)]'
                : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Packs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPacks.map((pack) => (
          <div
            key={pack.id}
            className="rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs hover:border-[var(--primary)]/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--primary)]">
                  {pack.field}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  {pack.questionCount} Questions • {pack.difficulty.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-bold text-[var(--text-main)] mb-1.5">{pack.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                {pack.description}
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between">
              {pack.highScore !== undefined ? (
                <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Best: {pack.highScore}%
                </span>
              ) : (
                <span className="text-xs font-mono text-[var(--text-muted)]">Not attempted yet</span>
              )}

              <button
                onClick={() => onLaunchPack(pack)}
                className="px-4 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Launch Pack</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stored Questions Count & Repository Insight */}
      <div className="rounded-3xl p-6 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-main)]">
            Universal Question Repository ({questions.length} Items)
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            Indexed questions from your imported PDFs, syllabi, PYQs, and AI generators.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('practice')}
          className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
        >
          Build Custom Practice Session <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
