/**
 * WHO AM I? — Client AI Service
 * Communicates with server endpoints for Gemini integration,
 * document analysis, question generation, and speech synthesis.
 */

import { Question, ResourceDocument, Goal } from '../types';
import { StorageService } from './storage';

export interface ChatOptions {
  modelPreference?: 'fast' | 'general' | 'thinking' | 'complex';
  systemInstruction?: string;
  userContext?: any;
  useSearch?: boolean;
}

// Reliably fetch browser speech synthesis voices across Chrome/Safari/Edge/Firefox
function getBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const current = window.speechSynthesis.getVoices();
    if (current && current.length > 0) {
      resolve(current);
      return;
    }

    const onVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices() || []);
    }, 250);
  });
}

export const GeminiClient = {
  async askLyra(messages: { role: string; content: string }[], options?: ChatOptions) {
    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          modelPreference: options?.modelPreference || 'general',
          systemInstruction: options?.systemInstruction,
          userContext: options?.userContext,
          useSearch: options?.useSearch,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('API call failed, falling back:', err.message);
      return {
        text: 'I am here with you. Your local learning tracks, documents, and question practice engine are fully functional.',
        modelUsed: 'offline-local-engine',
        suggestedActions: [
          { label: 'Practice Saved Questions', actionType: 'START_PRACTICE' },
          { label: 'View Daily Tasks', actionType: 'NAVIGATE', payload: { view: 'plan' } },
        ],
      };
    }
  },

  async researchGoal(dreamStatement: string, careerDirection: string, level?: string, availableHours?: number) {
    const res = await fetch('/api/gemini/research-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dreamStatement, careerDirection, level, availableHours }),
    });

    if (!res.ok) throw new Error('Goal research request failed');
    return await res.json();
  },

  async generateQuestions(config: {
    field: string;
    subject: string;
    chapter: string;
    topic: string;
    count: number;
    difficulty: string;
    questionType: string;
    documentContext?: string;
  }): Promise<Question[]> {
    const res = await fetch('/api/gemini/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    if (!res.ok) throw new Error('Question generation failed');
    const data = await res.json();
    return data.questions || [];
  },

  async solveQuestion(question: Question, mode: 'full_explanation' | 'hints_only' | 'generate_harder' | 'generate_similar', userQuery?: string) {
    const res = await fetch('/api/gemini/solve-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, mode, userQuery }),
    });

    if (!res.ok) throw new Error('Solve question request failed');
    return await res.json();
  },

  async analyzeDocument(text: string, filename: string, action: 'analyze' | 'summarize' | 'extract_questions' | 'generate_curriculum') {
    const res = await fetch('/api/gemini/document-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, filename, action }),
    });

    if (!res.ok) throw new Error('Document analysis failed');
    return await res.json();
  },

  // Client-side rate-limit cooldown tracker
  _ttsClientCooldownUntil: 0,
  _currentAudioPlayer: null as HTMLAudioElement | null,

  stopSpeaking() {
    if (typeof window !== 'undefined') {
      if (this._currentAudioPlayer) {
        this._currentAudioPlayer.pause();
        this._currentAudioPlayer = null;
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  },

  async speakText(text: string, voiceName?: string): Promise<void> {
    if (!text || !text.trim() || typeof window === 'undefined') return;

    // Clean text by stripping markdown symbols and excessive whitespace
    const cleanSpoken = text
      .replace(/[*#_`~•-]/g, ' ')
      .replace(/\[.*?\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpoken) return;

    this.stopSpeaking();

    const voiceSettings = StorageService.getVoiceSettings();
    const isHindiText = /[\u0900-\u097F]/.test(cleanSpoken) || voiceSettings.language === 'hi-IN';

    // 1. If server TTS is preferred and not in cooldown, try it
    const now = Date.now();
    let audioPlayed = false;

    if (now >= this._ttsClientCooldownUntil && !isHindiText) {
      try {
        const res = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanSpoken,
            voiceName: voiceName || voiceSettings.preferredVoiceName || 'Kore',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.inCooldown) {
            this._ttsClientCooldownUntil = Date.now() + 65000;
          }

          if (data.audioBase64) {
            const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
            this._currentAudioPlayer = audio;
            await audio.play();
            audioPlayed = true;
            return;
          }
        }
      } catch {
        // Fall through to browser speech synthesis
      }
    }

    // 2. High-quality Web Speech API with Sweet, Melodious Tone
    if (!audioPlayed && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();

        const utterance = new SpeechSynthesisUtterance(cleanSpoken);
        const voices = await getBrowserVoices();

        // Sweet melodious pitch & rate calibration
        let targetPitch = voiceSettings.pitch || 1.25; // Sweet, charming fairy pitch
        let targetRate = voiceSettings.rate || 1.0;
        let targetLang = isHindiText ? 'hi-IN' : 'en-US';

        if (voiceSettings.persona === 'warm_mentor') {
          targetPitch = 1.05;
          targetRate = 0.95;
        } else if (voiceSettings.persona === 'gentle_calm') {
          targetPitch = 1.15;
          targetRate = 0.9;
        } else if (voiceSettings.persona === 'clear_guide') {
          targetPitch = 1.1;
          targetRate = 1.05;
        }

        utterance.pitch = targetPitch;
        utterance.rate = targetRate;
        utterance.volume = voiceSettings.volume ?? 1.0;
        utterance.lang = targetLang;

        // Choose the sweetest, most natural voice available
        let bestVoice: SpeechSynthesisVoice | undefined;

        if (isHindiText) {
          bestVoice =
            voices.find(
              (v) =>
                (v.lang.startsWith('hi') || v.lang.includes('IN')) &&
                (v.name.includes('Google') ||
                  v.name.includes('Lekha') ||
                  v.name.includes('Swara') ||
                  v.name.includes('Female'))
            ) || voices.find((v) => v.lang.startsWith('hi'));
        }

        if (!bestVoice) {
          // Look for sweet, natural English female voices
          bestVoice =
            voices.find(
              (v) =>
                v.lang.startsWith('en') &&
                (v.name.includes('Samantha') ||
                  v.name.includes('Victoria') ||
                  v.name.includes('Google UK English Female') ||
                  v.name.includes('Google US English') ||
                  v.name.includes('Microsoft Zira') ||
                  v.name.includes('Karen') ||
                  v.name.includes('Natural') ||
                  v.name.includes('Female'))
            ) || voices.find((v) => v.lang.startsWith('en'));
        }

        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        // Prevent Chromium garbage collection bug
        (window as any).__currentLyraUtterance = utterance;

        utterance.onend = () => {
          (window as any).__currentLyraUtterance = null;
        };
        utterance.onerror = () => {
          (window as any).__currentLyraUtterance = null;
        };

        window.speechSynthesis.speak(utterance);
      } catch (synthErr) {
        console.warn('Speech synthesis notice:', synthErr);
      }
    }
  },

  async testVoice(sampleText?: string) {
    const voiceSettings = StorageService.getVoiceSettings();
    const isHindi = voiceSettings.language === 'hi-IN';

    const testPhrase =
      sampleText ||
      (isHindi
        ? 'नमस्ते! मैं लाइरा हूँ, आपकी AI साथी। मेरी आवाज़ बहुत मीठी और शांत है। हम मिलकर आपके हर सपने को पूरा करेंगे! 🌸'
        : 'Hello! I am LYRA, your personal AI companion. My voice is soft, sweet, and here to guide your goals every single day! ✨');

    await this.speakText(testPhrase);
  },

  async getReassessmentTest(currentMode: string, targetMode: string, goalTitle: string) {
    const res = await fetch('/api/gemini/reassessment-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentMode, targetMode, goalTitle }),
    });

    if (!res.ok) throw new Error('Failed to generate reassessment test');
    return await res.json();
  },

  async getSystemStatus() {
    try {
      const res = await fetch('/api/status');
      return await res.json();
    } catch {
      return { status: 'offline', geminiConfigured: false };
    }
  },
};
