/**
 * WHO AM I? — Universal Question Practice View
 * Supports:
 * - AI Auto Mode vs 3-Level Customization (Domain -> Subject/Chapter/Topic -> Config)
 * - Question types: Single/Multi MCQ, True/False, Assertion/Reason, Coding, Scenario
 * - Live test runner with instant feedback, deep distractor analysis,
 *   similar/harder question generation, and LYRA solver integration.
 */

import React, { useState } from 'react';
import { Question, QuestionAttempt, Goal, QuestionDifficulty, QuestionType } from '../types';
import { StorageService } from '../services/storage';
import { GeminiClient } from '../services/geminiClient';
import {
  Brain,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Bookmark,
  Share2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface PracticeViewProps {
  activeGoal: Goal;
  initialPackQuestions?: Question[];
  onOpenLyraChatWithContext?: (query: string) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  activeGoal,
  initialPackQuestions,
  onOpenLyraChatWithContext,
}) => {
  // Mode: 'configure' | 'active_test' | 'summary'
  const [viewState, setViewState] = useState<'configure' | 'active_test' | 'summary'>(
    initialPackQuestions && initialPackQuestions.length > 0 ? 'active_test' : 'configure'
  );

  // Configuration State
  const [modeType, setModeType] = useState<'ai_auto' | 'custom'>('ai_auto');
  const [selectedDomain, setSelectedDomain] = useState(activeGoal.field || 'Artificial Intelligence');
  const [selectedTopic, setSelectedTopic] = useState(activeGoal.knowledgeTopics[0]?.topic || 'Transformer Architecture');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [questionType, setQuestionType] = useState<QuestionType>('single_mcq');
  const [isGenerating, setIsGenerating] = useState(false);

  // Live Test State
  const [questions, setQuestions] = useState<Question[]>(initialPackQuestions || StorageService.getQuestions().slice(0, 5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState<QuestionAttempt[]>([]);
  const [lyraHelpText, setLyraHelpText] = useState('');
  const [isLyraSolving, setIsLyraSolving] = useState(false);

  const currentQ = questions[currentIndex];
  const savedIds = StorageService.getSavedQuestionIds();
  const isCurrentSaved = currentQ ? savedIds.includes(currentQ.id) : false;

  // Handle Launching AI Generated Questions
  const handleLaunchPractice = async () => {
    setIsGenerating(true);
    try {
      const generated = await GeminiClient.generateQuestions({
        field: selectedDomain,
        subject: activeGoal.title,
        chapter: 'Current Module',
        topic: modeType === 'ai_auto' ? (activeGoal.knowledgeTopics.find((t) => t.isWeakArea)?.topic || activeGoal.knowledgeTopics[0]?.topic || 'Core Concept') : selectedTopic,
        count: questionCount,
        difficulty: modeType === 'ai_auto' ? 'medium' : difficulty,
        questionType: modeType === 'ai_auto' ? 'single_mcq' : questionType,
      });

      if (generated && generated.length > 0) {
        StorageService.addQuestions(generated);
        setQuestions(generated);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswerSubmitted(false);
        setScore(0);
        setAttempts([]);
        setViewState('active_test');
      }
    } catch (e) {
      console.error(e);
      // Fallback to local stored questions
      const local = StorageService.getQuestions();
      setQuestions(local.slice(0, questionCount));
      setViewState('active_test');
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQ) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    const attempt: QuestionAttempt = {
      id: `att_${Date.now()}`,
      questionId: currentQ.id,
      userAnswer: selectedOption,
      isCorrect,
      timeSpentSeconds: 25,
      timestamp: new Date().toISOString(),
      mode: 'practice',
    };

    StorageService.recordAttempt(attempt);
    setAttempts((prev) => [...prev, attempt]);
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setLyraHelpText('');
    } else {
      setViewState('summary');
    }
  };

  // Ask LYRA for Hint or Harder Variation
  const handleAskLyra = async (mode: 'hints_only' | 'full_explanation' | 'generate_harder') => {
    if (!currentQ) return;
    setIsLyraSolving(true);

    try {
      const res = await GeminiClient.solveQuestion(currentQ, mode);
      setLyraHelpText(res.solution || (res.hints ? res.hints.join('\n') : 'Analysis complete.'));
    } catch {
      setLyraHelpText('Break down the question into first principles. Review the core definition of the underlying topic.');
    } finally {
      setIsLyraSolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <Brain className="w-6 h-6 text-[var(--primary)]" />
            Universal Question Practice Engine
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            One question engine shared across practice, study, books, and revision.
          </p>
        </div>

        {viewState === 'active_test' && (
          <button
            onClick={() => setViewState('configure')}
            className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1 border border-[var(--border-card)] px-3 py-1.5 rounded-xl bg-[var(--bg-card)]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> End & Configure
          </button>
        )}
      </div>

      {/* 2. CONFIGURE VIEW */}
      {viewState === 'configure' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          {/* Mode Selector: AI Auto vs 3-Level Customization */}
          <div className="flex gap-2 p-1.5 bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl max-w-md">
            <button
              onClick={() => setModeType('ai_auto')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modeType === 'ai_auto'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Auto Mode</span>
            </button>
            <button
              onClick={() => setModeType('custom')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                modeType === 'custom'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>3-Level Custom Mode</span>
            </button>
          </div>

          {modeType === 'ai_auto' ? (
            /* AI Auto Mode Description */
            <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-3">
              <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> AI Auto Calibration
              </span>
              <p className="text-xs text-[var(--text-main)] leading-relaxed">
                LYRA automatically analyzes your active goal (<strong>{activeGoal.title}</strong>), detects weak areas, and compiles a targeted 10-question practice pack combining imported PDFs, curriculum milestones, and AI scenario problems.
              </p>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">
                Focus Target: {activeGoal.knowledgeTopics.find((t) => t.isWeakArea)?.topic || activeGoal.knowledgeTopics[0]?.topic || 'Foundational Principles'}
              </div>
            </div>
          ) : (
            /* 3-Level Customization Form */
            <div className="space-y-4">
              {/* LEVEL 1: Domain / Field */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Level 1: Field / Domain
                </label>
                <input
                  type="text"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Cybersecurity, Robotics..."
                  className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* LEVEL 2: Subject / Topic */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Level 2: Subject & Specific Topic
                </label>
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="e.g. FlashAttention, Return-Oriented Programming, Kinematics..."
                  className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                />
              </div>

              {/* LEVEL 3: Configuration (Count, Difficulty, Type) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Question Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                  >
                    <option value={5}>5 Questions (Micro-drills)</option>
                    <option value={10}>10 Questions (Standard)</option>
                    <option value={20}>20 Questions (Deep Pack)</option>
                    <option value={50}>50 Questions (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                  >
                    <option value="easy">Easy (Definitions & Concepts)</option>
                    <option value="medium">Medium (Application & Mechanics)</option>
                    <option value="hard">Hard (Scenarios & Multi-Step)</option>
                    <option value="extreme">Extreme (Advanced STEM & Edge-cases)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    Question Type
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as any)}
                    className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                  >
                    <option value="single_mcq">Single-choice MCQ</option>
                    <option value="multi_mcq">Multiple-choice MCQ</option>
                    <option value="true_false">True / False</option>
                    <option value="scenario">Scenario-Based Problem</option>
                    <option value="coding">Code & Engineering Analysis</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleLaunchPractice}
              disabled={isGenerating}
              className="px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Synthesizing Question Pack...
                </>
              ) : (
                <>
                  Start Practice Test <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE TEST RUNNER */}
      {viewState === 'active_test' && currentQ && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          {/* Top Progress & Info Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)] text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-main)]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>•</span>
              <span className="font-mono capitalize px-2 py-0.5 rounded-md bg-[var(--bg-app)] border border-[var(--border-card)]">
                {currentQ.difficulty}
              </span>
              <span className="font-mono text-[10px] hidden sm:inline">
                {currentQ.topic}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => StorageService.toggleSaveQuestion(currentQ.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isCurrentSaved
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                    : 'border-[var(--border-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title={isCurrentSaved ? 'Saved to Revision' : 'Save Question'}
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="text-sm sm:text-base font-semibold text-[var(--text-main)] leading-relaxed">
            {currentQ.questionText}
          </div>

          {/* Options List */}
          {currentQ.options && (
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const optKey = String(idx);
                const isSelected = selectedOption === optKey;
                const isCorrect = isAnswerSubmitted && optKey === currentQ.correctAnswer;
                const isWrongSelected = isAnswerSubmitted && isSelected && !isCorrect;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isAnswerSubmitted) setSelectedOption(optKey);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 font-semibold'
                        : isWrongSelected
                        ? 'bg-rose-500/10 border-rose-500 text-rose-900'
                        : isSelected
                        ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--text-main)] font-semibold'
                        : 'bg-[var(--bg-app)] border-[var(--border-card)] hover:border-[var(--primary)]/50 text-[var(--text-main)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] text-xs font-bold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm">{option}</span>
                    </div>

                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    {isWrongSelected && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Submit / Next Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAskLyra('hints_only')}
                disabled={isLyraSolving}
                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Get Hint from LYRA</span>
              </button>
            </div>

            <div>
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md disabled:opacity-40 transition-all"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-1.5 transition-all"
                >
                  <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Test'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Deep Explanation & Distractor Analysis (Shows on answer submission) */}
          {isAnswerSubmitted && (
            <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  Pedagogical Breakdown & Solution
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Source: {currentQ.sourceDocName || 'Knowledge Base'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                {currentQ.explanation}
              </p>

              {/* Why other options are wrong */}
              {currentQ.distractorExplanations && (
                <div className="space-y-1.5 pt-2 border-t border-[var(--border-card)]">
                  <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Distractor Analysis (Why others are wrong):
                  </span>
                  {Object.entries(currentQ.distractorExplanations).map(([optIdx, reason]) => (
                    <div key={optIdx} className="text-xs text-[var(--text-muted)]">
                      <strong className="text-[var(--text-main)]">Option {String.fromCharCode(65 + Number(optIdx))}:</strong> {reason}
                    </div>
                  ))}
                </div>
              )}

              {/* Related Concepts */}
              {currentQ.relatedConcepts && currentQ.relatedConcepts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Related:</span>
                  {currentQ.relatedConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LYRA Live Solver Help Result */}
          {lyraHelpText && (
            <div className="p-4 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary)]/30 space-y-1 animate-in fade-in duration-150">
              <span className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> LYRA Guidance
              </span>
              <div className="text-xs text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                {lyraHelpText}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUMMARY VIEW */}
      {viewState === 'summary' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto text-2xl font-black">
            {Math.round((score / questions.length) * 100)}%
          </div>

          <h3 className="text-lg font-bold text-[var(--text-main)]">Practice Session Complete!</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            You scored {score} out of {questions.length} questions correctly. Performance metrics have been logged to your adaptive profile.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setViewState('configure')}
              className="px-5 py-2.5 rounded-xl border border-[var(--border-card)] hover:bg-[var(--bg-app)] text-xs font-semibold text-[var(--text-main)]"
            >
              Configure New Test
            </button>
            <button
              onClick={handleLaunchPractice}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 shadow-md"
            >
              Repeat / Practice Weak Areas
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
