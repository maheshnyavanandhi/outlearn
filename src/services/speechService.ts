import { LanguageCode } from '../types';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private speechListeners: Set<(isSpeaking: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public subscribe(listener: (isSpeaking: boolean) => void) {
    this.speechListeners.add(listener);
    return () => {
      this.speechListeners.delete(listener);
    };
  }

  private notify(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speechListeners.forEach((fn) => fn(speaking));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public speak(text: string, language: LanguageCode = 'en', options: SpeechOptions = {}) {
    if (!this.synth) {
      // Fallback timer simulation for environments without audio
      this.notify(true);
      options.onStart?.();
      const approxDurationMs = Math.max(1800, text.length * 55);
      setTimeout(() => {
        this.notify(false);
        options.onEnd?.();
      }, approxDurationMs);
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Select voice according to language
    const voices = this.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (language === 'hi') {
      selectedVoice = voices.find((v) => v.lang.startsWith('hi')) ||
                      voices.find((v) => v.lang.includes('IN')) ||
                      voices[0];
      utterance.lang = 'hi-IN';
    } else if (language === 'hinglish') {
      selectedVoice = voices.find((v) => v.lang === 'en-IN') ||
                      voices.find((v) => v.lang.startsWith('hi')) ||
                      voices.find((v) => v.lang.startsWith('en')) ||
                      voices[0];
      utterance.lang = 'en-IN';
    } else if (language === 'es') {
      selectedVoice = voices.find((v) => v.lang.startsWith('es')) || voices[0];
      utterance.lang = 'es-ES';
    } else if (language === 'ta') {
      selectedVoice = voices.find((v) => v.lang.startsWith('ta')) || voices[0];
      utterance.lang = 'ta-IN';
    } else if (language === 'te') {
      selectedVoice = voices.find((v) => v.lang.startsWith('te')) || voices[0];
      utterance.lang = 'te-IN';
    } else {
      selectedVoice = voices.find((v) => v.lang === 'en-US' || v.lang === 'en-GB' || v.lang.startsWith('en')) || voices[0];
      utterance.lang = 'en-US';
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    utterance.onstart = () => {
      this.notify(true);
      options.onStart?.();
    };

    utterance.onend = () => {
      this.notify(false);
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.notify(false);
      options.onEnd?.();
    };

    if (options.onBoundary) {
      utterance.onboundary = (e) => {
        options.onBoundary?.(e.charIndex);
      };
    }

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.notify(false);
  }

  public pause() {
    if (this.synth) {
      this.synth.pause();
    }
    this.notify(false);
  }

  public resume() {
    if (this.synth) {
      this.synth.resume();
      this.notify(true);
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const speechService = new SpeechService();
