# WHO AM I? — AI Personal Operating System

> **“AI-powered personal learning, planning, practice, document intelligence and goal-management platform with LYRA.”**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Runtime](https://img.shields.io/badge/Runtime-React_19_+_Vite_+_Express-61DAFB.svg)]()
[![AI](https://img.shields.io/badge/AI-Google_Gemini_SDK_%40google%2Fgenai-8E75C4.svg)]()

---

## Overview

**WHO AM I?** is a unified personal AI operating system engineered to help every individual answer:
- *“What do I want?”*
- *“What is my dream?”*
- *“What goals am I pursuing?”*
- *“What do I need to learn?”*
- *“What resources do I have?”*
- *“What should I do today?”*
- *“Am I progressing correctly?”*
- *“What should I practice?”*
- *“What should I revise?”*
- *“What should I change?”*

The platform adapts dynamically to the individual user without imposing a single universal path. Users can define any dream or profession: **AI/ML Specialist, Autonomous Robotics Engineer, Cybersecurity Professional, Doctor, Quantitative Researcher, Artist, Entrepreneur, or any custom hybrid aspiration.**

Central to the operating system is **LYRA**, an intelligent, friendly futuristic fairy assistant orchestrating knowledge mapping, document intelligence, question generation, adaptive practice, and real-time voice calls.

---

## Key Pillars & Capabilities

### 1. Success Track Trajectory
- Broad trajectory corridor representing progress toward real milestones.
- **Track Status**:
  - 🟢 **GREEN**: Healthy / on target.
  - 🟡 **YELLOW**: Warning / lag in consistency or weak topics.
  - 🔴 **RED**: Serious deviation risk.
- Intelligent diagnostics for missed work, schedule friction, and topic prioritization with automated recovery plans.

### 2. Goals & Dreams Engine
- Natural language dream input converted into rigorous structured roadmaps.
- Identifies foundational skills, subtopics, prerequisites, dependency graphs, and target timelines.
- Grounded with Google Search and modern Gemini models (`gemini-3.5-flash`, `gemini-3.1-pro-preview` with HIGH thinking).

### 3. Universal Resource & Document Center
- Multi-file intake supporting **PDF, Images, Scanned Documents, Text, Notes, Syllabi, and URLs**.
- Real processing pipeline: Upload $\rightarrow$ Validate $\rightarrow$ Extract $\rightarrow$ Chunk $\rightarrow$ Detect Chapters $\rightarrow$ Index.
- **Document Intelligence**: Summarize, extract MCQs, convert books into courses, and compare documents.

### 4. Universal Question Engine (3-Level Customization)
- **Level 1**: Domain / Field (AI, Robotics, Cyber, Medicine, etc.)
- **Level 2**: Subject $\rightarrow$ Chapter $\rightarrow$ Topic $\rightarrow$ Subtopic
- **Level 3**: Configuration (Count, Difficulty: Easy/Medium/Hard/Extreme, Type: Single MCQ, Multi MCQ, True/False, Scenario, Coding)
- Question solving with step-by-step derivation, why distractors are wrong, and similar/harder variations.

### 5. Time Management & Intensity Modes
- **Modes**: Turtle (1–2h), Rabbit (2–3h), Cheetah (4–5h), Tiger (6+h).
- **Commitment Locks**: 7-day and 30-day locks preventing erratic switching.
- **Unlock / Reassess**: 50-Question challenge suite assessing discipline, habits, and domain mastery.
- **Recovery Engine**: Rebalances missed tasks across multiple days without overloading.

### 6. LYRA Avatar & Voice Call System
- Small futuristic fairy avatar with glowing wand, starlight sparkles, fluttering wings, and lip-sync state animations.
- Full-screen voice call interface with microphone input, Web Speech API speech recognition, audio spectrum visualization, listening ON/OFF, and low-latency speech synthesis.

### 7. Complete Appearance & Theme Customizer
- **Cloud Theme**: Premium warm off-white (`#F8F6F0`) + rich elegant amber brown (`#78350F`), soft neutral card surfaces, and calm typography balance.
- **Default Futuristic**: Deep neon indigo and cyan star glow.
- **Midnight**: Deep sapphire and electric blue.
- **Minimal Light**: Crisp porcelain and slate monochrome.
- **Deep Space / Dark**: Void black and starlight violet.
- Live theme preview before applying, plus a **Custom Theme Editor** for fine-tuning colors, radius, and animation intensity.

### 8. NEXORA Venture Incubator
- Dedicated long-term technology workspace for advanced engineering projects (Robotics, Autonomous systems, Symbolic AI, Kernel exploits, High-performance systems).
- Project blueprints, milestones, tasks, and empirical experiment benchmarks.

---

## Tech Stack & Architecture

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend API**: Express server running on Node.js / `tsx`.
- **AI Orchestration**: Official `@google/genai` TypeScript SDK:
  - `gemini-3.1-pro-preview` with `thinkingLevel: ThinkingLevel.HIGH` for complex queries.
  - `gemini-3.5-flash` for general chat, document analysis, and search-grounded research.
  - `gemini-3.1-flash-lite` for low-latency responses.
  - `gemini-3.8-flash-lite-tts` for high-fidelity speech synthesis.
- **Data Persistence**: Offline-first reactive storage with local data isolation and structured schema synchronization.

---

## Quick Start

### Prerequisites
- Node.js 20+ installed
- NPM or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/who-am-i.git
cd who-am-i

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

### Running Locally

```bash
# Start full-stack development server (Express API + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Deployment

### Full-Stack Hosting (Cloud Run / Node)
```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Static Hosting (GitHub Pages)
The static frontend can be deployed to GitHub Pages (`dist/`) while server-side API endpoints can run on any containerized or serverless Node service.

---

## License

Distributed under the Apache 2.0 License. See [LICENSE](LICENSE) for details.
