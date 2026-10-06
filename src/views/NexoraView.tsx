/**
 * WHO AM I? — NEXORA Advanced Tech & Engineering Workspace
 * Dedicated environment for long-term ventures, AI/ML systems, robotics,
 * cybersecurity, hardware, technical roadmaps, experiments, and milestones.
 */

import React, { useState } from 'react';
import { NexoraProject } from '../types';
import { StorageService } from '../services/storage';
import {
  Cpu,
  Plus,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Terminal,
  FlaskConical,
  Shield,
  Bot,
  ArrowRight,
} from 'lucide-react';

export const NexoraView: React.FC = () => {
  const [projects, setProjects] = useState<NexoraProject[]>(StorageService.getNexoraProjects());
  const [selectedProj, setSelectedProj] = useState<NexoraProject>(projects[0] || null);
  const [isCreating, setIsCreating] = useState(false);

  // New Project Form
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [domain, setDomain] = useState<'ai_ml' | 'robotics' | 'cybersecurity' | 'systems'>('robotics');
  const [summary, setSummary] = useState('');
  const [architecture, setArchitecture] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;

    const newProj: NexoraProject = {
      id: `nex_${Date.now()}`,
      name,
      tagline: tagline || 'Advanced Engineering Venture',
      domain,
      status: 'concept',
      progressPercentage: 15,
      summary,
      architectureDetails: architecture,
      milestones: [
        { id: `m_${Date.now()}_1`, title: 'Architecture Specification & Proof of Concept', deadline: '2027-01-31', isDone: false },
        { id: `m_${Date.now()}_2`, title: 'Hardware/Cloud Integration & Benchmark Testing', deadline: '2027-04-30', isDone: false },
      ],
      tasks: [
        { id: `t_${Date.now()}_1`, title: 'Draft system design blueprint', priority: 'high', isDone: false },
      ],
      experiments: [],
      updatedAt: new Date().toISOString(),
    };

    StorageService.addNexoraProject(newProj);
    setProjects(StorageService.getNexoraProjects());
    setSelectedProj(newProj);
    setIsCreating(false);
    setName('');
    setTagline('');
    setSummary('');
    setArchitecture('');
  };

  const domainIcons = {
    robotics: Bot,
    ai_ml: Sparkles,
    cybersecurity: Shield,
    systems: Terminal,
    embedded: Cpu,
    quantum: FlaskConical,
    enterprise: Layers,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold">
              Advanced Engineering Labs
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] flex items-center gap-2 mt-1">
            <Cpu className="w-6 h-6 text-[var(--primary)]" />
            NEXORA Venture Incubator
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            High-tech engineering roadmap, autonomous systems, cybersecurity architecture, and experimental validation.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New NEXORA Project</span>
        </button>
      </div>

      {/* New Project Creator Card */}
      {isCreating && (
        <div className="rounded-3xl p-6 bg-[var(--bg-card)] border-2 border-[var(--primary)] shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[var(--text-main)]">Initialize NEXORA Technology Project</h3>
            <button onClick={() => setIsCreating(false)} className="text-xs text-[var(--text-muted)]">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Project Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Aether, ZeroShield..."
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Technical Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value as any)}
                className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
              >
                <option value="robotics">Robotics & Autonomous Systems</option>
                <option value="ai_ml">Deep AI / ML Architecture</option>
                <option value="cybersecurity">Offensive & Defensive Security</option>
                <option value="systems">High-Performance Distributed Systems</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Sub-100ms sensory-motor policy loop on edge TPU"
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">Architecture & Stack</label>
            <textarea
              rows={2}
              value={architecture}
              onChange={(e) => setArchitecture(e.target.value)}
              placeholder="e.g. ROS2, Jetson Orin Nano, TensorRT INT8, RealSense D435i..."
              className="w-full text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl p-3 text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCreate}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md"
            >
              Deploy Project To NEXORA
            </button>
          </div>
        </div>
      )}

      {/* Projects Grid & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Project Catalog */}
        <div className="space-y-3">
          {projects.map((proj) => {
            const isSelected = selectedProj?.id === proj.id;
            const DomainIcon = domainIcons[proj.domain] || Cpu;

            return (
              <div
                key={proj.id}
                onClick={() => setSelectedProj(proj)}
                className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[var(--primary-light)] border-[var(--primary)] shadow-md'
                    : 'bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--primary)]/40 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <DomainIcon className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--primary)]">
                      {proj.domain.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-muted)]">
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">{proj.name}</h3>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{proj.tagline}</p>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span>Progress</span>
                    <span>{proj.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all"
                      style={{ width: `${proj.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Columns: Deep Technical Workspace */}
        {selectedProj && (
          <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] block">
                  Active Venture Blueprint
                </span>
                <h3 className="text-xl font-black text-[var(--text-main)]">{selectedProj.name}</h3>
                <p className="text-xs text-[var(--primary)] font-semibold mt-0.5">{selectedProj.tagline}</p>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-muted)]">
                Status: {selectedProj.status.toUpperCase()}
              </span>
            </div>

            {/* Architecture Details Box */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-[var(--primary)]" /> System Architecture & Tech Stack
              </h4>
              <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] font-mono text-xs text-[var(--text-main)] leading-relaxed">
                {selectedProj.architectureDetails || selectedProj.summary}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[var(--primary)]" /> Engineering Milestones
              </h4>
              <div className="space-y-2">
                {selectedProj.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          m.isDone ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--text-muted)]'
                        }`}
                      >
                        {m.isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`font-semibold ${m.isDone ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-main)]'}`}>
                        {m.title}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                      Target: {m.deadline}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Empirical Experiments & Benchmarks */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-[var(--primary)]" /> Empirical Benchmarks & Experiments
              </h4>
              {selectedProj.experiments.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs text-[var(--text-muted)]">
                  No benchmarks logged yet. Log hypotheses, latency trials, and model comparisons here.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedProj.experiments.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-[var(--text-main)]">
                        <span>Hypothesis: {exp.hypothesis}</span>
                        <span className="font-mono text-[10px] text-emerald-600 uppercase font-bold">
                          {exp.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">
                        Result: {exp.result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
