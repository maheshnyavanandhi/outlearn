import { LanguageCode, TeacherPersonality } from '../types';

export interface VoiceAssistantSpeechOptions {
  rate?: number;
  pitch?: number;
  personality?: TeacherPersonality;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

export interface RecognitionOptions {
  lang?: LanguageCode;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export interface VoiceState {
  isSpeaking: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  isSttSupported: boolean;
  isTtsSupported: boolean;
}

type VoiceStateListener = (state: VoiceState) => void;

class VoiceAssistantService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private transcript: string = '';
  private interimTranscript: string = '';
  private error: string | null = null;
  private listeners: Set<VoiceStateListener> = new Set();
  private isSttSupported: boolean = false;
  private isTtsSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check TTS support
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.isTtsSupported = true;
      }

      // Check STT support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.isSttSupported = true;
      }
    }
  }

  public getState(): VoiceState {
    return {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening,
      transcript: this.transcript,
      interimTranscript: this.interimTranscript,
      error: this.error,
      isSttSupported: this.isSttSupported,
      isTtsSupported: this.isTtsSupported
    };
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }

  // -------------------------------------------------------------
  // Speech Synthesis (Text To Speech - Teacher Voice)
  // -------------------------------------------------------------
  public speak(text: string, language: LanguageCode = 'en', options: VoiceAssistantSpeechOptions = {}) {
    if (!text || !text.trim()) return;

    if (!this.synth) {
      // Simulated audio playback fallback
      this.isSpeaking = true;
      this.notify();
      options.onStart?.();
      const approxDurationMs = Math.max(1600, text.length * 50);
      setTimeout(() => {
        this.isSpeaking = false;
        this.notify();
        options.onEnd?.();
      }, approxDurationMs);
      return;
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);

    // Language locale mapping
    let langLocale = 'en-US';
    if (language === 'hi') langLocale = 'hi-IN';
    else if (language === 'hinglish') langLocale = 'en-IN';
    else if (language === 'es') langLocale = 'es-ES';
    else if (language === 'ta') langLocale = 'ta-IN';
    else if (language === 'te') langLocale = 'te-IN';
    utterance.lang = langLocale;

    // Teacher personality pitch & rate tuning for human-like feeling
    let pitch = options.pitch ?? 1.0;
    let rate = options.rate ?? 1.0;

    if (options.personality === 'mentor') {
      pitch = 0.95; // Gentle, patient mentor
      rate = Math.min(rate, 0.95);
    } else if (options.personality === 'coach') {
      pitch = 1.0; // Crisp, structured exam coach
      rate = Math.max(rate, 1.02);
    } else if (options.personality === 'socratic') {
      pitch = 1.05; // Thoughtful, inquisitive socratic tutor
      rate = Math.min(rate, 0.95);
    } else if (options.personality === 'technical') {
      pitch = 1.0; // Clear, precise technical engineer
      rate = rate;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;

    // Pick best matching voice
    const voices = this.synth.getVoices();
    let matchedVoice: SpeechSynthesisVoice | undefined;

    if (language === 'hi') {
      matchedVoice = voices.find((v) => v.lang.startsWith('hi')) || voices.find((v) => v.lang.includes('IN'));
    } else if (language === 'hinglish') {
      matchedVoice = voices.find((v) => v.lang === 'en-IN') || voices.find((v) => v.lang.startsWith('hi')) || voices.find((v) => v.lang.startsWith('en'));
    } else if (language === 'ta') {
      matchedVoice = voices.find((v) => v.lang.startsWith('ta'));
    } else if (language === 'te') {
      matchedVoice = voices.find((v) => v.lang.startsWith('te'));
    } else if (language === 'es') {
      matchedVoice = voices.find((v) => v.lang.startsWith('es'));
    } else {
      matchedVoice = voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en'));
    }

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notify();
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('VoiceAssistant TTS error:', e);
      this.isSpeaking = false;
      this.notify();
      options.onEnd?.();
    };

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        options.onBoundary?.(e.charIndex);
      };
    }

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.notify();
  }

  // -------------------------------------------------------------
  // Speech Recognition (Speech To Text - Student Voice Answers)
  // -------------------------------------------------------------
  public startListening(options: RecognitionOptions = {}) {
    this.stopSpeaking(); // Pause teacher output while student speaks

    const SpeechRecognition = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      this.error = 'Web Speech API (SpeechRecognition) is not supported in this browser.';
      this.notify();
      options.onError?.(this.error);
      return;
    }

    if (this.isListening && this.recognition) {
      this.stopListening();
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = options.continuous ?? false;
      this.recognition.interimResults = options.interimResults ?? true;

      // Map language
      let recLang = 'en-US';
      if (options.lang === 'hi') recLang = 'hi-IN';
      else if (options.lang === 'hinglish') recLang = 'en-IN';
      else if (options.lang === 'es') recLang = 'es-ES';
      else if (options.lang === 'ta') recLang = 'ta-IN';
      else if (options.lang === 'te') recLang = 'te-IN';
      this.recognition.lang = recLang;

      this.transcript = '';
      this.interimTranscript = '';
      this.error = null;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notify();
        options.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript;
          } else {
            interimStr += res[0].transcript;
          }
        }

        if (finalStr) {
          this.transcript += (this.transcript ? ' ' : '') + finalStr;
          options.onResult?.(this.transcript, true);
        } else if (interimStr) {
          this.interimTranscript = interimStr;
          options.onResult?.(this.transcript + (this.transcript ? ' ' : '') + interimStr, false);
        }

        this.notify();
      };

      this.recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        this.error = event.error || 'Voice input error occurred';
        this.isListening = false;
        this.notify();
        options.onError?.(this.error || 'Voice error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notify();
        options.onEnd?.();
      };

      this.recognition.start();
    } catch (err: any) {
      console.warn('Failed to start SpeechRecognition:', err);
      this.error = err?.message || 'Could not access microphone';
      this.isListening = false;
      this.notify();
      options.onError?.(this.error || 'Microphone error');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore stop race conditions
      }
    }
    this.isListening = false;
    this.notify();
  }
}

export const voiceAssistantService = new VoiceAssistantService();
