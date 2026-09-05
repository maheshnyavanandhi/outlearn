import React, { useState } from 'react';
import { MisconceptionFeedbackOverlay } from './MisconceptionFeedbackOverlay';
import {
  LessonPlan,
  LearnerProfile,
  LanguageCode,
  TeacherPersonality
} from '../types';
import { SUPPORTED_LANGUAGES, TEACHER_PERSONALITIES } from '../data/curriculumData';
import { TeacherAvatar } from './TeacherAvatar';
import { PhysicsCircuitVisual } from './visuals/PhysicsCircuitVisual';
import { DbmsRelationalVisual } from './visuals/DbmsRelationalVisual';
import { BiologyCellVisual } from './visuals/BiologyCellVisual';
import { CodeExecutionVisual } from './visuals/CodeExecutionVisual';
import { MathStepsVisual } from './visuals/MathStepsVisual';
import { D3InteractiveDiagram } from './visuals/D3InteractiveDiagram';
import { useLessonOrchestrator, LifecyclePhase } from '../hooks/useLessonOrchestrator';
import { VoiceMicButton } from './VoiceMicButton';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  MessageCircleQuestion,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ListOrdered,
  X,
  Send,
  GraduationCap,
  Brain,
  Layers,
  HelpCircle,
  Lightbulb,
  Check,
  Bot,
  MessageSquare,
  Globe,
  ExternalLink,
  Search
} from 'lucide-react';

interface TeachingRoomProps {
  lessonPlan?: LessonPlan;
  topic?: string;
  learnerProfile: LearnerProfile;
  onUpdateProfile: (profile: LearnerProfile) => void;
  onFinishLesson: (lessonPlan: LessonPlan, profile: LearnerProfile) => void;
}

export const TeachingRoom: React.FC<TeachingRoomProps> = ({
  lessonPlan,
  topic,
  learnerProfile,
  onUpdateProfile,
  onFinishLesson
}) => {
  const orchestrator = useLessonOrchestrator({
    topic,
    lessonPlan,
    learnerProfile,
    onUpdateProfile,
    onFinishLesson
  });

  const {
    activeLessonPlan,
    lifecyclePhase,
    isOrchestratingLifecycle,
    currentStepIdx,
    currentBeatIdx,
    currentStep,
    currentBeat,
    activeSpeechText,
    understandSummary,
    planSummary,
    conversationHistory,
    isPlaying,
    isSpeaking,
    speechRate,
    isMuted,
    activeLanguage,
    teacherPersonality,
    isAwaitingResponse,
    selectedOption,
    freeTextAnswer,
    isSubmittingAnswer,
    activeMisconception,
    showAnalogyAlternative,
    isAskModalOpen,
    studentQuery,
    teacherAnswer,
    teacherAnswerMeta,
    isQueryLoading,
    enableSearchGrounding,
    setEnableSearchGrounding,
    decisionLogs,
    isLessonCompleted,
    handleTogglePlay,
    handleReplayBeat,
    setSpeechRate,
    setIsMuted,
    setActiveLanguage,
    setTeacherPersonality,
    advanceToNextBeat,
    setSelectedOption,
    setFreeTextAnswer,
    handleCheckAnswer,
    handleContinueFromMisconception,
    setIsAskModalOpen,
    setStudentQuery,
    handleAskTeacher,
    handleJumpToStep
  } = orchestrator;

  const effectivePlan = activeLessonPlan || lessonPlan || {
    id: 'dynamic-plan',
    topic: topic || 'Dynamic AI Lesson',
    subject: 'General Knowledge',
    educationalLevel: learnerProfile.educationalLevel || 'beginner',
    timeBudget: learnerProfile.timeBudget || '20min',
    totalMinutes: 20,
    language: learnerProfile.preferredLanguage || 'en',
    teacherPersonality: learnerProfile.teacherPersonality || 'mentor',
    prerequisitesOverview: [],
    steps: []
  };
  const steps = effectivePlan.steps || [];

  const [showCaptions, setShowCaptions] = useState(true);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'logs' | 'transcript'>('logs');
  const [isDeterminationsModalOpen, setIsDeterminationsModalOpen] = useState(false);
  const [visualMode, setVisualMode] = useState<'d3' | 'standard'>('d3');
  const [isChatOpen, setIsChatOpen] = useState(true);

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory, isQueryLoading, isChatOpen]);

  const handleAskTeacherWithWidget = (query?: string) => {
    setIsChatOpen(true);
    handleAskTeacher(query);
  };

  // Lifecycle stage progression definition
  const lifecycleStages: { phase: LifecyclePhase; label: string; icon: any }[] = [
    { phase: 'UNDERSTAND', label: 'Understand', icon: Brain },
    { phase: 'PLAN', label: 'Plan', icon: Layers },
    { phase: 'EXPLAIN', label: 'Explain', icon: Sparkles },
    { phase: 'QUESTION', label: 'Question', icon: HelpCircle },
    { phase: 'ADAPT', label: 'Adapt', icon: Lightbulb }
  ];

  return (
    <div className="w-full max-w-full min-h-[90vh] flex flex-col bg-[#F9F8F6] text-[#1C1C1C] overflow-x-hidden min-w-0" id="teaching-room-root">
      {/* Top Persistent Lesson Context & Lifecycle Indicator Strip */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-[#FFFFFF] border-b border-[#1C1C1C]/15 flex flex-wrap items-center justify-between gap-2 sm:gap-3 sticky top-0 z-30 shadow-sm w-full max-w-full overflow-x-hidden min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1C1C1C] animate-pulse" />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-xs sm:text-base font-serif font-bold text-[#1C1C1C]">{effectivePlan.topic}</h2>
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15 font-semibold">
                Step {currentStepIdx + 1}/{steps.length || 1}
              </span>
              {/* Compact Mobile Phase Badge */}
              <span className="md:hidden text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-[#F9F8F6] uppercase">
                {lifecyclePhase}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono border border-emerald-300/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>AI Orchestrator {isOrchestratingLifecycle ? 'Evaluating...' : 'Active'}</span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#666666] truncate max-w-[200px] sm:max-w-md">
              Teaching: <strong className="text-[#1C1C1C] font-serif">{currentStep?.concept?.name || effectivePlan.topic}</strong>
            </p>
          </div>
        </div>

        {/* AI Interaction Lifecycle Process Bar (Understand -> Plan -> Explain -> Question -> Adapt) */}
        <div className="hidden md:flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-xl border border-[#1C1C1C]/15">
          {lifecycleStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = lifecyclePhase === stage.phase;
            const isPassed =
              (stage.phase === 'UNDERSTAND' && lifecyclePhase !== 'UNDERSTAND') ||
              (stage.phase === 'PLAN' && !['UNDERSTAND', 'PLAN'].includes(lifecyclePhase)) ||
              (stage.phase === 'EXPLAIN' && ['QUESTION', 'ADAPT', 'COMPLETED'].includes(lifecyclePhase));

            return (
              <React.Fragment key={stage.phase}>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium font-mono transition-all ${
                    isActive
                      ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm font-bold'
                      : isPassed
                      ? 'text-[#1C1C1C] bg-[#E6E3DB]'
                      : 'text-[#888888]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stage.label}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                </div>
                {idx < lifecycleStages.length - 1 && (
                  <span className="text-[#888888] text-[10px] font-mono">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls & Finish Assessment Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Tutor Chat Toggle Button */}
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isChatOpen
                ? 'bg-[#1C1C1C] text-[#F9F8F6] border-[#1C1C1C]'
                : 'bg-amber-100/90 hover:bg-amber-200/90 border-amber-300 text-amber-950 shadow-2xs'
            }`}
            title="Toggle AI Tutor Chat Widget"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline font-mono text-[11px]">AI Tutor Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          </button>

          {/* Language Switcher dropdown */}
          <div className="relative">
            <select
              value={activeLanguage || 'en'}
              onChange={(e) => setActiveLanguage(e.target.value as LanguageCode)}
              className="bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Finish & Take Final Quiz Button */}
          <button
            onClick={() => onFinishLesson(effectivePlan, learnerProfile)}
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-sm flex items-center gap-1 sm:gap-1.5 transition-all shrink-0"
          >
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Complete & Assess</span>
            <span className="xs:hidden">Assess</span>
          </button>
        </div>
      </div>

      {/* Main Split-Stage Arena: CSS Container Query Responsive Switch */}
      <div className="teaching-room-container flex-1 max-w-7xl mx-auto w-full overflow-x-hidden min-w-0">
        <div className="teaching-room-grid w-full max-w-full overflow-x-hidden min-w-0">
          {/* LEFT COLUMN (Top on mobile < 768px container): AI Avatar Studio & D3 Interactive Visual Canvas */}
          <div className={`teaching-room-left flex flex-col gap-4 w-full max-w-full overflow-x-hidden min-w-0 ${isChatOpen ? 'has-chat-open' : 'no-chat-open'}`}>
          {/* AI Teacher Studio Header Banner */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 relative w-full max-w-full overflow-x-hidden min-w-0">
            {/* Left: Compact Avatar & Phase Indicator */}
            <div className="flex items-center gap-3 shrink-0">
              <TeacherAvatar
                personality={teacherPersonality}
                isSpeaking={isSpeaking}
                speakingText={activeSpeechText || currentBeat?.speechEn}
                teacherMood={
                  lifecyclePhase === 'QUESTION'
                    ? 'listening'
                    : lifecyclePhase === 'ADAPT'
                    ? 'questioning'
                    : isSpeaking
                    ? 'explaining'
                    : 'thinking'
                }
                size="sm"
              />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15 uppercase tracking-wider font-bold inline-flex items-center gap-1 w-fit">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>
                    {lifecyclePhase === 'UNDERSTAND'
                      ? 'Understanding Profile'
                      : lifecyclePhase === 'PLAN'
                      ? 'Structuring Lesson'
                      : lifecyclePhase === 'EXPLAIN'
                      ? 'Teaching Concept'
                      : lifecyclePhase === 'QUESTION'
                      ? 'Interactive Checkpoint'
                      : 'Growth & Adaptation'}
                  </span>
                </span>
                <div className="flex items-center gap-1.5">
                  <label className="text-[10px] font-mono text-[#666666] shrink-0">
                    Persona:
                  </label>
                  <select
                    value={teacherPersonality || 'mentor'}
                    onChange={(e) => setTeacherPersonality(e.target.value as TeacherPersonality)}
                    className="bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-[11px] rounded-lg px-2 py-0.5 focus:outline-none font-serif max-w-[160px] truncate cursor-pointer"
                  >
                    {TEACHER_PERSONALITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* D3 Interactive Diagram & Concept Blueprint Visual Canvas */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-3 sm:p-4 shadow-sm flex flex-col gap-3 w-full max-w-full overflow-x-hidden min-w-0">
            {/* Visual Header & Concept Summary */}
            <div className="flex items-start justify-between gap-2 border-b border-[#1C1C1C]/10 pb-2.5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#777777]">
                    Interactive Diagram
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-mono font-bold uppercase">
                    {currentStep?.concept?.subject || effectivePlan.subject}
                  </span>
                </div>
                <h3 className="text-sm font-serif font-bold text-[#1C1C1C]">
                  {currentStep?.concept?.name || effectivePlan.topic}
                </h3>
              </div>
              {currentStep?.concept?.keyFormulas && currentStep.concept.keyFormulas.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {currentStep.concept.keyFormulas.map((f, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] font-mono text-[10px]">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic AI Orchestrator Lifecycle Banner overlay during UNDERSTAND or PLAN phases */}
            {(lifecyclePhase === 'UNDERSTAND' || lifecyclePhase === 'PLAN' || isOrchestratingLifecycle) && (
              <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#1C1C1C]/20 shadow-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-[#1C1C1C] uppercase tracking-wider">
                    Pedagogical Calibration ({lifecyclePhase} Phase)
                  </span>
                </div>
                <p className="text-[11px] text-[#333333] font-serif leading-tight">
                  {lifecyclePhase === 'UNDERSTAND' ? understandSummary || 'Calibrating learner profile and prior knowledge...' : planSummary || 'Structuring 8 pedagogical determinations and concept beats...'}
                </p>
              </div>
            )}

            {/* Interactive D3 Diagram Stage */}
            <div className="w-full max-w-full aspect-[4/3] sm:aspect-[16/10] max-h-[50vh] sm:max-h-none overflow-hidden min-w-0 flex flex-col">
              <D3InteractiveDiagram
                topic={effectivePlan.topic}
                subject={currentStep?.concept?.subject || effectivePlan.subject}
                conceptName={currentStep?.concept?.name}
                highlightTarget={currentBeat?.visualCue?.highlightTarget}
                annotation={currentBeat?.visualCue?.annotation || currentBeat?.caption}
              />
            </div>

            {/* Consolidated Video Player Timeline & Controls Bar */}
            <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#1C1C1C]/15 flex flex-col gap-2 w-full max-w-full overflow-x-hidden min-w-0">
              {/* Single Consolidated Subtitle / Timed Caption Track */}
              {showCaptions && (
                <div className="w-full p-2.5 rounded-xl bg-[#FFFFFF] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] min-h-[42px] flex items-center gap-2 font-serif italic shadow-2xs">
                  <span className="text-amber-800 bg-amber-100/80 border border-amber-300/60 px-2 py-0.5 rounded font-mono text-[10px] not-italic shrink-0 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Captions</span>
                  </span>
                  <span className="line-clamp-2 text-[11px] sm:text-xs text-[#1C1C1C] font-serif leading-snug break-words">
                    {activeSpeechText || currentBeat?.speechEn || 'Listening and preparing lesson concepts...'}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                {/* Play/Pause & Replay Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleTogglePlay}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs shadow-2xs ${
                      isPlaying
                        ? 'bg-[#333333] hover:bg-[#222222] text-[#F9F8F6]'
                        : 'bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6]'
                    }`}
                    title={isPlaying ? 'Pause Lesson' : 'Play Lesson'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Teach'}</span>
                  </button>

                  <button
                    onClick={handleReplayBeat}
                    className="px-2.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs flex items-center gap-1 transition-all"
                    title="Replay Current Concept Explanation"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="font-sans text-[11px]">Replay</span>
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs transition-all"
                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#DC2626]" /> : <Volume2 className="w-3.5 h-3.5 text-[#1C1C1C]" />}
                  </button>
                </div>

                {/* Stepper Dots Indicator */}
                <div className="flex items-center gap-1">
                  {currentStep?.beats?.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => advanceToNextBeat()}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentBeatIdx
                          ? 'w-5 bg-[#1C1C1C]'
                          : idx < currentBeatIdx
                          ? 'w-2 bg-[#666666]'
                          : 'w-2 bg-[#E2DED6] hover:bg-[#CFCABF]'
                      }`}
                      title={`Beat ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Consolidated Speed & Caption Toggles */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setShowCaptions((c) => !c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all border ${
                      showCaptions ? 'bg-[#1C1C1C] text-[#F9F8F6] border-[#1C1C1C]' : 'bg-[#FFFFFF] border-[#1C1C1C]/15 text-[#666666] hover:text-[#1C1C1C]'
                    }`}
                    title="Toggle Captions"
                  >
                    CC
                  </button>

                  <select
                    value={speechRate ?? 1.0}
                    onChange={(e) => setSpeechRate(Number(e.target.value))}
                    className="bg-[#FFFFFF] border border-[#1C1C1C]/20 text-[#1C1C1C] text-[11px] rounded px-1.5 py-0.5 focus:outline-none font-sans cursor-pointer"
                    title="Speech / Playback Speed"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Interactive Checkpoint on Main Stage */}
          {(lifecyclePhase === 'QUESTION' || (isAwaitingResponse && currentBeat?.checkpoint)) && !activeMisconception && currentBeat?.checkpoint && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#1C1C1C]/20 shadow-sm animate-in fade-in zoom-in-95 mt-2">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#1C1C1C]/15 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-serif font-bold text-[#1C1C1C]">
                      Interactive Checkpoint
                    </h3>
                    <p className="text-[10px] text-[#777777] font-mono">Concept: {currentStep?.concept?.name || effectivePlan.topic}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300/60 font-bold uppercase">
                  Diagnostic Question
                </span>
              </div>

              <div className="text-xs sm:text-sm font-serif font-bold text-[#1C1C1C] mb-3 leading-snug">
                {activeLanguage === 'hi' && currentBeat.checkpoint.questionHindi
                  ? currentBeat.checkpoint.questionHindi
                  : activeLanguage === 'hinglish' && currentBeat.checkpoint.questionHinglish
                  ? currentBeat.checkpoint.questionHinglish
                  : currentBeat.checkpoint.question}
              </div>

              {/* Options */}
              {currentBeat.checkpoint.options && currentBeat.checkpoint.options.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {currentBeat.checkpoint.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(opt)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                        selectedOption === opt
                          ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                          : 'bg-[#FAF8F5] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOption === opt && <CheckCircle2 className="w-4 h-4 text-[#F9F8F6] shrink-0" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={freeTextAnswer || ''}
                    onChange={(e) => setFreeTextAnswer(e.target.value)}
                    placeholder="Type or dictate your explanation..."
                    className="w-full h-20 bg-[#FAF8F5] border border-[#1C1C1C]/20 rounded-xl p-2.5 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]/10">
                <VoiceMicButton
                  language={activeLanguage}
                  size="sm"
                  label="Voice Answer"
                  onTranscriptChange={(text) => setFreeTextAnswer(text)}
                />
                <button
                  onClick={() => handleCheckAnswer()}
                  disabled={(!selectedOption && !freeTextAnswer.trim()) || isSubmittingAnswer}
                  className="px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] text-xs font-bold shadow flex items-center gap-1.5 transition-all"
                >
                  {isSubmittingAnswer ? 'Evaluating...' : 'Submit Response'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Visual Animated Feedback Overlay for Misconceptions */}
          {activeMisconception && (
            <MisconceptionFeedbackOverlay
              misconception={activeMisconception}
              onContinue={handleContinueFromMisconception}
              onAskForClarification={(prefilled) => {
                setStudentQuery(prefilled);
                handleAskTeacherWithWidget(prefilled);
              }}
              teacherTitle={TEACHER_PERSONALITIES.find(p => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma'}
            />
          )}
        </div>

        {/* RIGHT COLUMN (Desktop >768px): Floating AI Tutor Chat Drawer inside Grid */}
        {isChatOpen && (
          <div className="teaching-room-right flex flex-col gap-4 w-full max-w-full overflow-x-hidden min-w-0">
            <div className="bg-[#FFFFFF] border border-[#1C1C1C]/15 rounded-2xl shadow-sm flex flex-col overflow-hidden w-full h-[620px] max-h-[calc(100vh-8rem)] sticky top-4">
              {/* Drawer Header */}
              <div className="bg-[#1C1C1C] text-[#F9F8F6] px-3.5 py-2.5 flex items-center justify-between border-b border-amber-400/30 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1C1C1C]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xs sm:text-sm leading-tight text-[#F9F8F6]">
                      {TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>AI Tutor Active • Step {currentStepIdx + 1}/{steps.length || 1}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#FFFFFF]/10 text-[#F9F8F6] transition-colors"
                  title="Close AI Tutor Chat"
                >
                  <X className="w-4 h-4 text-amber-300" />
                </button>
              </div>

              {/* Scrollable Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 bg-[#F9F8F6]">
                {conversationHistory.length === 0 ? (
                  <div className="p-6 text-center text-[#888888] font-serif italic text-xs">
                    Hi! I'm {TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma'}. Ask me any question or request an analogy for {effectivePlan.topic}!
                  </div>
                ) : (
                  conversationHistory
                    .filter((msg) => msg.role !== 'system' && !msg.content?.startsWith('[Gemini AI Analysis]') && !msg.content?.startsWith('Analyzed Learner Profile'))
                    .map((msg) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${
                            isUser
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-[#1C1C1C] text-[#F9F8F6] border-[#1C1C1C]'
                          }`}>
                            {isUser ? 'S' : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                          </div>

                          <div className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                            isUser
                              ? 'bg-[#1C1C1C] text-[#F9F8F6] rounded-tr-xs shadow-2xs'
                              : 'bg-[#FFFFFF] text-[#1C1C1C] border border-[#1C1C1C]/15 rounded-tl-xs shadow-2xs'
                          }`}>
                            <div className={`flex items-center justify-between gap-2 mb-1 font-mono text-[10px] ${isUser ? 'text-amber-200' : 'text-[#777777]'}`}>
                              <span className="font-bold">
                                {isUser ? (learnerProfile?.name || 'Learner') : (TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma')}
                              </span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="font-serif leading-relaxed whitespace-pre-wrap text-[12px]">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })
                )}

                {/* Typing indicator when Gemini is reasoning */}
                {isQueryLoading && (
                  <div className="flex gap-2 flex-row my-2 animate-pulse">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#1C1C1C] text-[#F9F8F6] shrink-0 text-xs font-bold border border-[#1C1C1C]">
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    </div>
                    <div className="bg-[#FFFFFF] text-[#1C1C1C] border border-[#1C1C1C]/15 rounded-xl rounded-tl-xs p-2.5 text-xs flex items-center gap-2">
                      <span className="font-serif italic text-[#777777]">Thinking & formulating response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Suggestions Chips & Input Bar */}
              <div className="p-3 bg-[#FFFFFF] border-t border-[#1C1C1C]/15 flex flex-col gap-2 shrink-0">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
                  <button
                    onClick={() => handleAskTeacherWithWidget("Can you explain this with a real-life analogy?")}
                    className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                  >
                    💡 Give Analogy
                  </button>
                  <button
                    onClick={() => handleAskTeacherWithWidget("Can you give me a step-by-step example problem?")}
                    className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                  >
                    📝 Example Problem
                  </button>
                  <button
                    onClick={() => handleAskTeacherWithWidget("Explain this in simpler terms.")}
                    className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                  >
                    🔍 Simplify
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studentQuery || ''}
                    onChange={(e) => setStudentQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskTeacherWithWidget()}
                    placeholder="Ask Dr. Sharma a question..."
                    className="flex-1 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] font-sans"
                  />
                  <VoiceMicButton
                    language={activeLanguage}
                    size="sm"
                    label=""
                    onTranscriptChange={(text) => setStudentQuery(text)}
                  />
                  <button
                    onClick={() => handleAskTeacherWithWidget()}
                    disabled={isQueryLoading || !studentQuery.trim()}
                    className="px-3 py-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] rounded-xl text-xs font-bold flex items-center justify-center shadow-2xs transition-all"
                  >
                    {isQueryLoading ? '...' : <Send className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Checkpoint Interactive Dialog (When QUESTION phase or pauseForInteraction is active, and no active misconception) */}
      {(lifecyclePhase === 'QUESTION' || (isAwaitingResponse && currentBeat?.checkpoint)) && !activeMisconception && currentBeat?.checkpoint && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1C]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1C1C1C]/20 max-w-xl w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/15 mb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1C1C1C]">
                    Checkpoint: Diagnostic Question
                  </h3>
                  <p className="text-[11px] text-[#666666] font-sans">Concept: {currentStep?.concept?.name}</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                Phase: {lifecyclePhase}
              </span>
            </div>

            {/* Question Text in Current Language */}
            <div className="py-2 text-base font-serif font-bold text-[#1C1C1C] mb-4">
              {activeLanguage === 'hi' && currentBeat.checkpoint.questionHindi
                ? currentBeat.checkpoint.questionHindi
                : activeLanguage === 'hinglish' && currentBeat.checkpoint.questionHinglish
                ? currentBeat.checkpoint.questionHinglish
                : currentBeat.checkpoint.question}
            </div>

            {/* Multiple Choice Options */}
            {currentBeat.checkpoint.options && currentBeat.checkpoint.options.length > 0 ? (
              <div className="space-y-2 mb-4">
                {currentBeat.checkpoint.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between ${
                      selectedOption === opt
                        ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                        : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedOption === opt && <CheckCircle2 className="w-4 h-4 text-[#F9F8F6] shrink-0" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#666666]">Speak or type your explanation:</span>
                  <VoiceMicButton
                    language={activeLanguage}
                    size="sm"
                    label="Dictate Answer"
                    onTranscriptChange={(text) => setFreeTextAnswer(text)}
                  />
                </div>
                <textarea
                  value={freeTextAnswer || ''}
                  onChange={(e) => setFreeTextAnswer(e.target.value)}
                  placeholder="Type or speak your answer using the microphone..."
                  className="w-full h-24 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl p-3 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]/15">
              <VoiceMicButton
                language={activeLanguage}
                size="sm"
                label="Voice Response"
                onTranscriptChange={(text) => {
                  setFreeTextAnswer(text);
                }}
              />
              <button
                onClick={() => handleCheckAnswer()}
                disabled={(!selectedOption && !freeTextAnswer.trim()) || isSubmittingAnswer}
                className="px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] text-xs font-bold shadow flex items-center gap-1.5 transition-all font-sans"
              >
                {isSubmittingAnswer ? 'Diagnosing with AI...' : 'Submit Response'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Growth & Correction Overlay (When AI identifies a Misconception during ADAPT phase) */}
      {(lifecyclePhase === 'ADAPT' || activeMisconception) && activeMisconception && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1C]/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1C1C1C]/20 max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 flex flex-col gap-5 relative overflow-hidden">
            {/* Top decorative gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500" />

            {/* Header: Encouraging Growth Mindset Banner */}
            <div className="flex items-start justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 shadow-xs flex items-center justify-center shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-900 px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-300/60">
                      Growth Insight • Micro-Correction
                    </span>
                    <span className="text-[10px] font-mono text-[#777777]">
                      Phase: ADAPT
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1C1C1C]">
                    Let's Refine This Concept Together
                  </h3>
                </div>
              </div>
            </div>

            {/* Subtitle Message */}
            <p className="text-xs sm:text-sm text-[#444444] font-serif leading-relaxed bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#1C1C1C]/10">
              <Sparkles className="w-4 h-4 text-amber-600 inline mr-1.5 align-text-bottom" />
              Mistakes are the most powerful part of learning! Your response revealed a common intuitive trap. Here is an easy way to think about it:
            </p>

            {/* Dual Cards: Identified Intuition vs Constructive Teacher Explanation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: Identified Intuition Gap */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-900 tracking-wider">
                      Identified Assumption
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-200/60 text-amber-950">
                      {activeMisconception.category || 'Intuition Trap'}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-[#1C1C1C] text-sm mb-1.5">
                    {activeMisconception.name}
                  </h4>
                  <p className="text-xs text-[#555555] leading-relaxed font-sans">
                    {activeMisconception.diagnosis}
                  </p>
                </div>
              </div>

              {/* Card 2: Teacher Analogy & Clarification */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#1C1C1C]/15 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Pedagogical Analogy</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#1C1C1C] font-serif leading-relaxed italic">
                    "{activeMisconception.speech}"
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1C1C1C]/10 flex items-center justify-between">
                  <button
                    onClick={() => handleReplayBeat()}
                    className="text-[11px] font-mono text-[#1C1C1C] hover:text-[#555555] flex items-center gap-1 font-semibold underline decoration-dotted"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Replay Explanation</span>
                  </button>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Mastery Calibration Active
                  </span>
                </div>
              </div>
            </div>

            {/* Growth Action Footer Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]/15 mt-1">
              <div className="text-[11px] text-[#666666] font-sans hidden sm:block">
                Pressing continue updates your concept mastery profile.
              </div>
              <button
                onClick={handleContinueFromMisconception}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-lg flex items-center justify-center gap-2 transition-all group"
              >
                <span>Understood! Apply This & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interruption Q&A Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1C]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1C1C1C]/20 max-w-lg w-full rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]/15 mb-3">
              <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-1.5">
                <MessageCircleQuestion className="w-4 h-4 text-[#1C1C1C]" />
                <span>Ask OutLearn a Question</span>
              </h3>
              <button
                onClick={() => {
                  setIsAskModalOpen(false);
                }}
                className="text-[#666666] hover:text-[#1C1C1C] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666666] mb-3 font-sans">
              Ask anything about <strong className="text-[#1C1C1C] font-serif">{currentStep?.concept?.name || effectivePlan.topic}</strong>. OutLearn answers and seamlessly resumes your lesson.
            </p>

            {/* Search Grounding Toggle Bar */}
            <div className="flex items-center justify-between mb-2.5 px-1 py-1 rounded-lg bg-[#F2EFEB] border border-[#1C1C1C]/10 text-[11px]">
              <div className="flex items-center gap-1.5 font-medium text-[#444444]">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Google Search Grounding:</span>
              </div>
              <button
                type="button"
                onClick={() => setEnableSearchGrounding(!enableSearchGrounding)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all flex items-center gap-1 border ${
                  enableSearchGrounding
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                    : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-300'
                }`}
              >
                <Search className="w-2.5 h-2.5" />
                <span>{enableSearchGrounding ? 'Active' : 'Disabled'}</span>
              </button>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={studentQuery || ''}
                onChange={(e) => setStudentQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskTeacher()}
                placeholder="Type or speak your question..."
                className="flex-1 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
              />
              <VoiceMicButton
                language={activeLanguage}
                size="md"
                label=""
                onTranscriptChange={(text) => setStudentQuery(text)}
              />
              <button
                onClick={() => handleAskTeacher()}
                disabled={isQueryLoading || !studentQuery.trim()}
                className="px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] rounded-xl text-xs font-bold flex items-center gap-1"
              >
                {isQueryLoading ? 'Thinking...' : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Answer Display with Search Grounding Citations */}
            {teacherAnswer && (
              <div className="p-3.5 rounded-xl bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] mb-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-[#1C1C1C]/10">
                  <div className="font-bold font-serif text-[#1C1C1C] text-[11px]">OutLearn's Explanation:</div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {teacherAnswerMeta?.isSearchGrounded && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-blue-900 bg-blue-100/90 px-2 py-0.5 rounded border border-blue-300/80 font-bold shadow-2xs">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>Grounded in Google Search</span>
                      </span>
                    )}
                    {teacherAnswerMeta?.isLiveAi && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Live Response</span>
                      </span>
                    )}
                  </div>
                </div>
                <p className="leading-relaxed font-serif italic text-xs whitespace-pre-wrap">{teacherAnswer}</p>

                {/* Search Queries Executed */}
                {teacherAnswerMeta?.webSearchQueries && teacherAnswerMeta.webSearchQueries.length > 0 && (
                  <div className="pt-2 border-t border-[#1C1C1C]/10 text-[10px] font-mono text-[#555555]">
                    <div className="font-bold flex items-center gap-1 text-[#333333] mb-1">
                      <Search className="w-3 h-3 text-blue-600" />
                      <span>Web Search Queries Executed:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {teacherAnswerMeta.webSearchQueries.map((q, idx) => (
                        <span key={idx} className="bg-white/90 px-1.5 py-0.5 rounded border border-black/10 text-blue-950">
                          "{q}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verifiable Source Links */}
                {teacherAnswerMeta?.groundingSources && teacherAnswerMeta.groundingSources.length > 0 && (
                  <div className="pt-2 border-t border-[#1C1C1C]/10 text-[10px] font-mono">
                    <div className="font-bold flex items-center gap-1 text-blue-900 mb-1">
                      <Globe className="w-3 h-3 text-blue-600" />
                      <span>Verifiable Sources & References ({teacherAnswerMeta.groundingSources.length}):</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {teacherAnswerMeta.groundingSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-1.5 rounded bg-white hover:bg-blue-50 border border-blue-200/80 text-blue-800 transition-colors group"
                        >
                          <span className="truncate max-w-[320px] font-sans text-[11px] text-blue-950 font-medium">
                            {src.title || src.uri}
                          </span>
                          <ExternalLink className="w-3 h-3 text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#1C1C1C]/15">
              <button
                onClick={() => {
                  setIsAskModalOpen(false);
                  handleTogglePlay();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-medium"
              >
                Resume Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Brain / State Machine Decision Log Drawer (For Evaluators!) */}
      {isLogDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#FFFFFF] border-l border-[#1C1C1C]/20 shadow-2xl p-4 flex flex-col animate-in slide-in-from-right">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/15">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#F2EFEB] text-[#1C1C1C]">
                <ListOrdered className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-serif font-bold text-[#1C1C1C]">Teacher AI Trace</h3>
            </div>
            <button onClick={() => setIsLogDrawerOpen(false)} className="text-[#666666] hover:text-[#1C1C1C]">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Tab Switcher */}
          <div className="flex bg-[#F2EFEB] p-1 rounded-xl my-2 border border-[#1C1C1C]/10 text-xs font-mono font-medium">
            <button
              onClick={() => setDrawerTab('logs')}
              className={`flex-1 py-1 rounded-lg text-center transition-all ${
                drawerTab === 'logs' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-sm' : 'text-[#666666] hover:text-[#1C1C1C]'
              }`}
            >
              Decision Logs ({decisionLogs.length})
            </button>
            <button
              onClick={() => setDrawerTab('transcript')}
              className={`flex-1 py-1 rounded-lg text-center transition-all ${
                drawerTab === 'transcript' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-sm' : 'text-[#666666] hover:text-[#1C1C1C]'
              }`}
            >
              AI Transcript ({conversationHistory.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {drawerTab === 'logs' ? (
              decisionLogs.length === 0 ? (
                <div className="text-xs text-[#888888] italic p-4 text-center">No actions logged yet...</div>
              ) : (
                decisionLogs.map((entry) => (
                  <div key={entry.id} className="p-2.5 rounded-xl bg-[#F9F8F6] border border-[#1C1C1C]/15 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono text-[10px] font-bold border border-[#1C1C1C]/15">
                        {entry.action}
                      </span>
                      <span className="text-[10px] text-[#888888] font-mono">{entry.timestamp}</span>
                    </div>
                    <div className="font-semibold text-[#1C1C1C] text-[11px] mb-0.5 font-serif">{entry.conceptName}</div>
                    <div className="text-[#555555] text-[10px] leading-relaxed">{entry.reason}</div>
                    {entry.strategySwitched && (
                      <div className="mt-1 text-[10px] text-[#B45309] font-mono">
                        ↳ Strategy Switched: {entry.strategySwitched}
                      </div>
                    )}
                  </div>
                ))
              )
            ) : (
              conversationHistory.length === 0 ? (
                <div className="text-xs text-[#888888] italic p-4 text-center">No conversation history recorded yet...</div>
              ) : (
                conversationHistory.map((item) => (
                  <div key={item.id} className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                    item.role === 'user' ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#1C1C1C]'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px]">
                      <span className="font-bold uppercase flex items-center gap-1">
                        {item.role === 'user' ? 'Student' : item.role === 'assistant' ? 'OutLearn AI' : 'System'}
                        {item.isSearchGrounded && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold flex items-center gap-0.5">
                            <Globe className="w-2.5 h-2.5 text-blue-600" />
                            Grounded
                          </span>
                        )}
                      </span>
                      <span className="text-[#888888]">{item.phase || 'EXPLAIN'} • {item.timestamp}</span>
                    </div>
                    <p className="font-serif leading-relaxed text-[11px] whitespace-pre-wrap">{item.content}</p>

                    {item.groundingSources && item.groundingSources.length > 0 && (
                      <div className="pt-1.5 border-t border-[#1C1C1C]/10 text-[9px] font-mono space-y-0.5">
                        <div className="font-bold text-blue-900 flex items-center gap-1">
                          <Globe className="w-2.5 h-2.5 text-blue-600" />
                          <span>Sources ({item.groundingSources.length}):</span>
                        </div>
                        {item.groundingSources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block truncate text-blue-700 hover:underline hover:text-blue-900"
                          >
                            • {src.title || src.uri}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* 8 Pedagogical Determinations Blueprint Modal */}
      {isDeterminationsModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1C]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1C1C1C]/20 max-w-2xl w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/15 mb-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#1C1C1C] text-[#F9F8F6]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#1C1C1C]">
                    8 Pedagogical Determinations Blueprint
                  </h3>
                  <p className="text-[11px] text-[#666666] font-sans">
                    OutLearn's pedagogical reasoning for {effectivePlan.topic}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeterminationsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#F2EFEB] text-[#666666] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 text-xs">
              {effectivePlan.determinations ? (
                <>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      1. What Needs to be Taught
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.whatNeedsToBeTaught}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-1">
                      2. Which Concepts Should be Covered First
                    </span>
                    {Array.isArray(effectivePlan.determinations.conceptsCoveredFirst) ? (
                      <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                        {effectivePlan.determinations.conceptsCoveredFirst.map((c, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10">
                            {i + 1}. {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#333333] font-serif leading-relaxed">
                        {effectivePlan.determinations.conceptsCoveredFirst || effectivePlan.determinations.conceptsOrderReasoning}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      3. Depth of Explanation
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.depthOfExplanation || effectivePlan.determinations.depthCalibration}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      4. Examples or Visuals
                    </span>
                    {Array.isArray(effectivePlan.determinations.examplesAndVisuals) ? (
                      <div className="space-y-0.5 font-sans text-[11px] text-[#444444]">
                        {effectivePlan.determinations.examplesAndVisuals.map((ex, i) => (
                          <div key={i}>• {ex}</div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#333333] font-serif leading-relaxed">
                        {effectivePlan.determinations.examplesAndVisuals}
                      </p>
                    )}
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      5. When Questioned
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.questioningTiming}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      6. Understanding Verification
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.understandingVerification || effectivePlan.determinations.understandingCriteria}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      7. Simplification or Expansion
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.simplificationOrExpansion || effectivePlan.determinations.adaptationTriggers}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/15">
                    <span className="font-mono font-bold text-[10px] text-[#1C1C1C] uppercase block mb-0.5">
                      8. What Should be Taught Next
                    </span>
                    <p className="text-[#333333] font-serif leading-relaxed">
                      {effectivePlan.determinations.whatShouldBeTaughtNext || effectivePlan.determinations.nextStepsRecommendation}
                    </p>
                    {effectivePlan.determinations.testAtEnd && (
                      <span className="mt-2 inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300/50">
                        ✓ Summative test scheduled at end of session
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-4 text-center text-[#888888] font-sans">
                  Standard curriculum progression active for this module.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#1C1C1C]/15 flex justify-end mt-2">
              <button
                onClick={() => setIsDeterminationsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1C1C1C] text-[#F9F8F6] text-xs font-semibold"
              >
                Close Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Complete Dialog */}
      {isLessonCompleted && (
        <div className="fixed inset-0 z-50 bg-[#1C1C1C]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#1C1C1C]/20 max-w-lg w-full rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 mx-auto flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#1C1C1C] mb-1">
              Teaching Session Complete!
            </h3>
            <p className="text-xs text-[#555555] font-serif leading-relaxed mb-4">
              All concepts have been taught and verified through OutLearn's AI interaction lifecycle. Ready for your comprehensive summative assessment test!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => onFinishLesson(effectivePlan, learnerProfile)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all font-sans"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Begin Summative Assessment Test</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating AI Tutor Toggle Bubble & Mobile Chat Popover Widget */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-auto md:hidden">
        {/* Floating Chat Window Popover */}
        {isChatOpen && (
          <div className="mb-3 w-[360px] sm:w-[390px] max-w-[calc(100vw-1.5rem)] h-[480px] max-h-[calc(100vh-7rem)] bg-[#FFFFFF] border border-[#1C1C1C]/20 rounded-2xl shadow-2xl flex flex-col overflow-x-hidden min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Popover Header */}
            <div className="bg-[#1C1C1C] text-[#F9F8F6] px-3.5 py-2.5 flex items-center justify-between border-b border-amber-400/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1C1C1C]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xs sm:text-sm leading-tight text-[#F9F8F6]">
                    {TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>AI Tutor Active • Step {currentStepIdx + 1}/{steps.length || 1}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#FFFFFF]/10 text-[#F9F8F6] transition-colors"
                  title="Close AI Tutor Chat"
                >
                  <X className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            </div>

            {/* Scrollable Conversation Message Stream */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 bg-[#F9F8F6]">
              {conversationHistory.length === 0 ? (
                <div className="p-6 text-center text-[#888888] font-serif italic text-xs">
                  Hi! I'm {TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma'}. Ask me any question or request an analogy for {effectivePlan.topic}!
                </div>
              ) : (
                conversationHistory
                  .filter((msg) => msg.role !== 'system' && !msg.content?.startsWith('[Gemini AI Analysis]') && !msg.content?.startsWith('Analyzed Learner Profile'))
                  .map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border ${
                          isUser
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-[#1C1C1C] text-[#F9F8F6] border-[#1C1C1C]'
                        }`}>
                          {isUser ? 'S' : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                        </div>

                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                          isUser
                            ? 'bg-[#1C1C1C] text-[#F9F8F6] rounded-tr-xs shadow-2xs'
                            : 'bg-[#FFFFFF] text-[#1C1C1C] border border-[#1C1C1C]/15 rounded-tl-xs shadow-2xs'
                        }`}>
                          <div className={`flex items-center justify-between gap-2 mb-1 font-mono text-[10px] ${isUser ? 'text-amber-200' : 'text-[#777777]'}`}>
                            <span className="font-bold">
                              {isUser ? (learnerProfile?.name || 'Learner') : (TEACHER_PERSONALITIES.find((p) => p.id === teacherPersonality)?.title || 'Dr. Vikram Sharma')}
                            </span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="font-serif leading-relaxed whitespace-pre-wrap text-[12px]">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* Typing indicator when Gemini is reasoning */}
              {isQueryLoading && (
                <div className="flex gap-2 flex-row my-2 animate-pulse">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#1C1C1C] text-[#F9F8F6] shrink-0 text-xs font-bold border border-[#1C1C1C]">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                  </div>
                  <div className="bg-[#FFFFFF] text-[#1C1C1C] border border-[#1C1C1C]/15 rounded-xl rounded-tl-xs p-2.5 text-xs flex items-center gap-2">
                    <span className="font-serif italic text-[#777777]">Thinking & formulating response...</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions Chips & Input Bar */}
            <div className="p-3 bg-[#FFFFFF] border-t border-[#1C1C1C]/15 flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono">
                <button
                  onClick={() => handleAskTeacherWithWidget("Can you explain this with a real-life analogy?")}
                  className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                >
                  💡 Give Analogy
                </button>
                <button
                  onClick={() => handleAskTeacherWithWidget("Can you give me a step-by-step example problem?")}
                  className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                >
                  📝 Example Problem
                </button>
                <button
                  onClick={() => handleAskTeacherWithWidget("Explain this in simpler terms.")}
                  className="px-2 py-0.5 rounded-full bg-[#F2EFEB] hover:bg-amber-100 border border-[#1C1C1C]/15 text-[#1C1C1C] whitespace-nowrap transition-colors"
                >
                  🔍 Simplify
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentQuery || ''}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskTeacherWithWidget()}
                  placeholder="Ask Dr. Sharma a question..."
                  className="flex-1 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] font-sans"
                />
                <VoiceMicButton
                  language={activeLanguage}
                  size="sm"
                  label=""
                  onTranscriptChange={(text) => setStudentQuery(text)}
                />
                <button
                  onClick={() => handleAskTeacherWithWidget()}
                  disabled={isQueryLoading || !studentQuery.trim()}
                  className="px-3 py-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] rounded-xl text-xs font-bold flex items-center justify-center shadow-2xs transition-all"
                >
                  {isQueryLoading ? '...' : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating AI Tutor FAB Button */}
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full shadow-2xl transition-all duration-300 border-2 flex items-center justify-center transform hover:scale-105 active:scale-95 group ${
            isChatOpen
              ? 'bg-[#1C1C1C] text-[#F9F8F6] border-amber-400 ring-4 ring-amber-400/20'
              : 'bg-[#1C1C1C] text-[#F9F8F6] border-amber-400/80 hover:border-amber-400 shadow-xl'
          }`}
          title="Toggle AI Tutor Chat"
        >
          {isChatOpen ? (
            <X className="w-5 h-5 text-amber-400 transition-transform group-hover:rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1C1C1C] animate-pulse" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
