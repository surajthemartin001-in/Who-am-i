/**
 * WHO AM I? — LYRA Full-Screen Voice Call Screen
 * Full-screen interface with real microphone capture, Web Speech recognition,
 * real-time audio visualization, silence debounce, multi-language support (Hindi & English),
 * quick prompt chips, manual send fallback, and sweet voice synthesis.
 */

import React, { useState, useEffect, useRef } from 'react';
import { LyraAvatar } from './LyraAvatar';
import { LyraAvatarState, VoiceConnectionState } from '../../types';
import { GeminiClient } from '../../services/geminiClient';
import { StorageService } from '../../services/storage';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  RotateCcw,
  Send,
  Languages,
  Music,
} from 'lucide-react';

interface LyraVoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LyraVoiceCall: React.FC<LyraVoiceCallProps> = ({ isOpen, onClose }) => {
  const [avatarState, setAvatarState] = useState<LyraAvatarState>('idle');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lyraResponse, setLyraResponse] = useState<string>('Connecting voice link with LYRA...');
  const [connectionStatus, setConnectionStatus] = useState<VoiceConnectionState>('disconnected');
  const [selectedVoice, setSelectedVoice] = useState<'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'>('Kore');
  const [selectedLang, setSelectedLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [manualTextInput, setManualTextInput] = useState('');
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const latestSpeechRef = useRef<string>('');

  // Sync default language from storage
  useEffect(() => {
    const vSettings = StorageService.getVoiceSettings();
    if (vSettings.language === 'en-US') {
      setSelectedLang('en-US');
    } else {
      setSelectedLang('hi-IN');
    }
  }, []);

  // Initialize Speech Recognition & Audio Context on open
  useEffect(() => {
    if (!isOpen) {
      cleanupAudioSession();
      return;
    }

    startConnection();

    return () => {
      cleanupAudioSession();
    };
  }, [isOpen, selectedLang]);

  const startConnection = async () => {
    setConnectionStatus('connecting');
    setLyraResponse('Requesting microphone permission & calibrating audio...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      initAudioVisualizer(stream);
      startSpeechRecognition();

      setConnectionStatus('connected');
      setIsListening(true);
      setAvatarState('idle');
      setLyraResponse(
        selectedLang === 'hi-IN'
          ? 'नमस्ते! मैं सुन रही हूँ। आप हिंदी या English में कुछ भी बोल सकते हैं। 🌸'
          : 'Connected! Speak naturally, I am listening in real-time. ✨'
      );
      setReconnectAttempts(0);
    } catch (err: any) {
      console.warn('Microphone initialization notice:', err);
      setConnectionStatus('error');
      setAvatarState('error');
      setLyraResponse('Microphone permission was denied or device unavailable. You can type below or test voice.');
    }
  };

  const cleanupAudioSession = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
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
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setConnectionStatus('disconnected');
    setIsListening(false);
  };

  const handleRetryConnection = () => {
    if (reconnectAttempts >= 3) {
      setConnectionStatus('error');
      setLyraResponse('Reconnection limit reached. You can continue interacting using text mode.');
      return;
    }
    setReconnectAttempts((a) => a + 1);
    setConnectionStatus('reconnecting');
    setTimeout(() => {
      startConnection();
    }, 1200);
  };

  // Audio Visualizer Setup
  const initAudioVisualizer = (stream: MediaStream) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawVisualizer();
    } catch {
      drawSimulatedVisualizer();
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = `rgba(180, 83, 9, ${Math.max(0.2, dataArray[i] / 255)})`;
        ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    render();
  };

  const drawSimulatedVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      phase += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bars = 24;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = (Math.sin(phase + i * 0.4) * 0.5 + 0.5) * canvas.height * 0.6;
        ctx.fillStyle = isListening ? 'rgba(180, 83, 9, 0.45)' : 'rgba(120, 113, 108, 0.2)';
        ctx.fillRect(i * barWidth, (canvas.height - height) / 2, barWidth - 4, height);
      }
    };
    render();
  };

  // Robust Speech Recognition with Silence Debounce and Multi-language Support
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported in this browser.');
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
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setAvatarState('listening');
      };

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
          latestSpeechRef.current = trimmed;
          setTranscript(trimmed);
          setAvatarState('listening');

          // If final, send immediately
          if (hasFinal) {
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
            handleUserVoiceInput(trimmed);
          } else {
            // Silence debounce fallback: if user pauses for 1.3 seconds, trigger automatically
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              if (latestSpeechRef.current.trim().length > 1) {
                handleUserVoiceInput(latestSpeechRef.current.trim());
              }
            }, 1300);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          console.warn('Speech recognition notice:', event.error);
        }
      };

      recognition.onend = () => {
        if (isListening && !isMuted) {
          try {
            recognition.start();
          } catch {
            // ignore restart collision
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Failed to start speech recognition:', e);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  };

  // Handle user speech sent to LYRA
  const handleUserVoiceInput = async (spokenText: string) => {
    const clean = spokenText.trim();
    if (!clean) return;

    // Reset latest speech tracker so debounce doesn't re-trigger
    latestSpeechRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    setAvatarState('thinking');
    setLyraResponse(
      selectedLang === 'hi-IN' ? 'लाइरा सोच रही है... 🌟' : 'LYRA is reasoning... 🌟'
    );

    const activeGoal = StorageService.getActiveGoal();
    const userProfile = StorageService.getUserProfile();

    try {
      const response = await GeminiClient.askLyra(
        [{ role: 'user', content: clean }],
        {
          modelPreference: 'fast',
          userContext: {
            goal: activeGoal.title,
            career: activeGoal.careerDirection,
            user: userProfile.name,
            language: selectedLang,
          },
          systemInstruction: `You are LYRA speaking on a real-time voice call.
Personality: Extremely sweet, warm, friendly, clear, and encouraging fairy operating system (बहुत ही मीठी और प्यारी आवाज़ में बात करें).
If the user spoke in Hindi or Hinglish, reply in warm natural Hindi/Hinglish.
Keep responses concise (1 to 2 warm, crisp, motivating sentences) suitable for voice. Never use markdown symbols like asterisks or hashtags.`,
        }
      );

      const reply =
        response.text ||
        (selectedLang === 'hi-IN'
          ? 'मैं आपकी बात समझ गई। चलिए अपने अगले कदम की ओर आगे बढ़ते हैं!'
          : 'I hear you. Let us take the next step together!');

      setLyraResponse(reply);
      setAvatarState('speaking');
      setConnectionStatus('connected');

      // Speak out loud in sweet voice if speaker is not muted
      if (!isSpeakerMuted) {
        await GeminiClient.speakText(reply, selectedVoice);
      }

      setTimeout(() => {
        setAvatarState(isListening ? 'listening' : 'idle');
      }, 3500);
    } catch (err) {
      console.error(err);
      setAvatarState('error');
      setLyraResponse('I had a brief glitch reaching the server. Please speak again.');
      setTimeout(() => setAvatarState('idle'), 2500);
    }
  };

  // Quick Prompt Dispatcher
  const handleSendPrompt = (promptText: string) => {
    setTranscript(promptText);
    handleUserVoiceInput(promptText);
  };

  // Manual Text Submit
  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTextInput.trim()) return;
    const txt = manualTextInput.trim();
    setManualTextInput('');
    setTranscript(txt);
    handleUserVoiceInput(txt);
  };

  // Voice Test
  const handleTestSweetVoice = async () => {
    setIsTestingVoice(true);
    setAvatarState('speaking');
    setLyraResponse(
      selectedLang === 'hi-IN'
        ? 'नमस्ते! मैं लाइरा हूँ। मेरी आवाज़ बहुत ही मीठी और शांत है। 🌸'
        : 'Hello! I am LYRA. My voice is soft, sweet, and here for you! ✨'
    );
    await GeminiClient.testVoice();
    setIsTestingVoice(false);
    setTimeout(() => {
      setAvatarState('idle');
    }, 2000);
  };

  // Toggle Listening
  const toggleListening = () => {
    if (isListening) {
      stopSpeechRecognition();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      setIsListening(true);
      startSpeechRecognition();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-black tracking-wide">LYRA VOICE CALL</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-mono font-bold">
            {connectionStatus.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <button
            onClick={() => {
              const next = selectedLang === 'hi-IN' ? 'en-US' : 'hi-IN';
              setSelectedLang(next);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-app)] text-xs font-semibold text-[var(--text-main)] hover:border-[var(--primary)]"
            title="Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{selectedLang === 'hi-IN' ? '🇮🇳 हिन्दी / Hinglish' : '🌐 English (US)'}</span>
          </button>

          {/* Test Sweet Voice Button */}
          <button
            onClick={handleTestSweetVoice}
            disabled={isTestingVoice}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-[var(--primary-text)] transition-colors"
            title="Hear Lyra Sweet Voice"
          >
            <Music className="w-3.5 h-3.5" />
            <span>आवाज़ टेस्ट करें 🌸</span>
          </button>

          {/* Voice Selector */}
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value as any)}
            className="text-xs bg-[var(--bg-app)] border border-[var(--border-card)] rounded-xl px-2.5 py-1.5 text-[var(--text-main)] outline-none"
          >
            <option value="Kore">Kore (Sweet & Warm)</option>
            <option value="Puck">Puck (Playful Fairy)</option>
            <option value="Fenrir">Fenrir (Calm Mentor)</option>
            <option value="Zephyr">Zephyr (Futuristic Clear)</option>
          </select>
        </div>
      </div>

      {/* Main Center Call Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 max-w-2xl mx-auto w-full text-center py-4">
        {/* Fairy Avatar with Glow */}
        <div className="relative mb-4">
          <LyraAvatar state={avatarState} size="xl" showLabel={false} />
        </div>

        {/* Dynamic LYRA State Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-card)] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[var(--lyra-glow)]" />
            {avatarState === 'listening' && (selectedLang === 'hi-IN' ? 'आपकी आवाज़ सुन रही हूँ... बोलिए 🎙️' : 'Listening to your voice... Speak naturally 🎙️')}
            {avatarState === 'thinking' && (selectedLang === 'hi-IN' ? 'लाइरा सोच रही है... 🌟' : 'LYRA is thinking... 🌟')}
            {avatarState === 'speaking' && (selectedLang === 'hi-IN' ? 'लाइरा बोल रही है... 🌸' : 'LYRA is speaking... 🌸')}
            {avatarState === 'idle' && (selectedLang === 'hi-IN' ? 'लाइरा तैयार है' : 'LYRA is ready')}
            {avatarState === 'error' && 'Reconnecting audio session...'}
          </span>
        </div>

        {/* Audio Spectrum Canvas */}
        <div className="w-full max-w-md h-12 mb-4 rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center p-2">
          <canvas ref={canvasRef} width={360} height={40} className="w-full h-full" />
        </div>

        {/* Live Conversation Display */}
        <div className="w-full bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-5 shadow-sm text-left space-y-3">
          {transcript && (
            <div className="text-xs text-[var(--text-muted)] italic border-l-2 border-[var(--primary)] pl-2.5">
              <strong>You said:</strong> "{transcript}"
            </div>
          )}
          <div className="text-sm font-semibold leading-relaxed text-[var(--text-main)]">
            {lyraResponse}
          </div>

          {/* Action buttons inside response card */}
          <div className="pt-2 border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-2">
            {transcript && (
              <button
                onClick={() => handleUserVoiceInput(transcript)}
                className="px-3.5 py-1.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>उत्तर सुनें / Send Now</span>
              </button>
            )}

            {connectionStatus === 'error' && (
              <button
                onClick={handleRetryConnection}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:opacity-90 shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Voice Prompt Chips */}
        <div className="mt-4 w-full flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => handleSendPrompt(selectedLang === 'hi-IN' ? 'लाइरा, आप कौन हो?' : 'Who are you LYRA?')}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"
          >
            🌸 {selectedLang === 'hi-IN' ? 'लाइरा, आप कौन हो?' : 'Who are you LYRA?'}
          </button>
          <button
            onClick={() => handleSendPrompt(selectedLang === 'hi-IN' ? 'मेरे goals को analyze करो' : 'Analyze my goals')}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"
          >
            📊 {selectedLang === 'hi-IN' ? 'मेरे goals को analyze करो' : 'Analyze my goals'}
          </button>
          <button
            onClick={() => handleSendPrompt(selectedLang === 'hi-IN' ? 'आज का study plan बताओ' : 'What is today’s plan?')}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"
          >
            ⏱️ {selectedLang === 'hi-IN' ? 'आज का study plan बताओ' : 'Today’s study plan'}
          </button>
          <button
            onClick={() => handleSendPrompt(selectedLang === 'hi-IN' ? 'मुझे कुछ प्रेरणादायक बताओ' : 'Tell me something motivating')}
            className="text-xs px-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] hover:border-[var(--primary)] text-[var(--text-main)] transition-colors"
          >
            ✨ {selectedLang === 'hi-IN' ? 'प्रेरणादायक संदेश' : 'Motivation'}
          </button>
        </div>

        {/* Text Fallback Bar */}
        <form onSubmit={handleManualTextSubmit} className="mt-4 w-full max-w-md flex items-center gap-2">
          <input
            type="text"
            value={manualTextInput}
            onChange={(e) => setManualTextInput(e.target.value)}
            placeholder={selectedLang === 'hi-IN' ? 'माइक काम न करे तो यहाँ टाइप करें...' : 'Mic noisy? Type here to talk...'}
            className="flex-1 text-xs bg-[var(--bg-card)] border border-[var(--border-card)] rounded-xl px-3.5 py-2.5 text-[var(--text-main)] outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={!manualTextInput.trim()}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-text)] font-bold text-xs disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Bottom Call Controls */}
      <div className="px-6 py-5 border-t border-[var(--border-card)] bg-[var(--bg-card)]">
        <div className="max-w-md mx-auto flex items-center justify-center gap-5">
          {/* Mute Microphone */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full transition-all duration-200 border ${
              isMuted
                ? 'bg-rose-100 text-rose-600 border-rose-300'
                : 'bg-[var(--bg-app)] text-[var(--text-main)] border-[var(--border-card)] hover:bg-[var(--bg-card-hover)]'
            }`}
            title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Listening Toggle (ON/OFF) */}
          <button
            onClick={toggleListening}
            className={`px-5 py-3 rounded-full text-xs font-bold tracking-wider transition-all duration-200 border ${
              isListening
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-500/20'
                : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-card)]'
            }`}
          >
            {isListening ? '🎙️ LISTENING ON' : 'PAUSED'}
          </button>

          {/* Speaker Mute */}
          <button
            onClick={() => {
              if (!isSpeakerMuted) {
                GeminiClient.stopSpeaking();
              }
              setIsSpeakerMuted(!isSpeakerMuted);
            }}
            className={`p-3.5 rounded-full transition-all duration-200 border ${
              isSpeakerMuted
                ? 'bg-amber-100 text-amber-600 border-amber-300'
                : 'bg-[var(--bg-app)] text-[var(--text-main)] border-[var(--border-card)] hover:bg-[var(--bg-card-hover)]'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={onClose}
            className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all duration-200"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
