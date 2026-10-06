/**
 * WHO AM I? — LYRA Intelligent Assistant Modal
 * Multi-turn chat interface with model routing (Flash Lite / Flash / Pro Thinking),
 * document context attachment, suggested action dispatching, and voice readback.
 */

import React, { useState, useRef, useEffect } from 'react';
import { LyraMessage, ResourceDocument, Goal } from '../../types';
import { LyraAvatar } from './LyraAvatar';
import { GeminiClient } from '../../services/geminiClient';
import { StorageService } from '../../services/storage';
import {
  Send,
  X,
  Sparkles,
  Paperclip,
  Volume2,
  VolumeX,
  Search,
  BrainCircuit,
  Zap,
  RotateCcw,
  Bot,
} from 'lucide-react';

interface LyraChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onStartPracticePack?: (packId?: string) => void;
}

export const LyraChatModal: React.FC<LyraChatModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onStartPracticePack,
}) => {
  const [messages, setMessages] = useState<LyraMessage[]>(StorageService.getLyraMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modelChoice, setModelChoice] = useState<'general' | 'fast' | 'thinking'>('general');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const resources = StorageService.getResources();
  const activeGoal = StorageService.getActiveGoal();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: LyraMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    StorageService.addLyraMessage(userMsg);
    setIsLoading(true);

    try {
      // Find attached doc context if selected
      const attachedDoc = resources.find((r) => r.id === selectedDocId);

      const response = await GeminiClient.askLyra(
        updatedMessages.map((m) => ({ role: m.role, content: m.content })),
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

      const assistantMsg: LyraMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: response.text || 'I have completed your analysis.',
        timestamp: new Date().toISOString(),
        modelUsed: response.modelUsed || 'gemini-3.5-flash',
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      StorageService.addLyraMessage(assistantMsg);

      if (autoSpeak) {
        await GeminiClient.speakText(assistantMsg.content);
      }
    } catch (err: any) {
      console.error(err);
      const errorMsg: LyraMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: 'I had trouble processing that request. Please try again or check connection settings.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (action.actionType === 'NAVIGATE' && action.payload?.view) {
      onNavigateTab(action.payload.view);
      onClose();
    } else if (action.actionType === 'START_PRACTICE') {
      if (onStartPracticePack) onStartPracticePack(action.payload?.packId);
      onNavigateTab('practice');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl w-full max-w-lg h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right-8 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-card)] bg-[var(--bg-app)]">
          <div className="flex items-center gap-3">
            <LyraAvatar state={isLoading ? 'thinking' : 'idle'} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[var(--text-main)]">LYRA</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-mono font-semibold">
                  {modelChoice === 'thinking' ? 'Pro Thinking' : modelChoice === 'fast' ? 'Flash Lite' : 'Flash'}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Unified Personal AI Operating System
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Auto Speak Toggle */}
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-xl transition-colors ${
                autoSpeak ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]'
              }`}
              title={autoSpeak ? 'Auto-Speak Active' : 'Auto-Speak Off'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear history */}
            <button
              onClick={() => {
                StorageService.clearLyraMessages();
                setMessages(StorageService.getLyraMessages());
              }}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-card)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Model & Tool Toolbar */}
        <div className="px-4 py-2 border-b border-[var(--border-card)] bg-[var(--bg-card)] flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setModelChoice('fast')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                modelChoice === 'fast' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
              }`}
            >
              <Zap className="w-3 h-3" /> Fast
            </button>
            <button
              onClick={() => setModelChoice('general')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                modelChoice === 'general' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
              }`}
            >
              <Bot className="w-3 h-3" /> Standard
            </button>
            <button
              onClick={() => setModelChoice('thinking')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
                modelChoice === 'thinking' ? 'bg-[var(--primary)] text-white' : 'text-[var(--text-muted)] hover:bg-[var(--bg-app)]'
              }`}
            >
              <BrainCircuit className="w-3 h-3 text-amber-300" /> Thinking
            </button>
          </div>

          <button
            onClick={() => setUseSearchGrounding(!useSearchGrounding)}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 border transition-colors ${
              useSearchGrounding
                ? 'bg-sky-500/10 text-sky-600 border-sky-400/40'
                : 'border-[var(--border-card)] text-[var(--text-muted)]'
            }`}
            title="Search Grounding with Google Search"
          >
            <Search className="w-3 h-3" />
            <span>Search</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && <LyraAvatar state="idle" size="sm" />}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[var(--primary)] text-[var(--primary-text)] rounded-tr-xs'
                      : 'bg-[var(--bg-app)] border border-[var(--border-card)] text-[var(--text-main)] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Suggested Action Pills */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-[var(--border-card)]/40 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(act)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[var(--primary)]" />
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    {msg.modelUsed && (
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {msg.modelUsed}
                      </span>
                    )}
                    {!isUser && (
                      <button
                        onClick={() => GeminiClient.speakText(msg.content)}
                        className="text-[10px] text-[var(--primary)] hover:underline flex items-center gap-1 font-semibold ml-auto"
                        title="Listen in Lyra's sweet voice"
                      >
                        <Volume2 className="w-3 h-3" /> सुनें 🌸
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-center">
              <LyraAvatar state="thinking" size="sm" />
              <div className="p-3 rounded-2xl bg-[var(--bg-app)] border border-[var(--border-card)] text-xs text-[var(--text-muted)] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[var(--lyra-glow)] animate-spin" />
                LYRA is synthesizing knowledge...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Document Context Attachment Drawer */}
        {resources.length > 0 && (
          <div className="px-4 py-1.5 bg-[var(--bg-app)] border-t border-[var(--border-card)] flex items-center gap-2 text-xs">
            <Paperclip className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[11px] text-[var(--text-muted)]">Attach Doc:</span>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-lg px-2 py-0.5 text-[var(--text-main)] max-w-[240px] truncate outline-none"
            >
              <option value="">None (General Context)</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-[var(--border-card)] bg-[var(--bg-card)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask LYRA: solve a problem, generate practice, analyze PDF..."
              className="flex-1 text-xs sm:text-sm bg-[var(--bg-app)] border border-[var(--border-card)] rounded-2xl px-4 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-2xl bg-[var(--primary)] text-[var(--primary-text)] hover:opacity-90 disabled:opacity-40 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
