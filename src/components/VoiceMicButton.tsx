import React, { useState } from 'react';
import { Mic, MicOff, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { LanguageCode } from '../types';

interface VoiceMicButtonProps {
  onTranscriptChange: (transcript: string) => void;
  language?: LanguageCode;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  placeholder?: string;
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  onTranscriptChange,
  language = 'en',
  size = 'md',
  label = 'Voice Input',
  className = ''
}) => {
  const { isListening, interimTranscript, isSttSupported, startListening, stopListening } = useVoiceAssistant();
  const [micActive, setMicActive] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setMicActive(false);
    } else {
      setMicActive(true);
      startListening({
        lang: language,
        continuous: false,
        interimResults: true,
        onResult: (text) => {
          onTranscriptChange(text);
        },
        onError: () => {
          setMicActive(false);
        },
        onEnd: () => {
          setMicActive(false);
        }
      });
    }
  };

  if (!isSttSupported) {
    return (
      <button
        disabled
        title="Speech Recognition is not supported in this browser version"
        className={`opacity-50 cursor-not-allowed px-2.5 py-1.5 rounded-xl bg-[#F2EFEB] text-[#888888] border border-[#1C1C1C]/15 text-xs flex items-center gap-1.5 ${className}`}
      >
        <MicOff className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Mic Unavailable</span>
      </button>
    );
  }

  const buttonSizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-xs gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={toggleListening}
        className={`rounded-xl font-bold font-sans transition-all flex items-center justify-center shadow-xs border ${
          isListening || micActive
            ? 'bg-rose-600 border-rose-700 text-white animate-pulse ring-2 ring-rose-400/50'
            : 'bg-[#F2EFEB] hover:bg-[#E6E3DB] border-[#1C1C1C]/20 text-[#1C1C1C]'
        } ${buttonSizeClasses} ${className}`}
        title={isListening ? 'Click to Stop Voice Dictation' : 'Click to Dictate Answer with Microphone'}
      >
        {isListening ? (
          <>
            <div className="flex items-center gap-0.5 mr-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
            </div>
            <span>Listening...</span>
          </>
        ) : (
          <>
            <Mic className={`${iconSizes} text-rose-600`} />
            {label && <span>{label}</span>}
          </>
        )}
      </button>

      {/* Interim Speech Transcript Floating Badge */}
      {isListening && interimTranscript && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#1C1C1C] text-[#F9F8F6] text-[11px] px-3 py-1.5 rounded-lg shadow-xl font-serif z-50 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 border border-white/20">
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
          <span>"{interimTranscript}"</span>
        </div>
      )}
    </div>
  );
};
