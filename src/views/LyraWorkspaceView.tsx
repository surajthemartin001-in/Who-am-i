/**
 * WHO AM I? — Dedicated First-Class LYRA Workspace
 * Sub-modes: Chat | Voice | Files | Create (Document Studio) | Questions | Actions | Tasks
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  LyraSubTab,
  LyraMessage,
  LyraDocument,
  LyraTask,
  PendingLyraAction,
  Question,
  ResourceDocument,
  Goal,
  VoiceConnectionState,
} from '../types';
import { LyraAvatar } from '../components/lyra/LyraAvatar';
import { StorageService } from '../services/storage';
import { GeminiClient } from '../services/geminiClient';
import { LyraOrchestrator } from '../services/lyraOrchestrator';
import {
  MessageSquare,
  PhoneCall,
  FileBox,
  FileText,
  Brain,
  Sliders,
  ListTodo,
  Send,
  Sparkles,
  Paperclip,
  Volume2,
  VolumeX,
  Search,
  BrainCircuit,
  Zap,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Printer,
  Trash2,
  Play,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';

interface LyraWorkspaceViewProps {
  activeGoal: Goal;
  onNavigateTab: (tab: any) => void;
  onStartPracticePack?: (packId?: string) => void;
  initialSubTab?: LyraSubTab;
}

export const LyraWorkspaceView: React.FC<LyraWorkspaceViewProps> = ({
  activeGoal,
  onNavigateTab,
  onStartPracticePack,
  initialSubTab = 'chat',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<LyraSubTab>(initialSubTab);

  // Chat State
  const [messages, setMessages] = useState<LyraMessage[]>(StorageService.getLyraMessages());
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'general' | 'fast' | 'thinking'>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Voice State with Explicit Connection Lifecycle
  const [voiceState, setVoiceState] = useState<VoiceConnectionState>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceReply, setVoiceReply] = useState('LYRA is ready. Tap Connect to start voice interaction.');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore');
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [voiceTextInput, setVoiceTextInput] = useState('');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // Document Studio State
  const [documents, setDocuments] = useState<LyraDocument[]>(StorageService.getLyraDocuments());
  const [activeDoc, setActiveDoc] = useState<LyraDocument>(documents[0] || null);
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<LyraDocument['docType']>('study_guide');
  const [newDocContent, setNewDocContent] = useState('');

  // Questions Solver State
  const [solverQuestion, setSolverQuestion] = useState('');
  const [solverMode, setSolverMode] = useState<'full_explanation' | 'hints_only' | 'generate_harder' | 'generate_similar'>('full_explanation');
  const [solverResult, setSolverResult] = useState('');
  const [isSolving, setIsSolving] = useState(false);

  // Global Actions & App Control State
  const [commandInput, setCommandInput] = useState('');
  const [commandResult, setCommandResult] = useState<string>('');
  const [pendingActions, setPendingActions] = useState<PendingLyraAction[]>(StorageService.getLyraActions());
  const [isCommandExecuting, setIsCommandExecuting] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState<LyraTask[]>(StorageService.getLyraTasks());

  const resources = StorageService.getResources();

  // Voice audio refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const voiceSilenceTimerRef = useRef<any>(null);
  const latestVoiceTextRef = useRef<string>('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Clean up voice upon unmounting or leaving voice tab
  useEffect(() => {
    return () => {
      terminateVoiceSession();
    };
  }, []);

  // -------------------------------------------------------------
  // VOICE LIFECYCLE MANAGEMENT (Explicit States & Reconnection)
  // -------------------------------------------------------------
  const initVoiceSession = async () => {
    setVoiceState('connecting');
    setVoiceReply('Initializing microphone and establishing speech connection...');

    try {
      // 1. Acquire real microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Setup audio visualization
      initVisualizer(stream);

      // 3. Start real speech recognition
      startRecognition();

      // Successfully connected
      setVoiceState('connected');
      setIsListening(true);
      setReconnectAttempts(0);
      setVoiceReply('Connected! Speak naturally, I am listening.');
    } catch (err: any) {
      console.warn('Voice initialization failed:', err);
      setVoiceState('error');
      setVoiceReply('Microphone permission denied or audio device unavailable. You can use Chat mode anytime.');
    }
  };

  const terminateVoiceSession = () => {
    if (voiceSilenceTimerRef.current) {
      clearTimeout(voiceSilenceTimerRef.current);
      voiceSilenceTimerRef.current = null;
    }
    GeminiClient.stopSpeaking();

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setVoiceState('disconnected');
    setIsListening(false);
  };

  const handleReconnectVoice = () => {
    if (reconnectAttempts >= 3) {
      setVoiceState('error');
      setVoiceReply('Maximum reconnection attempts reached. Please check your browser audio settings.');
      return;
    }
    setReconnectAttempts((prev) => prev + 1);
    setVoiceState('reconnecting');
    setTimeout(() => {
      initVoiceSession();
    }, 1500);
  };

  const startRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedVoiceLang;

      recognition.onresult = (event: any) => {
        let currentText = '';
        let hasFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          currentText += trans;
          if (event.results[i].isFinal) {
            hasFinal = true;
          }
        }

        const trimmed = currentText.trim();
        if (trimmed) {
          latestVoiceTextRef.current = trimmed;
          setVoiceTranscript(trimmed);

          if (hasFinal) {
            if (voiceSilenceTimerRef.current) clearTimeout(voiceSilenceTimerRef.current);
            voiceSilenceTimerRef.current = null;
            handleVoiceQuery(trimmed);
          } else {
            // Silence debounce fallback: auto-submit after 1.3s if user pauses
            if (voiceSilenceTimerRef.current) clearTimeout(voiceSilenceTimerRef.current);
            voiceSilenceTimerRef.current = setTimeout(() => {
              if (latestVoiceTextRef.current.trim().length > 1) {
                handleVoiceQuery(latestVoiceTextRef.current.trim());
              }
            }, 1300);
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Recognition notice:', e.error);
        }
      };

      recognition.onend = () => {
        if (voiceState === 'connected' && isListening && !isMuted) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn(e);
    }
  };

  const handleVoiceQuery = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    latestVoiceTextRef.current = '';
    if (voiceSilenceTimerRef.current) {
      clearTimeout(voiceSilenceTimerRef.current);
      voiceSilenceTimerRef.current = null;
    }

    setVoiceReply(selectedVoiceLang === 'hi-IN' ? 'लाइरा सोच रही है... 🌟' : 'LYRA is thinking... 🌟');
    try {
      const response = await GeminiClient.askLyra(
        [{ role: 'user', content: clean }],
        {
          modelPreference: 'fast',
          userContext: { goal: activeGoal.title, language: selectedVoiceLang },
          systemInstruction: 'You are LYRA in voice mode. Give warm, extremely sweet, clear, crisp 1-2 sentence replies. If user spoke in Hindi, reply in natural Hindi/Hinglish. Avoid markdown symbols.',
        }
      );

      const reply = response.text || (selectedVoiceLang === 'hi-IN' ? 'मैं सुन रही हूँ। आगे बढ़ें!' : 'Understood. Let’s proceed!');
      setVoiceReply(reply);

      if (!isSpeakerMuted) {
        await GeminiClient.speakText(reply, selectedVoice);
      }
    } catch {
      setVoiceReply('I am listening. Please continue.');
    }
  };

  const initVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const render = () => {
        animFrameRef.current = requestAnimationFrame(render);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
          ctx.fillStyle = isListening ? 'rgba(180, 83, 9, 0.7)' : 'rgba(120, 113, 108, 0.2)';
          ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, Math.max(3, barHeight));
          x += barWidth + 2;
        }
      };
      render();
    } catch {
      // AudioContext unavailable
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  // -------------------------------------------------------------
  // CHAT SEND
  // -------------------------------------------------------------
  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');

    const userMsg: LyraMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    StorageService.addLyraMessage(userMsg);
    setIsChatLoading(true);

    try {
      const attachedDoc = resources.find((r) => r.id === selectedDocId);

      const response = await GeminiClient.askLyra(
        updated.map((m) => ({ role: m.role, content: m.content })),
        {
          modelPreference: modelChoice,
          useSearch: useSearchGrounding,
          userContext: {
            goal: activeGoal.title,
            career: activeGoal.careerDirection,
            status: activeGoal.trackStatus,
            attachedDocument: attachedDoc
              ? { name: attachedDoc.title, text: attachedDoc.extractedText.slice(0, 3000) }
              : null,
          },
        }
      );

      const asstMsg: LyraMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: response.text || 'I have completed your analysis.',
        timestamp: new Date().toISOString(),
        modelUsed: response.modelUsed || 'gemini-3.5-flash',
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, asstMsg]);
      StorageService.addLyraMessage(asstMsg);

      if (autoSpeak) {
        await GeminiClient.speakText(asstMsg.content);
      }
    } catch (e: any) {
      console.error(e);
      const errMsg: LyraMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble processing that request. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // -------------------------------------------------------------
  // DOCUMENT STUDIO (Create & Export PDF)
  // -------------------------------------------------------------
  const handleSaveNewDocument = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const doc: LyraDocument = {
      id: `ldoc_${Date.now()}`,
      title: newDocTitle,
      docType: newDocType,
      content: newDocContent,
      tags: [activeGoal.field, 'Studio'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    StorageService.addLyraDocument(doc);
    const updated = StorageService.getLyraDocuments();
    setDocuments(updated);
    setActiveDoc(doc);
    setIsCreatingDoc(false);
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleExportPdf = (doc: LyraDocument) => {
    // Generate clean printable window for real PDF creation via browser PDF print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            h1 { color: #78350f; border-bottom: 2px solid #e7dfd5; padding-bottom: 8px; }
            h2, h3 { color: #92400e; margin-top: 24px; }
            pre { background: #f8f6f0; padding: 12px; border-radius: 8px; border: 1px solid #e4ddd3; white-space: pre-wrap; font-family: monospace; }
            .meta { font-size: 12px; color: #78716c; margin-bottom: 24px; }
          </style>
        </head>
        <body>
          <h1>${doc.title}</h1>
          <div class="meta">Generated by WHO AM I? • LYRA Document Studio | Date: ${new Date(doc.createdAt).toLocaleDateString()}</div>
          <div>${doc.content.replace(/\n/g, '<br/>')}</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // -------------------------------------------------------------
  // QUESTION SOLVER DIRECT EXECUTION
  // -------------------------------------------------------------
  const handleSolveQuestion = async () => {
    if (!solverQuestion.trim()) return;

    setIsSolving(true);
    setSolverResult('');

    try {
      const mockQ: Question = {
        id: `q_user_ask_${Date.now()}`,
        questionText: solverQuestion,
        type: 'single_mcq',
        difficulty: 'medium',
        field: activeGoal.field,
        subject: activeGoal.title,
        chapter: 'Direct Solver',
        topic: 'User Problem',
        correctAnswer: 'Analysis',
        explanation: 'Step-by-step derivation',
        relatedConcepts: ['Core Theory'],
        sourceType: 'user_created',
        isAiGenerated: false,
        createdAt: new Date().toISOString(),
      };

      const res = await GeminiClient.solveQuestion(mockQ, solverMode, solverQuestion);
      setSolverResult(res.solution || 'Analysis ready.');
    } catch {
      setSolverResult('Unable to solve question right now. Please verify connection.');
    } finally {
      setIsSolving(false);
    }
  };

  // -------------------------------------------------------------
  // GLOBAL APP COMMAND EXECUTION & CONFIRMATION
  // -------------------------------------------------------------
  const handleRunCommand = async () => {
    if (!commandInput.trim() || isCommandExecuting) return;

    const cmd = commandInput.trim();
    setIsCommandExecuting(true);
    setCommandResult('');

    try {
      const result = await LyraOrchestrator.processCommand(cmd);
      setCommandResult(result.message);
      setPendingActions(StorageService.getLyraActions());
    } catch (e: any) {
      setCommandResult(`Execution notice: ${e.message}`);
    } finally {
      setIsCommandExecuting(false);
    }
  };

  const handleConfirmAction = async (action: PendingLyraAction) => {
    const outcome = await LyraOrchestrator.executePendingAction(action);
    const updated = StorageService.getLyraActions().filter((a) => a.id !== action.id);
    StorageService.saveLyraActions(updated);
    setPendingActions(updated);
    setCommandResult(`✅ ${outcome}`);
  };

  const handleRejectAction = (actionId: string) => {
    const updated = StorageService.getLyraActions().filter((a) => a.id !== actionId);
    StorageService.saveLyraActions(updated);
    setPendingActions(updated);
    setCommandResult('Action cancelled by user.');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
        <div className="flex items-center gap-4">
          <LyraAvatar state={isChatLoading || isSolving ? 'thinking' : voiceState === 'connected' ? 'listening' : 'idle'} size="lg" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold">
                Dedicated Control Center
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                voiceState === 'connected'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : voiceState === 'connecting' || voiceState === 'reconnecting'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-[var(--bg-app)] text-[var(--text-muted)]'
              }`}>
                VOICE: {voiceState.toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">
              LYRA Intelligent Workspace
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Full AI orchestrator for multi-turn chat, voice interaction, document creation, question solving, and app-wide control.
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('voice')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
              activeSubTab === 'voice'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Voice Mode</span>
          </button>
          <button
            onClick={() => setActiveSubTab('create')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
              activeSubTab === 'create'
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Doc Studio</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Sub-Mode Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl overflow-x-auto shadow-xs">
        {[
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'voice', label: 'Voice Call', icon: PhoneCall },
          { id: 'files', label: 'Files & Analysis', icon: FileBox },
          { id: 'create', label: 'Create (Docs & PDF)', icon: FileText },
          { id: 'questions', label: 'Question Solver', icon: Brain },
          { id: 'actions', label: 'App Control', icon: Sliders },
          { id: 'tasks', label: 'Task Center', icon: ListTodo, badge: tasks.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--bg-app)] text-[var(--text-muted)]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 1: CHAT                                             */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'chat' && (
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Chat Toolbar */}
          <div className="px-5 py-3 border-b border-[var(--border-card)] bg-[var(--bg-app)] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--text-muted)]">Model:</span>
              <button
                onClick={() => setModelChoice('fast')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  modelChoice === 'fast' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                <Zap className="w-3 h-3" /> Fast
              </button>
              <button
                onClick={() => setModelChoice('general')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  modelChoice === 'general' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setModelChoice('thinking')}
                className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 ${
                  modelChoice === 'thinking' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] border border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                <BrainCircuit className="w-3 h-3 text-amber-300" /> Thinking
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseSearchGrounding(!useSearchGrounding)}
                className={`px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 ${
                  useSearchGrounding ? 'bg-sky-500/10 text-sky-600 border-sky-400' : 'border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
              >
                <Search className="w-3 h-3" /> Search Grounding
              </button>

              <button
                onClick={() => setAutoSpeak(!autoSpeak)}
                className={`p-1.5 rounded-lg border ${
                  autoSpeak ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border-card)] text-[var(--text-muted)]'
                }`}
                title={autoSpeak ? 'Auto-Speak Active' : 'Auto-Speak Off'}
              >
                {autoSpeak ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && <LyraAvatar state="idle" size="sm" />}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[var(--primary)] text-[var(--primary-text)] rounded-tr-xs'
                        : 'bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-main)] rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {msg.suggestedActions && (
                      <div className="mt-3 pt-2 border-t border-[var(--border-card)]/40 flex flex-wrap gap-1.5">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (act.actionType === 'START_PRACTICE' && onStartPracticePack) onStartPracticePack();
                              else if (act.actionType === 'NAVIGATE' && act.payload?.view) onNavigateTab(act.payload.view);
                            }}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] flex items-center gap-1 shadow-xs"
                          >
                            <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isChatLoading && (
              <div className="flex gap-3 items-center">
                <LyraAvatar state="thinking" size="sm" />
                <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--lyra-glow)] animate-spin" />
                  LYRA is reasoning across your curriculum...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--border-card)] bg-[var(--bg-card)]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask LYRA: solve problem, reorganize plan, explain concepts..."
                className="flex-1 text-xs sm:text-sm bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 2: VOICE CALL EXPERIENCE                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'voice' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs flex flex-col items-center text-center space-y-6">
          <LyraAvatar state={voiceState === 'connected' ? (isListening ? 'listening' : 'idle') : 'idle'} size="xl" />

          {/* Voice Lifecycle Status Pill & Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
              voiceState === 'connected'
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                : voiceState === 'connecting' || voiceState === 'reconnecting'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-card)]'
            }`}>
              <span className={`w-2 h-2 rounded-full ${voiceState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              STATUS: {voiceState.toUpperCase()}
            </span>

            {/* Language Switcher */}
            <button
              onClick={() => {
                const next = selectedVoiceLang === 'hi-IN' ? 'en-US' : 'hi-IN';
                setSelectedVoiceLang(next);
                if (voiceState === 'connected') {
                  startRecognition();
                }
              }}
              className="text-xs px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] text-[var(--text-main)] font-semibold hover:border-[var(--primary)]"
            >
              🌐 {selectedVoiceLang === 'hi-IN' ? '🇮🇳 हिन्दी / Hinglish' : '🌐 English'}
            </button>

            {/* Test Sweet Voice Button */}
            <button
              onClick={async () => {
                await GeminiClient.testVoice();
              }}
              className="text-xs px-3 py-1.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-text)] transition-colors"
            >
              🌸 आवाज़ टेस्ट करें
            </button>

            {voiceState === 'error' && (
              <button
                onClick={handleReconnectVoice}
                className="text-xs px-3 py-1 rounded-xl bg-amber-500 text-white font-bold hover:opacity-90"
              >
                Retry Reconnect
              </button>
            )}
          </div>

          {/* Audio Visualizer Spectrum */}
          <div className="w-full max-w-lg h-16 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] p-2 flex items-center justify-center">
            <canvas ref={canvasRef} width={400} height={50} className="w-full h-full" />
          </div>

          {/* Voice Transcript Card */}
          <div className="w-full max-w-lg p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] text-left shadow-xs space-y-2">
            {voiceTranscript && (
              <div className="text-xs text-[var(--text-muted)] italic">
                You: "{voiceTranscript}"
              </div>
            )}
            <div className="text-sm font-semibold text-[var(--text-main)] leading-relaxed">
              {voiceReply}
            </div>
            {voiceTranscript && (
              <div className="pt-2 border-t border-[var(--border-card)]">
                <button
                  onClick={() => handleVoiceQuery(voiceTranscript)}
                  className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>Send Speech / उत्तर सुनें</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Voice Prompt Chips */}
          <div className="w-full max-w-lg flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                const q = selectedVoiceLang === 'hi-IN' ? 'लाइरा, आप कौन हो?' : 'Who are you LYRA?';
                setVoiceTranscript(q);
                handleVoiceQuery(q);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)]"
            >
              🌸 {selectedVoiceLang === 'hi-IN' ? 'लाइरा, आप कौन हो?' : 'Who are you?'}
            </button>
            <button
              onClick={() => {
                const q = selectedVoiceLang === 'hi-IN' ? 'मेरे goals को analyze करो' : 'Analyze my goals';
                setVoiceTranscript(q);
                handleVoiceQuery(q);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)]"
            >
              📊 {selectedVoiceLang === 'hi-IN' ? 'Goals analyze करो' : 'Analyze goals'}
            </button>
            <button
              onClick={() => {
                const q = selectedVoiceLang === 'hi-IN' ? 'आज का study plan क्या है?' : 'What is today’s plan?';
                setVoiceTranscript(q);
                handleVoiceQuery(q);
              }}
              className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)]"
            >
              ⏱️ {selectedVoiceLang === 'hi-IN' ? 'आज का plan' : 'Today’s plan'}
            </button>
          </div>

          {/* Fallback Text Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!voiceTextInput.trim()) return;
              const txt = voiceTextInput.trim();
              setVoiceTextInput('');
              setVoiceTranscript(txt);
              handleVoiceQuery(txt);
            }}
            className="w-full max-w-lg flex items-center gap-2"
          >
            <input
              type="text"
              value={voiceTextInput}
              onChange={(e) => setVoiceTextInput(e.target.value)}
              placeholder={selectedVoiceLang === 'hi-IN' ? 'माइक काम न करे तो यहाँ टाइप करें...' : 'Type here to talk with Lyra...'}
              className="flex-1 text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              disabled={!voiceTextInput.trim()}
              className="px-3.5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Voice Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {voiceState !== 'connected' ? (
              <button
                onClick={initVoiceSession}
                className="px-6 py-3 rounded-full bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Start Live Voice Session</span>
              </button>
            ) : (
              <>
                <button
                  onClick={toggleListening}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                    isListening
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                      : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-card)]'
                  }`}
                >
                  {isListening ? '🎙️ LISTENING: ACTIVE' : 'PAUSED'}
                </button>

                <button
                  onClick={() => {
                    if (!isSpeakerMuted) GeminiClient.stopSpeaking();
                    setIsSpeakerMuted(!isSpeakerMuted);
                  }}
                  className={`p-3 rounded-full border ${
                    isSpeakerMuted ? 'bg-rose-100 text-rose-600 border-rose-300' : 'bg-[var(--bg-app)] border-[var(--border-card)] text-[var(--text-main)]'
                  }`}
                  title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
                >
                  {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={terminateVoiceSession}
                  className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md"
                >
                  Disconnect Call
                </button>
              </>
            )}

            {/* Voice Persona Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
            >
              <option value="Kore">Persona: Kore (Warm & Sweet)</option>
              <option value="Puck">Persona: Puck (Playful Fairy)</option>
              <option value="Fenrir">Persona: Fenrir (Calm Mentor)</option>
              <option value="Zephyr">Persona: Zephyr (Futuristic Clear)</option>
            </select>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 3: FILES & ANALYSIS                                  */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'files' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">LYRA Knowledge File Inspector</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Operate across your uploaded resources to build curriculum, generate questions, or compare materials.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('resources')}
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              Manage Universal Resources <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((res) => (
              <div key={res.id} className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-main)] truncate max-w-[220px]">
                    {res.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">
                    {res.processingStatus}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                  {res.summary || res.extractedText}
                </p>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={async () => {
                      const qPack = await GeminiClient.generateQuestions({
                        field: activeGoal.field,
                        subject: res.title,
                        chapter: 'All Chapters',
                        topic: res.detectedTopics[0] || 'Core',
                        count: 10,
                        difficulty: 'medium',
                        questionType: 'single_mcq',
                        documentContext: res.extractedText,
                      });
                      StorageService.addQuestions(qPack);
                      alert(`Generated ${qPack.length} practice questions from ${res.title}!`);
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)]"
                  >
                    Extract 10 MCQs
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDocId(res.id);
                      setActiveSubTab('chat');
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white"
                  >
                    Discuss in Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 4: CREATE (DOCUMENT STUDIO & PDF EXPORT)             */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'create' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-card)]">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">LYRA Document Studio</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Create structured study guides, notes, syllabus blueprints, and export professional PDFs.
              </p>
            </div>
            <button
              onClick={() => setIsCreatingDoc(!isCreatingDoc)}
              className="px-4 py-2 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingDoc ? 'Close Editor' : 'New Document'}</span>
            </button>
          </div>

          {/* New Document Editor */}
          {isCreatingDoc && (
            <div className="p-5 rounded-2xl bg-[var(--bg-app)] border-2 border-[var(--primary)] space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Document Title</label>
                  <input
                    type="text"
                    value={newDocTitle}
                    onChange={(e) => setNewDocTitle(e.target.value)}
                    placeholder="e.g. FlashAttention-2 Derivation Guide"
                    className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Document Format</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3 py-2 text-[var(--text-main)] outline-none"
                  >
                    <option value="study_guide">Comprehensive Study Guide</option>
                    <option value="syllabus">Syllabus Blueprint</option>
                    <option value="question_paper">Question Paper</option>
                    <option value="note">Short Structured Note</option>
                    <option value="report">Executive Status Report</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-main)] mb-1">Content (Markdown supported)</label>
                <textarea
                  rows={6}
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Draft or paste study content..."
                  className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl p-3 text-[var(--text-main)] outline-none font-mono resize-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsCreatingDoc(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border-card)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewDocument}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[var(--primary)] text-white shadow-xs"
                >
                  Save to Studio
                </button>
              </div>
            </div>
          )}

          {/* Stored Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[var(--primary)] px-2 py-0.5 rounded-md bg-[var(--bg-card)] border border-[var(--border-card)]">
                      {doc.docType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-main)]">{doc.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-3 mt-1 whitespace-pre-wrap font-mono">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between">
                  <button
                    onClick={() => handleExportPdf(doc)}
                    className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Export PDF</span>
                  </button>

                  <button
                    onClick={() => {
                      StorageService.deleteLyraDocument(doc.id);
                      setDocuments(StorageService.getLyraDocuments());
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 5: QUESTION SOLVER                                  */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'questions' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[var(--border-card)]">
            <h3 className="text-base font-bold text-[var(--text-main)]">LYRA High-Precision Question Solver</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Paste any STEM, STEM-coding, or scenario problem. LYRA solves it using first principles, distractor elimination, or provides progressive hints.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Enter Question / Problem Statement
              </label>
              <textarea
                rows={3}
                value={solverQuestion}
                onChange={(e) => setSolverQuestion(e.target.value)}
                placeholder="Paste question with options or code problem..."
                className="w-full text-xs sm:text-sm bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl p-4 text-[var(--text-main)] outline-none focus:border-[var(--primary)] resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-muted)]">Solver Mode:</span>
                <select
                  value={solverMode}
                  onChange={(e) => setSolverMode(e.target.value as any)}
                  className="text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-3 py-1.5 text-[var(--text-main)] outline-none"
                >
                  <option value="full_explanation">Full Step-by-Step Derivation</option>
                  <option value="hints_only">Progressive Hints Only</option>
                  <option value="generate_harder">Solve & Generate Harder Variation</option>
                  <option value="generate_similar">Solve & Generate Similar Variation</option>
                </select>
              </div>

              <button
                onClick={handleSolveQuestion}
                disabled={isSolving || !solverQuestion.trim()}
                className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs hover:opacity-90 shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {isSolving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>{isSolving ? 'Solving...' : 'Solve with LYRA'}</span>
              </button>
            </div>

            {solverResult && (
              <div className="p-5 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2 animate-in fade-in duration-150">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] block">
                  LYRA Pedagogical Solution
                </span>
                <div className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                  {solverResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 6: APP CONTROL & COMMAND CENTER                      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'actions' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-6">
          <div className="pb-4 border-b border-[var(--border-card)]">
            <h3 className="text-base font-bold text-[var(--text-main)]">Global App Command & Orchestration</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Control your goals, schedules, intensity, documents, and theme through natural-language commands (English & Hindi supported).
            </p>
          </div>

          {/* Command Input Box */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder='e.g. "मेरे लिए नया Goal बनाओ", "आज का plan rebalance करो", "Switch to Cloud theme"...'
                className="flex-1 text-xs sm:text-sm bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl px-4 py-3 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleRunCommand}
                disabled={isCommandExecuting || !commandInput.trim()}
                className="px-5 py-3 rounded-2xl bg-[var(--primary)] text-white font-bold text-xs hover:opacity-90 disabled:opacity-40 shadow-md flex items-center gap-1.5"
              >
                {isCommandExecuting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>Execute</span>
              </button>
            </div>

            {/* Quick Command Suggestions */}
            <div className="flex flex-wrap gap-1.5">
              {[
                'पूरे app का current status बताओ',
                'मेरे weak topics खोजो',
                'आज का plan rebalance करो',
                'मेरे गलत questions से revision pack बनाओ',
                'Switch to Cloud theme',
                'LYRA, analyze everything and setup whole app',
              ].map((sugg, i) => (
                <button
                  key={i}
                  onClick={() => setCommandInput(sugg)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-[var(--bg-app)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>

          {/* Command Execution Result Output */}
          {commandResult && (
            <div className="p-4 rounded-2xl bg-[var(--primary-light)] border border-[var(--primary)]/30 text-xs sm:text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
              {commandResult}
            </div>
          )}

          {/* Pending Action Confirmations (SAFE AI CONTROL SYSTEM) */}
          {pendingActions.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Pending Action Confirmation Required
              </span>
              {pendingActions.map((act) => (
                <div key={act.id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[var(--text-main)] block">{act.title}</span>
                    <span className="text-[var(--text-muted)]">{act.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRejectAction(act.id)}
                      className="px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleConfirmAction(act)}
                      className="px-4 py-1.5 rounded-xl bg-[var(--primary)] text-white font-bold shadow-xs"
                    >
                      Confirm & Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-MODE 7: TASK CENTER                                       */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'tasks' && (
        <div className="rounded-3xl p-6 sm:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[var(--border-card)] flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-main)]">LYRA Autonomous Task Center</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Active background AI operations, deep reasoning syntheses, and syllabus mappings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-main)]">{task.title}</span>
                    {task.isDeepThinking && (
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold flex items-center gap-1">
                        <BrainCircuit className="w-2.5 h-2.5" /> High Thinking
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                    task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-sky-500/10 text-sky-600'
                  }`}>
                    {task.status}
                  </span>
                </div>

                <p className="text-[11px] text-[var(--text-muted)]">{task.description}</p>

                {task.progress < 100 && (
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] overflow-hidden">
                    <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                )}

                {task.resultSummary && (
                  <div className="text-[11px] font-mono text-[var(--primary)] bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-card)]">
                    Result: {task.resultSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
