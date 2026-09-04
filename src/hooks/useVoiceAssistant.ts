import { useState, useEffect, useCallback } from 'react';
import {
  voiceAssistantService,
  VoiceState,
  VoiceAssistantSpeechOptions,
  RecognitionOptions
} from '../services/voiceAssistantService';
import { LanguageCode } from '../types';

export function useVoiceAssistant() {
  const [voiceState, setVoiceState] = useState<VoiceState>(() => voiceAssistantService.getState());

  useEffect(() => {
    const unsubscribe = voiceAssistantService.subscribe((newState) => {
      setVoiceState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const speak = useCallback(
    (text: string, language: LanguageCode = 'en', options?: VoiceAssistantSpeechOptions) => {
      voiceAssistantService.speak(text, language, options);
    },
    []
  );

  const stopSpeaking = useCallback(() => {
    voiceAssistantService.stopSpeaking();
  }, []);

  const startListening = useCallback((options?: RecognitionOptions) => {
    voiceAssistantService.startListening(options);
  }, []);

  const stopListening = useCallback(() => {
    voiceAssistantService.stopListening();
  }, []);

  return {
    ...voiceState,
    speak,
    stopSpeaking,
    startListening,
    stopListening
  };
}
