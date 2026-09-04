import React, { useState } from 'react';
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
  Check
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

  // Lifecycle stage progression definition
  const lifecycleStages: { phase: LifecyclePhase; label: string; icon: any }[] = [
    { phase: 'UNDERSTAND', label: 'Understand', icon: Brain },
    { phase: 'PLAN', label: 'Plan', icon: Layers },
    { phase: 'EXPLAIN', label: 'Explain', icon: Sparkles },
    { phase: 'QUESTION', label: 'Question', icon: HelpCircle },
    { phase: 'ADAPT', label: 'Adapt', icon: Lightbulb }
  ];

  return (
    <div className="w-full min-h-[90vh] flex flex-col bg-[#F9F8F6] text-[#1C1C1C]" id="teaching-room-root">
      {/* Top Persistent Lesson Context & Lifecycle Indicator Strip */}
      <div className="px-4 py-2.5 bg-[#FFFFFF] border-b border-[#1C1C1C]/15 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1C1C1C] animate-pulse" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-serif font-bold text-[#1C1C1C]">{effectivePlan.topic}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                Step {currentStepIdx + 1}/{steps.length || 1}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-mono border border-emerald-300/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>AI Orchestrator {isOrchestratingLifecycle ? 'Evaluating...' : 'Active'}</span>
              </span>
            </div>
            <p className="text-xs text-[#666666] truncate max-w-md">
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
        <div className="flex items-center gap-2">
          {/* AI Pedagogical Blueprint Modal Trigger */}
          <button
            onClick={() => setIsDeterminationsModalOpen(true)}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs font-semibold items-center gap-1.5 transition-all"
            title="View 8 Pedagogical Determinations Blueprint"
          >
            <Brain className="w-3.5 h-3.5 text-[#1C1C1C]" />
            <span className="hidden md:inline font-mono text-[11px]">AI Blueprint</span>
          </button>

          {/* Teacher Brain / Decision Logs Drawer Trigger */}
          <button
            onClick={() => setIsLogDrawerOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="View Teacher Decision Engine Logs & Conversation Transcript"
          >
            <ListOrdered className="w-3.5 h-3.5 text-[#1C1C1C]" />
            <span className="hidden sm:inline font-mono text-[11px]">Trace Logs</span>
          </button>

          {/* Language Switcher dropdown */}
          <div className="relative">
            <select
              value={activeLanguage || 'en'}
              onChange={(e) => setActiveLanguage(e.target.value as LanguageCode)}
              className="bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] cursor-pointer"
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
            className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Complete & Assess</span>
          </button>
        </div>
      </div>

      {/* Main Split-Stage Arena */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 max-w-7xl mx-auto w-full">
        {/* Left Column: AI Teacher Zone (Avatar + Teacher Persona + Speech status) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Teacher Avatar Card */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-4 shadow-sm flex flex-col items-center justify-center">
            <TeacherAvatar
              personality={teacherPersonality}
              isSpeaking={isSpeaking}
              teacherMood={
                lifecyclePhase === 'QUESTION'
                  ? 'listening'
                  : lifecyclePhase === 'ADAPT'
                  ? 'questioning'
                  : isSpeaking
                  ? 'explaining'
                  : 'thinking'
              }
              size="md"
            />

            {/* Active Lifecycle Phase Indicator Badge */}
            <div className="mt-2 text-center">
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15 uppercase tracking-wider font-bold">
                Phase: {lifecyclePhase}
              </span>
            </div>

            {/* Personality Selector Dropdown */}
            <div className="w-full mt-3 pt-3 border-t border-[#1C1C1C]/10">
              <label className="text-[11px] font-mono text-[#666666] font-medium block mb-1">
                Teacher Persona:
              </label>
              <select
                value={teacherPersonality || 'mentor'}
                onChange={(e) => setTeacherPersonality(e.target.value as TeacherPersonality)}
                className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
              >
                {TEACHER_PERSONALITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.subtitle})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ask Teacher Interruption Box */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-3.5 shadow-sm">
            <button
              onClick={() => {
                setIsAskModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <MessageCircleQuestion className="w-4 h-4 text-[#1C1C1C]" />
              <span>Ask Teacher / Interrupt Lesson</span>
            </button>
            <p className="text-[10px] text-[#777777] text-center mt-1.5 font-sans">
              Curious? Interrupt anytime — OutLearn maintains lesson context.
            </p>
          </div>

          {/* Concept Navigation Stepper */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-3 text-xs shadow-sm">
            <h4 className="text-[11px] uppercase font-mono font-bold text-[#1C1C1C] tracking-wider mb-2 flex items-center justify-between">
              <span>Curriculum Steps</span>
              <span className="text-[10px] text-[#777777] font-normal font-sans">Click to jump</span>
            </h4>
            <div className="space-y-1">
              {steps.map((step, idx) => (
                <button
                  key={step.id || idx}
                  onClick={() => handleJumpToStep(idx)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                    idx === currentStepIdx
                      ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-sm'
                      : 'bg-[#F9F8F6] hover:bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {step.concept.name}</span>
                  {idx === currentStepIdx && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Current Concept Metadata & Key Formulas */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-4 text-xs shadow-sm">
            <h4 className="text-[11px] uppercase font-mono font-bold text-[#1C1C1C] tracking-wider mb-2">
              Concept Blueprint
            </h4>
            <p className="text-[#555555] text-[11px] leading-relaxed mb-2 font-serif">
              {currentStep?.concept?.summary || 'Key principles and foundational intuition.'}
            </p>
            {currentStep?.concept?.keyFormulas && currentStep.concept.keyFormulas.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {currentStep.concept.keyFormulas.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] font-mono text-[10px]">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Teaching Canvas & Interaction Zone */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Visual Canvas Area */}
          <div className="flex-1 min-h-[420px] bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 overflow-hidden flex flex-col shadow-sm relative">
            {/* Dynamic AI Orchestrator Lifecycle Banner overlay during UNDERSTAND or PLAN phases */}
            {(lifecyclePhase === 'UNDERSTAND' || lifecyclePhase === 'PLAN' || isOrchestratingLifecycle) && (
              <div className="absolute top-3 left-3 right-3 z-20 p-3 rounded-xl bg-[#FFFFFF]/95 backdrop-blur-md border border-[#1C1C1C]/20 shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[11px] font-mono font-bold text-[#1C1C1C] uppercase tracking-wider">
                    AI Pedagogical Orchestration ({lifecyclePhase} Phase)
                  </span>
                </div>
                <p className="text-xs text-[#333333] font-serif leading-relaxed">
                  {lifecyclePhase === 'UNDERSTAND' ? understandSummary || 'Calibrating learner profile and prior knowledge...' : planSummary || 'Structuring 8 pedagogical determinations and concept beats...'}
                </p>
              </div>
            )}

            <D3InteractiveDiagram
              topic={effectivePlan.topic}
              subject={currentStep?.concept?.subject || effectivePlan.subject}
              conceptName={currentStep?.concept?.name}
              highlightTarget={currentBeat?.visualCue?.highlightTarget}
              annotation={currentBeat?.visualCue?.annotation || currentBeat?.caption}
            />
          </div>

          {/* Subtitles & Timed Caption Track */}
          {showCaptions && (
            <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#1C1C1C]/15 text-center text-xs sm:text-sm text-[#1C1C1C] min-h-[44px] flex items-center justify-center font-serif italic shadow-sm">
              <span className="text-[#777777] mr-2 font-mono text-[11px] not-italic">[{currentBeat?.action || 'EXPLAIN'}]</span>
              <span>{activeSpeechText || currentBeat?.speechEn}</span>
            </div>
          )}

          {/* Video Player Timeline & Controls Bar */}
          <div className="p-3 bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            {/* Play/Pause & Replay Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePlay}
                className={`p-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isPlaying
                    ? 'bg-[#333333] hover:bg-[#222222] text-[#F9F8F6]'
                    : 'bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6]'
                }`}
                title={isPlaying ? 'Pause Lesson' : 'Play Lesson'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs">{isPlaying ? 'Pause' : 'Teach'}</span>
              </button>

              <button
                onClick={handleReplayBeat}
                className="p-2 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs flex items-center gap-1 transition-all"
                title="Replay Current Concept Explanation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-sans">Replay</span>
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs transition-all"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-[#DC2626]" /> : <Volume2 className="w-3.5 h-3.5 text-[#1C1C1C]" />}
              </button>
            </div>

            {/* Stepper Dots Indicator */}
            <div className="flex items-center gap-1.5">
              {currentStep?.beats?.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => advanceToNextBeat()}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentBeatIdx
                      ? 'w-6 bg-[#1C1C1C]'
                      : idx < currentBeatIdx
                      ? 'w-2 bg-[#666666]'
                      : 'w-2 bg-[#E2DED6] hover:bg-[#CFCABF]'
                  }`}
                  title={`Beat ${idx + 1}`}
                />
              ))}
            </div>

            {/* Speed & Caption Toggles */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setShowCaptions((c) => !c)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  showCaptions ? 'bg-[#1C1C1C] text-[#F9F8F6] border-[#1C1C1C]' : 'bg-[#F2EFEB] border-[#1C1C1C]/15 text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                CC
              </button>

              <select
                value={speechRate ?? 1.0}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-lg px-2 py-1 focus:outline-none font-sans"
              >
                <option value={0.75}>0.75x</option>
                <option value={1.0}>1.0x (Normal)</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
          </div>
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
              <div className="mb-4">
                <textarea
                  value={freeTextAnswer || ''}
                  onChange={(e) => setFreeTextAnswer(e.target.value)}
                  placeholder="Type your explanation or response here..."
                  className="w-full h-24 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl p-3 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]/15">
              <button
                onClick={() => handleCheckAnswer()}
                disabled={(!selectedOption && !freeTextAnswer.trim()) || isSubmittingAnswer}
                className="ml-auto px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] text-xs font-bold shadow flex items-center gap-1.5 transition-all font-sans"
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

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={studentQuery || ''}
                onChange={(e) => setStudentQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskTeacher()}
                placeholder="e.g., Why does this relationship hold true?"
                className="flex-1 bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-3 py-2 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
              />
              <button
                onClick={() => handleAskTeacher()}
                disabled={isQueryLoading || !studentQuery.trim()}
                className="px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] rounded-xl text-xs font-bold flex items-center gap-1"
              >
                {isQueryLoading ? 'Thinking...' : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Answer Display */}
            {teacherAnswer && (
              <div className="p-3.5 rounded-xl bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-bold font-serif text-[#1C1C1C] text-[11px]">OutLearn's Explanation:</div>
                  {teacherAnswerMeta?.isLiveAi && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded border border-emerald-300/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Live {teacherAnswerMeta.modelUsed || 'Gemini'}</span>
                    </span>
                  )}
                </div>
                <p className="leading-relaxed font-serif italic">{teacherAnswer}</p>
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
                  <div key={item.id} className={`p-2.5 rounded-xl border text-xs ${
                    item.role === 'user' ? 'bg-amber-50/70 border-amber-200 text-amber-950' : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#1C1C1C]'
                  }`}>
                    <div className="flex items-center justify-between mb-1 font-mono text-[10px]">
                      <span className="font-bold uppercase">{item.role === 'user' ? 'Student' : item.role === 'assistant' ? 'OutLearn AI' : 'System'}</span>
                      <span className="text-[#888888]">{item.phase || 'EXPLAIN'} • {item.timestamp}</span>
                    </div>
                    <p className="font-serif leading-relaxed text-[11px] whitespace-pre-wrap">{item.content}</p>
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
    </div>
  );
};
