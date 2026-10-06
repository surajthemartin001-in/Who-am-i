/**
 * WHO AM I? — Goals & Dreams Engine View
 * Natural language dream input converted by AI into structured knowledge maps,
 * required skills, subject/topic hierarchy, milestones, success tracks,
 * and deep customizable Goal editing.
 */

import React, { useState } from 'react';
import { Goal, RequiredSkill, KnowledgeTopic, GoalMilestone, TrackStatus, IntensityMode } from '../types';
import { StorageService } from '../services/storage';
import { GeminiClient } from '../services/geminiClient';
import {
  Target,
  Sparkles,
  Plus,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  BookOpen,
  ArrowRight,
  Edit3,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  activeGoal: Goal;
  onSelectGoal: (id: string) => void;
  onGoalUpdated: () => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  activeGoal,
  onSelectGoal,
  onGoalUpdated,
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [dreamInput, setDreamInput] = useState('');
  const [careerInput, setCareerInput] = useState('');
  const [hoursInput, setHoursInput] = useState(4);
  const [isResearching, setIsResearching] = useState(false);

  // Goal Customizer Modal State
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [customizeTab, setCustomizeTab] = useState<'basics' | 'skills' | 'topics' | 'milestones'>('basics');

  // Trigger Gemini Deep Research for new Goal
  const handleCreateGoalWithAI = async () => {
    if (!dreamInput.trim() || !careerInput.trim()) return;

    setIsResearching(true);
    try {
      const research = await GeminiClient.researchGoal(dreamInput, careerInput, 'intermediate', hoursInput);

      const newGoal: Goal = {
        id: `goal_${Date.now()}`,
        title: careerInput,
        dreamStatement: dreamInput,
        careerDirection: careerInput,
        field: research.field || careerInput,
        status: 'active',
        trackStatus: 'green',
        targetDeadline: '2027-12-31',
        intensityMode: hoursInput >= 5 ? 'tiger' : hoursInput >= 3 ? 'cheetah' : 'rabbit',
        requiredSkills: (research.requiredSkills || []).map((s: any, idx: number) => ({
          id: `sk_res_${Date.now()}_${idx}`,
          name: s.name,
          category: s.category || 'core',
          currentMastery: s.currentMastery || 20,
          targetMastery: s.targetMastery || 90,
          subtopics: s.subtopics || [],
        })),
        knowledgeTopics: (research.knowledgeTopics || []).map((t: any, idx: number) => ({
          id: `top_res_${Date.now()}_${idx}`,
          subject: t.subject || 'Core Domain',
          chapter: t.chapter || 'Chapter 1',
          topic: t.topic || 'Foundational Principles',
          subtopics: t.subtopics || [],
          prerequisites: t.prerequisites || [],
          estimatedHours: t.estimatedHours || 15,
          masteryLevel: 10,
          status: 'available',
        })),
        milestones: (research.milestones || []).map((m: any, idx: number) => ({
          id: `ms_res_${Date.now()}_${idx}`,
          title: m.title,
          description: m.description,
          targetDate: m.targetDate || '2027-06-30',
          isCompleted: false,
          order: idx + 1,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      StorageService.addGoal(newGoal);
      setIsCreatingNew(false);
      setDreamInput('');
      setCareerInput('');
      onGoalUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsResearching(false);
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Delete this goal and its associated curriculum?')) {
      StorageService.deleteGoal(id);
      onGoalUpdated();
    }
  };

  // Open customizer
  const handleOpenCustomize = (goal: Goal) => {
    setEditingGoal(JSON.parse(JSON.stringify(goal)));
    setIsCustomizing(true);
  };

  const handleSaveCustomization = () => {
    if (!editingGoal) return;
    StorageService.updateGoal(editingGoal);
    setIsCustomizing(false);
    onGoalUpdated();
  };

  // Skill management helpers
  const handleAddSkill = () => {
    if (!editingGoal) return;
    const newSkill: RequiredSkill = {
      id: `sk_custom_${Date.now()}`,
      name: 'New Custom Skill',
      category: 'technical',
      currentMastery: 30,
      targetMastery: 90,
      subtopics: ['Core Practice'],
    };
    setEditingGoal({
      ...editingGoal,
      requiredSkills: [...editingGoal.requiredSkills, newSkill],
    });
  };

  const handleRemoveSkill = (id: string) => {
    if (!editingGoal) return;
    setEditingGoal({
      ...editingGoal,
      requiredSkills: editingGoal.requiredSkills.filter((s) => s.id !== id),
    });
  };

  // Topic management helpers
  const handleAddTopic = () => {
    if (!editingGoal) return;
    const newTopic: KnowledgeTopic = {
      id: `top_custom_${Date.now()}`,
      subject: 'Core Focus',
      chapter: 'Module 1',
      topic: 'New Study Topic',
      subtopics: [],
      prerequisites: [],
      estimatedHours: 10,
      masteryLevel: 25,
      status: 'in_progress',
    };
    setEditingGoal({
      ...editingGoal,
      knowledgeTopics: [...editingGoal.knowledgeTopics, newTopic],
    });
  };

  const handleRemoveTopic = (id: string) => {
    if (!editingGoal) return;
    setEditingGoal({
      ...editingGoal,
      knowledgeTopics: editingGoal.knowledgeTopics.filter((t) => t.id !== id),
    });
  };

  // Milestone management helpers
  const handleAddMilestone = () => {
    if (!editingGoal) return;
    const newMs: GoalMilestone = {
      id: `ms_custom_${Date.now()}`,
      title: 'New Milestone Goal',
      description: 'Define clear objective and benchmark result.',
      targetDate: '2027-06-30',
      isCompleted: false,
      order: editingGoal.milestones.length + 1,
    };
    setEditingGoal({
      ...editingGoal,
      milestones: [...editingGoal.milestones, newMs],
    });
  };

  const handleRemoveMilestone = (id: string) => {
    if (!editingGoal) return;
    setEditingGoal({
      ...editingGoal,
      milestones: editingGoal.milestones.filter((m) => m.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2">
            <Target className="w-6 h-6 text-[var(--primary)]" />
            Goals & Dream Engine
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Define any dream or profession. Fully customize your roadmap, skills, intensity, and study topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Goal Switcher */}
          {goals.length > 1 && (
            <select
              value={activeGoal.id}
              onChange={(e) => onSelectGoal(e.target.value)}
              className="text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl px-3 py-2 text-[var(--text-main)] font-semibold outline-none"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  Goal: {g.title} ({g.trackStatus.toUpperCase()})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => handleOpenCustomize(activeGoal)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-main)] font-bold text-xs hover:border-[var(--primary)] shadow-xs transition-all"
          >
            <Edit3 className="w-4 h-4 text-[var(--primary)]" />
            <span>Customize Goal</span>
          </button>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* New Dream Creation Card */}
      {isCreatingNew && (
        <div className="rounded-3xl p-6 bg-[var(--bg-card)] border-2 border-[var(--primary)] shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
              <Sparkles className="w-4 h-4" /> AI Goal Research Engine
            </div>
            <button
              onClick={() => setIsCreatingNew(false)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                Target Profession / Title
              </label>
              <input
                type="text"
                value={careerInput}
                onChange={(e) => setCareerInput(e.target.value)}
                placeholder="e.g. AI Engineer, Doctor, Robotics Architect, Cybersecurity Specialist..."
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                Committed Daily Hours
              </label>
              <select
                value={hoursInput}
                onChange={(e) => setHoursInput(Number(e.target.value))}
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] outline-none"
              >
                <option value={2}>2 Hours (Turtle / Steady)</option>
                <option value={3}>3 Hours (Rabbit / Balanced)</option>
                <option value={4}>4 Hours (Cheetah / Accelerated)</option>
                <option value={6}>6 Hours (Tiger / High Intensity)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
              Your Dream Statement (Speak/Write naturally)
            </label>
            <textarea
              rows={3}
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              placeholder="e.g. 'I want to pioneer autonomous robotics that assist surgeons with sub-millimeter precision...'"
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-3.5 text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreateGoalWithAI}
              disabled={isResearching || !dreamInput.trim() || !careerInput.trim()}
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isResearching ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Researching & Synthesizing Knowledge Map...
                </>
              ) : (
                <>
                  Generate Full Knowledge Map <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Goal Deep Knowledge Map Showcase */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] block">
              Active Focus Goal
            </span>
            <h3 className="text-xl font-black text-[var(--text-main)]">{activeGoal.title}</h3>
            <p className="text-xs text-[var(--text-muted)] italic mt-1">"{activeGoal.dreamStatement}"</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                activeGoal.trackStatus === 'green'
                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                  : activeGoal.trackStatus === 'yellow'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
              }`}
            >
              {activeGoal.trackStatus} Track
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-main)] font-mono capitalize">
              {activeGoal.intensityMode} mode
            </span>
            <button
              onClick={() => handleOpenCustomize(activeGoal)}
              className="text-xs px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold hover:bg-[var(--primary)] hover:text-white transition-colors"
            >
              Edit Goal
            </button>
          </div>
        </div>

        {/* 1. Required Skills Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[var(--primary)]" /> Required Skills & Subskills ({activeGoal.requiredSkills.length})
            </h4>
            <button
              onClick={() => handleOpenCustomize(activeGoal)}
              className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
            >
              + Customize Skills
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeGoal.requiredSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-main)]">{skill.name}</span>
                  <span className="text-xs font-mono font-bold text-[var(--primary)]">
                    {skill.currentMastery}% / {skill.targetMastery}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                    style={{ width: `${skill.currentMastery}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-1 pt-1">
                  {skill.subtopics.map((sub, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Structured Knowledge Topics */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" /> Subject & Topic Architecture ({activeGoal.knowledgeTopics.length})
            </h4>
            <button
              onClick={() => handleOpenCustomize(activeGoal)}
              className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
            >
              + Customize Topics
            </button>
          </div>
          <div className="space-y-2.5">
            {activeGoal.knowledgeTopics.map((topic) => (
              <div
                key={topic.id}
                className={`p-3.5 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  topic.isWeakArea
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-[var(--bg-app)] border-[var(--border-card)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-main)]">{topic.topic}</span>
                    {topic.isWeakArea && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Weak Topic
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {topic.subject} • Chapter: {topic.chapter} • ~{topic.estimatedHours} hrs
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                      {topic.masteryLevel}% Mastery
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] capitalize block">
                      {topic.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Milestones Roadmap */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[var(--primary)]" /> Critical Milestones ({activeGoal.milestones.length})
            </h4>
            <button
              onClick={() => handleOpenCustomize(activeGoal)}
              className="text-[11px] font-semibold text-[var(--primary)] hover:underline"
            >
              + Customize Milestones
            </button>
          </div>
          <div className="space-y-2">
            {activeGoal.milestones.map((ms) => (
              <div
                key={ms.id}
                className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                      ms.isCompleted
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'border-[var(--border-card)] text-[var(--text-muted)] bg-[var(--bg-card)]'
                    }`}
                  >
                    {ms.order}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--text-main)] block">
                      {ms.title}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{ms.description}</span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[var(--text-muted)] shrink-0">
                  Target: {ms.targetDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FULL-FEATURED GOAL CUSTOMIZATION MODAL                       */}
      {/* ------------------------------------------------------------- */}
      {isCustomizing && editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-card)] bg-[var(--bg-app)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[var(--primary)]" />
                  Customize Goal: {editingGoal.title}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Personalize track health, daily intensity, skills, topics, and milestone deadlines.
                </p>
              </div>

              <button
                onClick={() => setIsCustomizing(false)}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customization Navigation Tabs */}
            <div className="flex border-b border-[var(--border-card)] bg-[var(--bg-card)] px-5 gap-4 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setCustomizeTab('basics')}
                className={`py-3 border-b-2 transition-colors ${
                  customizeTab === 'basics'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Goal Details & Track
              </button>
              <button
                onClick={() => setCustomizeTab('skills')}
                className={`py-3 border-b-2 transition-colors ${
                  customizeTab === 'skills'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Skills ({editingGoal.requiredSkills.length})
              </button>
              <button
                onClick={() => setCustomizeTab('topics')}
                className={`py-3 border-b-2 transition-colors ${
                  customizeTab === 'topics'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Topics ({editingGoal.knowledgeTopics.length})
              </button>
              <button
                onClick={() => setCustomizeTab('milestones')}
                className={`py-3 border-b-2 transition-colors ${
                  customizeTab === 'milestones'
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Milestones ({editingGoal.milestones.length})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: BASICS & TRACK */}
              {customizeTab === 'basics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                        Goal Title / Profession
                      </label>
                      <input
                        type="text"
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                        className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                        Career Direction / Field
                      </label>
                      <input
                        type="text"
                        value={editingGoal.careerDirection}
                        onChange={(e) => setEditingGoal({ ...editingGoal, careerDirection: e.target.value })}
                        className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                      Dream Statement
                    </label>
                    <textarea
                      rows={2}
                      value={editingGoal.dreamStatement}
                      onChange={(e) => setEditingGoal({ ...editingGoal, dreamStatement: e.target.value })}
                      className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-3 text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                        Track Status
                      </label>
                      <select
                        value={editingGoal.trackStatus}
                        onChange={(e) => setEditingGoal({ ...editingGoal, trackStatus: e.target.value as TrackStatus })}
                        className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                      >
                        <option value="green">🟢 Green (On Track)</option>
                        <option value="yellow">🟡 Yellow (Medium Risk)</option>
                        <option value="red">🔴 Red (Off Track)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                        Intensity Mode
                      </label>
                      <select
                        value={editingGoal.intensityMode}
                        onChange={(e) => setEditingGoal({ ...editingGoal, intensityMode: e.target.value as IntensityMode })}
                        className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                      >
                        <option value="turtle">🐢 Turtle (1-2 hrs)</option>
                        <option value="rabbit">🐇 Rabbit (3 hrs)</option>
                        <option value="cheetah">🐆 Cheetah (4-5 hrs)</option>
                        <option value="tiger">🐅 Tiger (6+ hrs)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={editingGoal.targetDeadline.split('T')[0]}
                        onChange={(e) => setEditingGoal({ ...editingGoal, targetDeadline: e.target.value })}
                        className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS */}
              {customizeTab === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Customize skill names and mastery thresholds:
                    </span>
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Skill
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingGoal.requiredSkills.map((sk, index) => (
                      <div
                        key={sk.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={sk.name}
                            onChange={(e) => {
                              const updated = [...editingGoal.requiredSkills];
                              updated[index].name = e.target.value;
                              setEditingGoal({ ...editingGoal, requiredSkills: updated });
                            }}
                            className="flex-1 text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-[var(--text-main)]"
                          />
                          <button
                            onClick={() => handleRemoveSkill(sk.id)}
                            className="text-stone-400 hover:text-rose-500 p-1"
                            title="Delete Skill"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)]">Current Mastery: {sk.currentMastery}%</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sk.currentMastery}
                              onChange={(e) => {
                                const updated = [...editingGoal.requiredSkills];
                                updated[index].currentMastery = Number(e.target.value);
                                setEditingGoal({ ...editingGoal, requiredSkills: updated });
                              }}
                              className="w-full accent-[var(--primary)]"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)]">Target Mastery: {sk.targetMastery}%</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sk.targetMastery}
                              onChange={(e) => {
                                const updated = [...editingGoal.requiredSkills];
                                updated[index].targetMastery = Number(e.target.value);
                                setEditingGoal({ ...editingGoal, requiredSkills: updated });
                              }}
                              className="w-full accent-[var(--primary)]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TOPICS */}
              {customizeTab === 'topics' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Manage subjects, chapters, and topics:
                    </span>
                    <button
                      onClick={handleAddTopic}
                      className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Topic
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingGoal.knowledgeTopics.map((top, index) => (
                      <div
                        key={top.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={top.topic}
                            onChange={(e) => {
                              const updated = [...editingGoal.knowledgeTopics];
                              updated[index].topic = e.target.value;
                              setEditingGoal({ ...editingGoal, knowledgeTopics: updated });
                            }}
                            className="flex-1 text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-[var(--text-main)]"
                          />
                          <button
                            onClick={() => handleRemoveTopic(top.id)}
                            className="text-stone-400 hover:text-rose-500 p-1"
                            title="Delete Topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Subject"
                            value={top.subject}
                            onChange={(e) => {
                              const updated = [...editingGoal.knowledgeTopics];
                              updated[index].subject = e.target.value;
                              setEditingGoal({ ...editingGoal, knowledgeTopics: updated });
                            }}
                            className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-2.5 py-1 text-[var(--text-main)]"
                          />
                          <input
                            type="number"
                            placeholder="Est Hours"
                            value={top.estimatedHours}
                            onChange={(e) => {
                              const updated = [...editingGoal.knowledgeTopics];
                              updated[index].estimatedHours = Number(e.target.value);
                              setEditingGoal({ ...editingGoal, knowledgeTopics: updated });
                            }}
                            className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-2.5 py-1 text-[var(--text-main)]"
                          />
                          <label className="flex items-center gap-1.5 text-[11px] text-[var(--text-main)]">
                            <input
                              type="checkbox"
                              checked={Boolean(top.isWeakArea)}
                              onChange={(e) => {
                                const updated = [...editingGoal.knowledgeTopics];
                                updated[index].isWeakArea = e.target.checked;
                                setEditingGoal({ ...editingGoal, knowledgeTopics: updated });
                              }}
                              className="accent-amber-500 rounded"
                            />
                            <span>Flag as Weak Area</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MILESTONES */}
              {customizeTab === 'milestones' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Set target milestone markers and deadlines:
                    </span>
                    <button
                      onClick={handleAddMilestone}
                      className="px-3 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Milestone
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingGoal.milestones.map((ms, index) => (
                      <div
                        key={ms.id}
                        className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={ms.title}
                            onChange={(e) => {
                              const updated = [...editingGoal.milestones];
                              updated[index].title = e.target.value;
                              setEditingGoal({ ...editingGoal, milestones: updated });
                            }}
                            className="flex-1 text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-[var(--text-main)]"
                          />
                          <button
                            onClick={() => handleRemoveMilestone(ms.id)}
                            className="text-stone-400 hover:text-rose-500 p-1"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <input
                            type="text"
                            placeholder="Description"
                            value={ms.description}
                            onChange={(e) => {
                              const updated = [...editingGoal.milestones];
                              updated[index].description = e.target.value;
                              setEditingGoal({ ...editingGoal, milestones: updated });
                            }}
                            className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-2.5 py-1 text-[var(--text-main)]"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="date"
                              value={ms.targetDate.split('T')[0]}
                              onChange={(e) => {
                                const updated = [...editingGoal.milestones];
                                updated[index].targetDate = e.target.value;
                                setEditingGoal({ ...editingGoal, milestones: updated });
                              }}
                              className="flex-1 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-2.5 py-1 text-[var(--text-main)]"
                            />
                            <label className="flex items-center gap-1 text-[11px]">
                              <input
                                type="checkbox"
                                checked={ms.isCompleted}
                                onChange={(e) => {
                                  const updated = [...editingGoal.milestones];
                                  updated[index].isCompleted = e.target.checked;
                                  setEditingGoal({ ...editingGoal, milestones: updated });
                                }}
                                className="accent-[var(--primary)]"
                              />
                              <span>Done</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-app)] flex items-center justify-between">
              <button
                onClick={() => handleDeleteGoal(editingGoal.id)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Goal</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--border-card)] text-xs font-semibold hover:bg-[var(--bg-card)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCustomization}
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Goal Customizations</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
