import React, { useEffect, useState, useRef, useMemo } from 'react';
import { TeacherPersonality, TeacherPersonalityConfig } from '../types';
import { TEACHER_PERSONALITIES } from '../data/curriculumData';
import { Volume2, Sparkles, HelpCircle, CheckCircle2, Video, Eye, Mic, Disc } from 'lucide-react';

interface TeacherAvatarProps {
  personality: TeacherPersonality;
  isSpeaking: boolean;
  teacherMood?: 'explaining' | 'listening' | 'thinking' | 'celebrating' | 'questioning';
  speakingText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showControls?: boolean;
}

interface AudioChunk {
  word: string;
  durationMs: number;
  viseme: 0 | 1 | 2 | 3; // 0: closed, 1: vowel (slight), 2: consonant (wide), 3: rounded 'O'
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  personality,
  isSpeaking,
  teacherMood = 'explaining',
  speakingText = '',
  size = 'md',
  showControls = size !== 'sm' && size !== 'xs'
}) => {
  const [blink, setBlink] = useState(false);
  const [mouthOpen, setMouthOpen] = useState<0 | 1 | 2 | 3>(0);
  const [headTilt, setHeadTilt] = useState(0);
  const [headNod, setHeadNod] = useState(0);
  const [renderMode, setRenderMode] = useState<'vector' | 'canvas3d'>('vector');
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(-1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const config: TeacherPersonalityConfig =
    TEACHER_PERSONALITIES.find((p) => p.id === personality) || TEACHER_PERSONALITIES[0];

  // 1. Audio Timing Chunk Mapper
  const audioChunks = useMemo<AudioChunk[]>(() => {
    if (!speakingText || !speakingText.trim()) return [];
    
    // Split speaking text into word chunks
    const words = speakingText.replace(/[^\w\s']/g, '').split(/\s+/).filter(Boolean);
    return words.map((w) => {
      const lower = w.toLowerCase();
      let viseme: 0 | 1 | 2 | 3 = 1;
      
      if (/[o0u]/.test(lower)) {
        viseme = 3; // Rounded 'o' phoneme
      } else if (/[aei]/.test(lower)) {
        viseme = 1; // Open vowel
      } else if (/[mbp]/.test(lower)) {
        viseme = 0; // Lip closure
      } else {
        viseme = 2; // Consonant / wide open
      }

      // Base timing: ~180ms - 320ms per word based on length
      const durationMs = Math.max(160, Math.min(360, w.length * 45));
      return { word: w, durationMs, viseme };
    });
  }, [speakingText]);

  // 2. Audio-Chunk Synchronization Layer
  useEffect(() => {
    if (!isSpeaking || audioChunks.length === 0) {
      setActiveChunkIndex(-1);
      setMouthOpen(0);
      return;
    }

    let chunkIdx = 0;
    let isSubscribed = true;

    const playNextChunk = () => {
      if (!isSubscribed) return;

      if (chunkIdx >= audioChunks.length) {
        chunkIdx = 0; // loop chunks if audio continues
      }

      const chunk = audioChunks[chunkIdx];
      setActiveChunkIndex(chunkIdx);
      setMouthOpen(chunk.viseme);

      chunkIdx++;
      setTimeout(playNextChunk, chunk.durationMs);
    };

    playNextChunk();

    return () => {
      isSubscribed = false;
    };
  }, [isSpeaking, audioChunks]);

  // 3. Natural Blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 170);
    }, 3600 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // 4. Micro head-tilt & speech nod physics with smooth CSS interpolation
  useEffect(() => {
    let animationFrameId: number;
    let startTime = Date.now();

    const animateBodyLanguage = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Idle head sway
      const tilt = Math.sin(elapsed * 1.2) * 2.5;
      setHeadTilt(tilt);

      // Speech nod physics when speaking
      if (isSpeaking) {
        const nod = Math.sin(elapsed * 6.5) * 3.8;
        setHeadNod(nod);
      } else {
        setHeadNod(0);
      }

      animationFrameId = requestAnimationFrame(animateBodyLanguage);
    };

    animationFrameId = requestAnimationFrame(animateBodyLanguage);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSpeaking]);

  // 5. Canvas 3D Studio Renderer Loop
  useEffect(() => {
    if (renderMode !== 'canvas3d' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render3DStudioCanvas = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Studio Backdrop & Depth Gradient
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width / 1.2);
      grad.addColorStop(0, '#2C2C2C');
      grad.addColorStop(1, '#111111');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Audio Spectrum Particles
      if (isSpeaking) {
        ctx.save();
        ctx.strokeStyle = config.avatarStyle.accentColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.35;
        for (let i = 0; i < 5; i++) {
          const r = 50 + i * 15 + Math.sin(time * 4 + i) * 8;
          ctx.beginPath();
          ctx.arc(width / 2, height / 2 - 10, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Render Shoulders
      ctx.save();
      ctx.fillStyle = config.avatarStyle.shirtColor;
      ctx.beginPath();
      ctx.ellipse(width / 2, height + 10, 65, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Neck & Head with Tilt
      ctx.save();
      ctx.translate(width / 2, height / 2 - 10);
      ctx.rotate((headTilt * Math.PI) / 180);
      ctx.translate(0, headNod);

      // Neck
      ctx.fillStyle = config.avatarStyle.skinTone;
      ctx.fillRect(-12, 25, 24, 25);

      // Face Oval
      ctx.fillStyle = config.avatarStyle.skinTone;
      ctx.beginPath();
      ctx.ellipse(0, 0, 36, 44, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = config.avatarStyle.hairColor;
      ctx.beginPath();
      ctx.arc(0, -10, 38, Math.PI * 0.85, Math.PI * 2.15);
      ctx.fill();

      // Eyes & Blink
      if (blink) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, -6);
        ctx.lineTo(-8, -6);
        ctx.moveTo(8, -6);
        ctx.lineTo(18, -6);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-13, -6, 5.5, 0, Math.PI * 2);
        ctx.arc(13, -6, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        const lookX = isSpeaking ? Math.sin(time * 2) * 1.5 : 0;
        ctx.arc(-13 + lookX, -6, 3, 0, Math.PI * 2);
        ctx.arc(13 + lookX, -6, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3D Mouth Viseme Shape mapped to Audio Chunk timing
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      if (mouthOpen === 0) {
        ctx.ellipse(0, 18, 8, 2, 0, 0, Math.PI * 2);
      } else if (mouthOpen === 1) {
        ctx.ellipse(0, 18, 10, 5, 0, 0, Math.PI * 2);
      } else if (mouthOpen === 2) {
        ctx.ellipse(0, 19, 12, 8, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(0, 19, 7, 0, Math.PI * 2);
      }
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render3DStudioCanvas);
    };

    animId = requestAnimationFrame(render3DStudioCanvas);
    return () => cancelAnimationFrame(animId);
  }, [renderMode, isSpeaking, headTilt, headNod, mouthOpen, blink, config]);

  const sizeDimensions = {
    xs: 'w-10 h-10',
    sm: 'w-20 h-20',
    md: 'w-48 h-48 sm:w-56 sm:h-56',
    lg: 'w-64 h-64 sm:w-72 sm:h-72'
  }[size];

  // Pedagogical mood badges
  const moodBadgeMap = {
    explaining: { text: 'EXPLAINING', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Sparkles },
    listening: { text: 'LISTENING', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Volume2 },
    thinking: { text: 'ANALYZING', color: 'bg-sky-100 text-sky-900 border-sky-300', icon: Disc },
    celebrating: { text: 'EXCELLENT!', color: 'bg-amber-100 text-amber-900 border-amber-400', icon: CheckCircle2 },
    questioning: { text: 'QUESTION', color: 'bg-rose-100 text-rose-900 border-rose-300', icon: HelpCircle }
  };

  const currentBadge = moodBadgeMap[teacherMood] || moodBadgeMap.explaining;
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="relative flex flex-col items-center select-none w-full max-w-full overflow-hidden" id="teacher-avatar-container">
      {/* Mode Switcher Pill */}
      {showControls && (
        <div className="flex items-center gap-1 mb-2 p-0.5 rounded-lg bg-[#F2EFEB] border border-[#1C1C1C]/15">
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setRenderMode('vector');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                setRenderMode('vector');
              }
            }}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
              renderMode === 'vector' ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-2xs' : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Vector Avatar</span>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setRenderMode('canvas3d');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                setRenderMode('canvas3d');
              }
            }}
            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
              renderMode === 'canvas3d' ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-2xs' : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            <Eye className="w-3 h-3 text-amber-400" />
            <span>3D Studio Mesh</span>
          </div>
        </div>
      )}

      {/* Teacher Video Frame */}
      <div className={`relative ${sizeDimensions} rounded-2xl p-1 bg-[#FFFFFF] shadow-md border border-[#1C1C1C]/15 overflow-hidden transition-all duration-300`}>
        {/* Ambient Studio Lighting Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${config.avatarStyle.accentColor} 0%, transparent 70%)`
          }}
        />

        {/* Live Studio Camera Badge */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1C1C1C] border border-[#1C1C1C] text-[9px] text-[#F9F8F6] font-mono transition-all duration-300">
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isSpeaking ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
          <span>{isSpeaking ? 'ON AIR' : 'LIVE'}</span>
        </div>

        {/* Render Mode 1: 3D Studio Canvas */}
        {renderMode === 'canvas3d' ? (
          <canvas
            ref={canvasRef}
            width={240}
            height={240}
            className="w-full h-full rounded-xl object-cover transition-opacity duration-300"
          />
        ) : (
          /* Render Mode 2: Animated Vector Video Avatar with CSS Transitions */
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full transform transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${headTilt}deg) translateY(${headNod}px)` }}
          >
            {/* Background backdrop gradient in Deep Carbon */}
            <rect width="200" height="200" rx="16" fill="#1C1C1C" />
            <circle cx="100" cy="80" r="70" fill={config.avatarStyle.accentColor} opacity="0.15" className="transition-opacity duration-500" />

            {/* Shoulders & Clothing with CSS Transitions */}
            <path
              d="M 40 200 C 40 150, 70 142, 100 142 C 130 142, 160 150, 160 200 Z"
              fill={config.avatarStyle.shirtColor}
              className="transition-colors duration-500"
            />
            {/* Inner Collar / Shirt fold */}
            <path d="M 85 142 L 100 162 L 115 142 Z" fill="#ffffff" opacity="0.9" />

            {/* Optional Tie for Coach */}
            {config.avatarStyle.tie && (
              <path d="M 96 155 L 104 155 L 106 195 L 100 200 L 94 195 Z" fill="#be123c" />
            )}

            {/* Neck */}
            <rect x="90" y="125" width="20" height="22" rx="4" fill={config.avatarStyle.skinTone} className="transition-colors duration-500" />

            {/* Head & Face Oval */}
            <ellipse cx="100" cy="95" rx="38" ry="46" fill={config.avatarStyle.skinTone} className="transition-colors duration-500" />

            {/* Hair style with smooth transition */}
            {personality === 'mentor' && (
              <path
                d="M 62 90 C 60 55, 75 42, 100 42 C 125 42, 140 55, 138 90 C 134 68, 126 52, 100 52 C 74 52, 66 68, 62 90 Z"
                fill={config.avatarStyle.hairColor}
                className="transition-colors duration-500"
              />
            )}
            {personality === 'coach' && (
              <path
                d="M 60 105 C 58 50, 70 40, 100 40 C 130 40, 142 50, 140 105 C 135 75, 128 50, 100 50 C 72 50, 65 75, 60 105 Z"
                fill={config.avatarStyle.hairColor}
                className="transition-colors duration-500"
              />
            )}
            {personality === 'socratic' && (
              <path
                d="M 60 95 C 58 45, 72 38, 100 38 C 128 38, 142 45, 140 95 C 135 60, 126 48, 100 48 C 74 48, 65 60, 60 95 Z"
                fill={config.avatarStyle.hairColor}
                className="transition-colors duration-500"
              />
            )}
            {personality === 'technical' && (
              <path
                d="M 64 85 C 60 52, 80 44, 100 44 C 120 44, 140 52, 136 85 C 132 58, 120 52, 100 52 C 80 52, 68 58, 64 85 Z"
                fill={config.avatarStyle.hairColor}
                className="transition-colors duration-500"
              />
            )}

            {/* Eyebrows with CSS Transitions for Expression Shifts */}
            <g className="transition-all duration-300 ease-in-out">
              <path
                d={
                  teacherMood === 'questioning'
                    ? 'M 78 82 Q 88 75 94 80'
                    : teacherMood === 'celebrating'
                    ? 'M 78 78 Q 88 74 94 78'
                    : teacherMood === 'thinking'
                    ? 'M 78 84 Q 88 80 94 83'
                    : 'M 78 81 Q 88 78 94 82'
                }
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300 ease-in-out"
              />
              <path
                d={
                  teacherMood === 'questioning'
                    ? 'M 106 80 Q 112 75 122 82'
                    : teacherMood === 'celebrating'
                    ? 'M 106 78 Q 112 74 122 78'
                    : teacherMood === 'thinking'
                    ? 'M 106 83 Q 112 80 122 84'
                    : 'M 106 82 Q 112 78 122 81'
                }
                stroke="#1e293b"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300 ease-in-out"
              />
            </g>

            {/* Eyes & Eyelids with CSS Transitions */}
            <g className="transition-all duration-200">
              {blink ? (
                // Closed eyes during blink
                <g className="transition-opacity duration-150">
                  <path d="M 80 92 Q 87 96 94 92" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 106 92 Q 113 96 120 92" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </g>
              ) : (
                // Open expressive eyes
                <g className="transition-opacity duration-150">
                  <ellipse cx="87" cy="92" rx="6" ry="6" fill="#ffffff" />
                  <circle cx="87" cy="92" r="3.5" fill="#1e293b" className="transition-transform duration-300" />
                  <circle cx="85.5" cy="90.5" r="1.2" fill="#ffffff" />

                  <ellipse cx="113" cy="92" rx="6" ry="6" fill="#ffffff" />
                  <circle cx="113" cy="92" r="3.5" fill="#1e293b" className="transition-transform duration-300" />
                  <circle cx="111.5" cy="90.5" r="1.2" fill="#ffffff" />
                </g>
              )}
            </g>

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

            {/* Animated Mouth Visemes with CSS Transitions */}
            <g className="transition-all duration-150 ease-out">
              {mouthOpen === 0 ? (
                <path
                  d="M 91 119 Q 100 126 109 119"
                  stroke="#881337"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-150"
                />
              ) : mouthOpen === 1 ? (
                <path
                  d="M 91 118 Q 100 116 109 118 Q 100 128 91 118 Z"
                  fill="#881337"
                  stroke="#4c0519"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />
              ) : mouthOpen === 2 ? (
                <g className="transition-all duration-150">
                  <ellipse cx="100" cy="121" rx="9" ry="7" fill="#4c0519" />
                  <rect x="94" y="117" width="12" height="3" rx="1" fill="#ffffff" />
                  <path d="M 95 125 Q 100 123 105 125" fill="#f43f5e" />
                </g>
              ) : (
                <circle cx="100" cy="121" r="5.5" fill="#4c0519" stroke="#881337" strokeWidth="1.5" className="transition-all duration-150" />
              )}
            </g>
          </svg>
        )}

        {/* Real-time Audio Chunk Synchronization Layer Overlay */}
        {isSpeaking && (
          <div className="absolute bottom-2 inset-x-2 z-10 flex flex-col items-center gap-1 py-1 px-2 rounded-xl bg-[#1C1C1C]/90 backdrop-blur-md border border-[#1C1C1C] shadow-lg transition-all duration-300">
            {/* Active Audio Chunk Highlight Bar */}
            {activeChunkIndex >= 0 && audioChunks[activeChunkIndex] && (
              <div className="flex items-center gap-1 text-[10px] text-amber-300 font-mono font-bold tracking-tight px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 animate-pulse">
                <Mic className="w-2.5 h-2.5 text-amber-400" />
                <span>"{audioChunks[activeChunkIndex].word}"</span>
              </div>
            )}
            
            {/* Animated Audio Frequency Equalizer */}
            <div className="flex items-center justify-center gap-1">
              <span className="w-1 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.1s]" />
              <span className="w-1 h-5 bg-[#FAF8F5] rounded-full animate-bounce [animation-delay:0.25s]" />
              <span className="w-1 h-4 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1 h-6 bg-[#FAF8F5] rounded-full animate-bounce [animation-delay:0.35s]" />
              <span className="w-1 h-3 bg-[#D97706] rounded-full animate-bounce [animation-delay:0.2s]" />
            </div>
          </div>
        )}
      </div>

      {/* Teacher Name & Pedagogical Mood Status */}
      {size !== 'xs' && (
        <div className="mt-2 text-center">
          <h4 className="text-xs font-serif font-bold text-[#1C1C1C]">{config.title}</h4>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium transition-all duration-300 ${currentBadge.color}`}>
              <BadgeIcon className="w-3 h-3" />
              {currentBadge.text}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
