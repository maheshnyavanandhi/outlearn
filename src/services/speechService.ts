import { LanguageCode, TeacherPersonality } from '../types';
import { voiceAssistantService } from './voiceAssistantService';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  personality?: TeacherPersonality;
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
}

class SpeechService {
  public subscribe(listener: (isSpeaking: boolean) => void) {
    return voiceAssistantService.subscribe((state) => listener(state.isSpeaking));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }

  public speak(text: string, language: LanguageCode = 'en', options: SpeechOptions = {}) {
    voiceAssistantService.speak(text, language, {
      rate: options.rate,
      pitch: options.pitch,
      personality: options.personality,
      onStart: options.onStart,
      onEnd: options.onEnd,
      onBoundary: options.onBoundary
    });
  }

  public stop() {
    voiceAssistantService.stopSpeaking();
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  public getSpeakingState(): boolean {
    return voiceAssistantService.getState().isSpeaking;
  }
}

export const speechService = new SpeechService();

