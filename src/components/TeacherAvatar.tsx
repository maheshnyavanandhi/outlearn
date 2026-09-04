import React, { useEffect, useState } from 'react';
import { TeacherPersonality, TeacherPersonalityConfig } from '../types';
import { TEACHER_PERSONALITIES } from '../data/curriculumData';
import { Volume2, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

interface TeacherAvatarProps {
  personality: TeacherPersonality;
  isSpeaking: boolean;
  teacherMood?: 'explaining' | 'listening' | 'thinking' | 'celebrating' | 'questioning';
  speakingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  personality,
  isSpeaking,
  teacherMood = 'explaining',
  speakingText = '',
  size = 'md'
}) => {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0 = closed, 1 = slight, 2 = wide
  const [headTilt, setHeadTilt] = useState(0);

  const config: TeacherPersonalityConfig =
    TEACHER_PERSONALITIES.find((p) => p.id === personality) || TEACHER_PERSONALITIES[0];

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 3800 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Natural subtle head micro-movement
  useEffect(() => {
    const tiltInterval = setInterval(() => {
      setHeadTilt(Math.sin(Date.now() / 1500) * 2);
    }, 1200);
    return () => clearInterval(tiltInterval);
  }, []);

  // Lip-sync / talking mouth movement while speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const mouthInterval = setInterval(() => {
      // Alternate mouth shapes realistically
      setMouthOpen((prev) => (prev === 0 ? 1 : prev === 1 ? 2 : prev === 2 ? 1 : 0));
    }, 140);

    return () => clearInterval(mouthInterval);
  }, [isSpeaking]);

  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-48 h-48 sm:w-56 sm:h-56',
    lg: 'w-64 h-64 sm:w-72 sm:h-72'
  }[size];

  const moodBadges = {
    explaining: { text: 'Teaching', icon: Volume2, color: 'bg-[#F2EFEB] text-[#1C1C1C] border-[#1C1C1C]/20' },
    listening: { text: 'Listening to you', icon: HelpCircle, color: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30' },
    thinking: { text: 'Diagnosing response...', icon: Sparkles, color: 'bg-[#EDE9FE] text-[#5B21B6] border-[#8B5CF6]/30' },
    celebrating: { text: 'Concept Mastered!', icon: CheckCircle2, color: 'bg-[#D1FAE5] text-[#065F46] border-[#10B981]/30' },
    questioning: { text: 'Checking Understanding', icon: HelpCircle, color: 'bg-[#E0E7FF] text-[#3730A3] border-[#6366F1]/30' }
  };

  const currentBadge = moodBadges[teacherMood] || moodBadges.explaining;
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="relative flex flex-col items-center select-none" id="teacher-avatar-container">
      {/* Teacher Video Frame */}
      <div className={`relative ${sizeDimensions} rounded-2xl p-1 bg-[#FFFFFF] shadow-md border border-[#1C1C1C]/15 overflow-hidden`}>
        {/* Ambient Studio Lighting Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none transition-all duration-700"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${config.avatarStyle.accentColor} 0%, transparent 70%)`
          }}
        />

        {/* Live Studio Camera Badge */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1C1C1C] border border-[#1C1C1C] text-[9px] text-[#F9F8F6] font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isSpeaking ? 'ON AIR' : 'LIVE'}</span>
        </div>

        {/* Animated SVG Human-Like Avatar */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform transition-transform duration-300"
          style={{ transform: `rotate(${headTilt}deg)` }}
        >
          {/* Background backdrop gradient in Deep Carbon */}
          <rect width="200" height="200" rx="16" fill="#1C1C1C" />
          <circle cx="100" cy="80" r="70" fill={config.avatarStyle.accentColor} opacity="0.15" />

          {/* Shoulders & Clothing */}
          <path
            d="M 40 200 C 40 150, 70 142, 100 142 C 130 142, 160 150, 160 200 Z"
            fill={config.avatarStyle.shirtColor}
          />
          {/* Inner Collar / Shirt fold */}
          <path d="M 85 142 L 100 162 L 115 142 Z" fill="#ffffff" opacity="0.9" />

          {/* Optional Tie for Coach */}
          {config.avatarStyle.tie && (
            <path d="M 96 155 L 104 155 L 106 195 L 100 200 L 94 195 Z" fill="#be123c" />
          )}

          {/* Neck */}
          <rect x="90" y="125" width="20" height="22" rx="4" fill={config.avatarStyle.skinTone} />

          {/* Head & Face */}
          <ellipse cx="100" cy="95" rx="38" ry="46" fill={config.avatarStyle.skinTone} />

          {/* Hair style */}
          {personality === 'mentor' && (
            <path
              d="M 62 90 C 60 55, 75 42, 100 42 C 125 42, 140 55, 138 90 C 134 68, 126 52, 100 52 C 74 52, 66 68, 62 90 Z"
              fill={config.avatarStyle.hairColor}
            />
          )}
          {personality === 'coach' && (
            <path
              d="M 60 105 C 58 50, 70 40, 100 40 C 130 40, 142 50, 140 105 C 135 75, 128 50, 100 50 C 72 50, 65 75, 60 105 Z"
              fill={config.avatarStyle.hairColor}
            />
          )}
          {personality === 'socratic' && (
            <path
              d="M 60 95 C 58 45, 72 38, 100 38 C 128 38, 142 45, 140 95 C 135 60, 126 48, 100 48 C 74 48, 65 60, 60 95 Z"
              fill={config.avatarStyle.hairColor}
            />
          )}
          {personality === 'technical' && (
            <path
              d="M 64 85 C 60 52, 80 44, 100 44 C 120 44, 140 52, 136 85 C 132 58, 120 52, 100 52 C 80 52, 68 58, 64 85 Z"
              fill={config.avatarStyle.hairColor}
            />
          )}

          {/* Eyebrows */}
          <path
            d={teacherMood === 'questioning' ? 'M 78 82 Q 88 77 94 81' : 'M 78 81 Q 88 78 94 82'}
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={teacherMood === 'questioning' ? 'M 106 81 Q 112 75 122 79' : 'M 106 82 Q 112 78 122 81'}
            stroke="#1e293b"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Eyes (With natural blink animation) */}
          {blink ? (
            // Closed eyes during blink
            <>
              <path d="M 80 92 Q 87 96 94 92" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 106 92 Q 113 96 120 92" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : (
            // Open expressive eyes with pupils and reflection
            <>
              <ellipse cx="87" cy="92" rx="6" ry="6" fill="#ffffff" />
              <circle cx="87" cy="92" r="3.5" fill="#1e293b" />
              <circle cx="85.5" cy="90.5" r="1.2" fill="#ffffff" />

              <ellipse cx="113" cy="92" rx="6" ry="6" fill="#ffffff" />
              <circle cx="113" cy="92" r="3.5" fill="#1e293b" />
              <circle cx="111.5" cy="90.5" r="1.2" fill="#ffffff" />
            </>
          )}

          {/* Optional Glasses */}
          {config.avatarStyle.glasses && (
            <g stroke="#334155" strokeWidth="2.2" fill="none">
              <rect x="78" y="84" width="18" height="15" rx="3" />
              <rect x="104" y="84" width="18" height="15" rx="3" />
              <line x1="96" y1="91" x2="104" y2="91" />
              <line x1="78" y1="88" x2="68" y2="86" />
              <line x1="122" y1="88" x2="132" y2="86" />
            </g>
          )}

          {/* Nose */}
          <path d="M 100 95 L 98 107 L 103 107" stroke="#b48358" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Animated Mouth (Mouth Opening Synchronized with Speech) */}
          {mouthOpen === 0 ? (
            // Closed smiling mouth
            <path
              d="M 91 119 Q 100 126 109 119"
              stroke="#881337"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          ) : mouthOpen === 1 ? (
            // Medium open talking mouth
            <path
              d="M 91 118 Q 100 116 109 118 Q 100 128 91 118 Z"
              fill="#881337"
              stroke="#4c0519"
              strokeWidth="1.5"
            />
          ) : (
            // Open vocal mouth showing teeth and depth
            <g>
              <ellipse cx="100" cy="121" rx="9" ry="7" fill="#4c0519" />
              <rect x="94" y="117" width="12" height="3" rx="1" fill="#ffffff" />
              <path d="M 95 125 Q 100 123 105 125" fill="#f43f5e" />
            </g>
          )}
        </svg>

        {/* Real-time Vocal Audio Waveform beneath avatar in Editorial Carbon */}
        {isSpeaking && (
          <div className="absolute bottom-2 inset-x-4 z-10 flex items-center justify-center gap-1 py-1 px-3 rounded-full bg-[#1C1C1C]/90 backdrop-blur-md border border-[#1C1C1C] shadow-lg">
            <span className="w-1 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.1s]" />
            <span className="w-1 h-5 bg-[#FAF8F5] rounded-full animate-bounce [animation-delay:0.25s]" />
            <span className="w-1 h-4 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.15s]" />
            <span className="w-1 h-6 bg-[#FAF8F5] rounded-full animate-bounce [animation-delay:0.35s]" />
            <span className="w-1 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="text-[9px] text-[#FAF8F5] font-mono tracking-wider ml-1">VOICE SYNC</span>
          </div>
        )}
      </div>

      {/* Teacher Name & Pedagogical Mood Status */}
      <div className="mt-2.5 text-center">
        <h4 className="text-xs sm:text-sm font-serif font-bold text-[#1C1C1C]">{config.title}</h4>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-medium ${currentBadge.color}`}>
            <BadgeIcon className="w-3 h-3" />
            {currentBadge.text}
          </span>
        </div>
      </div>
    </div>
  );
};
