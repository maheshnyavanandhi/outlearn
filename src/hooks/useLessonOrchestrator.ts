import { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  LessonPlan,
  LearnerProfile,
  TeachingBeat,
  TeachingActionLogEntry,
  LanguageCode,
  TeacherPersonality,
  MisconceptionCategory,
  TeachingActionType,
  LessonStep
} from '../types';
import { speechService } from '../services/speechService';

export type LifecyclePhase = 'UNDERSTAND' | 'PLAN' | 'EXPLAIN' | 'QUESTION' | 'ADAPT' | 'COMPLETED';

export interface UseLessonOrchestratorProps {
  lessonPlan: LessonPlan;
  learnerProfile: LearnerProfile;
  onUpdateProfile?: (profile: LearnerProfile) => void;
  onFinishLesson?: (lessonPlan: LessonPlan, profile: LearnerProfile) => void;
}

export function useLessonOrchestrator({
  lessonPlan,
  learnerProfile,
  onUpdateProfile,
  onFinishLesson
}: UseLessonOrchestratorProps) {
  // Core Lifecycle State
  const [lifecyclePhase, setLifecyclePhase] = useState<LifecyclePhase>('UNDERSTAND');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentBeatIdx, setCurrentBeatIdx] = useState(0);

  // Playback & Speech Settings
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>(lessonPlan?.language || 'en');
  const [teacherPersonality, setTeacherPersonality] = useState<TeacherPersonality>(lessonPlan?.teacherPersonality || 'mentor');

  // Checkpoint Interaction State
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [freeTextAnswer, setFreeTextAnswer] = useState<string>('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Misconception & Adaptation State
  const [activeMisconception, setActiveMisconception] = useState<{
    category: MisconceptionCategory;
    name: string;
    diagnosis: string;
    speech: string;
  } | null>(null);
  const [showAnalogyAlternative, setShowAnalogyAlternative] = useState(false);

  // Mid-Lesson Student Question (RAG Grounded)
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const [teacherAnswer, setTeacherAnswer] = useState<string | null>(null);
  const [teacherAnswerMeta, setTeacherAnswerMeta] = useState<{ isLiveAi: boolean; modelUsed?: string } | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Decision State Machine Log
  const [decisionLogs, setDecisionLogs] = useState<TeachingActionLogEntry[]>([]);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  // Summaries for Understand & Plan phases
  const [understandSummary, setUnderstandSummary] = useState('');
  const [planSummary, setPlanSummary] = useState('');

  // Current active step and beat
  const currentStep: LessonStep = lessonPlan.steps[currentStepIdx] || lessonPlan.steps[0];
  const currentBeat: TeachingBeat = currentStep?.beats[currentBeatIdx] || currentStep?.beats[0];

  // Helper: Log teaching actions into decision state machine
  const logTeachingAction = useCallback((
    action: TeachingActionType,
    conceptName: string,
    reason: string,
    strategy?: string
  ) => {
    const entry: TeachingActionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      conceptName,
      reason,
      strategySwitched: strategy
    };
    setDecisionLogs((prev) => [entry, ...prev.slice(0, 25)]);
  }, []);

  // 1. Subscribe to Speech Service
  useEffect(() => {
    const unsub = speechService.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsub();
      speechService.stop();
    };
  }, []);

  // 2. Initialize Lifecycle (Understand -> Plan -> Explain) on Mount or Plan Change
  useEffect(() => {
    setCurrentStepIdx(0);
    setCurrentBeatIdx(0);
    setIsLessonCompleted(false);
    setActiveMisconception(null);
    setIsAwaitingResponse(false);

    // 1. UNDERSTAND Phase
    setLifecyclePhase('UNDERSTAND');
    const learnerLevel = learnerProfile.educationalLevel || lessonPlan.educationalLevel || 'beginner';
    const lang = lessonPlan.language || 'en';
    const prereqs = lessonPlan.prerequisitesOverview?.join(', ') || 'Core introductory concepts';
    
    const uSummary = `Analyzed Learner Profile: ${learnerProfile.name || 'Student'} (${learnerLevel} level, language: ${lang}). Prior knowledge & prerequisites evaluated: ${prereqs}.`;
    setUnderstandSummary(uSummary);
    logTeachingAction(
      'INTRODUCE',
      lessonPlan.topic,
      `[UNDERSTAND Phase] ${uSummary}`
    );

    // 2. Transition to PLAN Phase
    const planTimer = setTimeout(() => {
      setLifecyclePhase('PLAN');
      const dets = lessonPlan.determinations;
      const pSummary = dets?.whatNeedsToBeTaught || `Mapped ${lessonPlan.steps?.length || 1} concept steps with ${lessonPlan.totalMinutes}min budget.`;
      setPlanSummary(pSummary);
      logTeachingAction(
        'INTRODUCE',
        lessonPlan.topic,
        `[PLAN Phase] 8 Determinations established: ${pSummary.slice(0, 100)}...`
      );

      // 3. Transition to EXPLAIN Phase
      const explainTimer = setTimeout(() => {
        setLifecyclePhase('EXPLAIN');
        logTeachingAction(
          'EXPLAIN',
          currentStep?.concept?.name || lessonPlan.topic,
          `[EXPLAIN Phase] Ready to deliver concept beats in ${lang}.`
        );
      }, 800);

      return () => clearTimeout(explainTimer);
    }, 600);

    return () => clearTimeout(planTimer);
  }, [lessonPlan.id]);

  // Compute active speech text in current language
  const getActiveSpeechText = useCallback((beat: TeachingBeat) => {
    if (!beat) return '';
    if (activeLanguage === 'hi' && beat.speechHi) return beat.speechHi;
    if (activeLanguage === 'te' && beat.speechTe) return beat.speechTe;
    if (activeLanguage === 'hinglish' && beat.speechHinglish) return beat.speechHinglish;
    return beat.speechEn;
  }, [activeLanguage]);

  // Deliver current beat speech
  const deliverBeatSpeech = useCallback((beat: TeachingBeat) => {
    if (!beat) return;

    const textToSpeak = getActiveSpeechText(beat);
    logTeachingAction(beat.action, currentStep.concept.name, `Delivering ${beat.action} beat in ${activeLanguage}`);

    if (isMuted) {
      if (beat.pauseForInteraction || beat.checkpoint) {
        setLifecyclePhase('QUESTION');
        setIsAwaitingResponse(true);
        setIsPlaying(false);
      }
      return;
    }

    speechService.speak(textToSpeak, activeLanguage, {
      rate: speechRate,
      onEnd: () => {
        if (beat.pauseForInteraction || beat.checkpoint) {
          setLifecyclePhase('QUESTION');
          setIsAwaitingResponse(true);
          setIsPlaying(false);
          logTeachingAction(
            'ASK_CONCEPTUAL',
            currentStep.concept.name,
            '[QUESTION Phase] Paused for student response at formative checkpoint.'
          );
        } else if (isPlaying) {
          setTimeout(() => {
            advanceToNextBeat();
          }, 800);
        }
      }
    });
  }, [currentStep, activeLanguage, isMuted, speechRate, isPlaying, getActiveSpeechText, logTeachingAction]);

  // Play beat automatically when isPlaying or beat/step index changes in EXPLAIN phase
  useEffect(() => {
    if (isPlaying && currentBeat && lifecyclePhase === 'EXPLAIN') {
      deliverBeatSpeech(currentBeat);
    }
  }, [currentStepIdx, currentBeatIdx, isPlaying, activeLanguage, lifecyclePhase]);

  // Advance to Next Beat / Step
  const advanceToNextBeat = useCallback(() => {
    if (!currentStep) return;

    if (currentBeatIdx < currentStep.beats.length - 1) {
      setCurrentBeatIdx((prev) => prev + 1);
      setLifecyclePhase('EXPLAIN');
    } else if (currentStepIdx < lessonPlan.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setCurrentBeatIdx(0);
      setLifecyclePhase('EXPLAIN');
      logTeachingAction('MOVE_FORWARD', lessonPlan.steps[nextIdx].concept.name, 'Mastery gate cleared. Advancing to next concept step.');
    } else {
      // Completed all steps
      setIsPlaying(false);
      setLifecyclePhase('COMPLETED');
      setIsLessonCompleted(true);
      logTeachingAction('ASSESS', 'Lesson Final Assessment', 'All concept steps completed. Ready for assessment.');
      if (onFinishLesson) {
        onFinishLesson(lessonPlan, learnerProfile);
      }
    }
  }, [currentStep, currentBeatIdx, currentStepIdx, lessonPlan, learnerProfile, logTeachingAction, onFinishLesson]);

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (lifecyclePhase === 'QUESTION' || lifecyclePhase === 'ADAPT') {
        setLifecyclePhase('EXPLAIN');
      }
      if (currentBeat) {
        deliverBeatSpeech(currentBeat);
      }
    }
  };

  // Replay Current Beat
  const handleReplayBeat = () => {
    speechService.stop();
    setIsPlaying(true);
    if (currentBeat) {
      deliverBeatSpeech(currentBeat);
    }
  };

  // Evaluate Student Checkpoint Answer (AI-Driven)
  const handleCheckAnswer = async (answerOverride?: string) => {
    const rawAnswer = answerOverride !== undefined ? answerOverride : (selectedOption || freeTextAnswer);
    if (!rawAnswer || !currentBeat?.checkpoint) return;

    setIsSubmittingAnswer(true);
    const cp = currentBeat.checkpoint;

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cp.question,
          studentAnswer: rawAnswer,
          correctAnswer: cp.correctAnswer,
          conceptName: currentStep.concept.name,
          knownMisconceptions: cp.knownMisconceptions || []
        })
      });

      const data = await res.json();
      setEvaluationResult(data);

      if (data.isCorrect) {
        // Correct Answer!
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.7 } });
        setActiveMisconception(null);
        setIsAwaitingResponse(false);
        setLifecyclePhase('EXPLAIN');

        // Update profile mastery
        if (onUpdateProfile) {
          const updatedMastery = {
            ...learnerProfile.conceptMastery,
            [currentStep.concept.id]: 'understood' as const
          };
          onUpdateProfile({ ...learnerProfile, conceptMastery: updatedMastery });
        }

        logTeachingAction(
          'MOVE_FORWARD',
          currentStep.concept.name,
          'Student answered correctly. Concept mastery updated to understood.'
        );

        // Speak positive reinforcement and advance
        speechService.speak(data.correctiveSpeech || 'Excellent! You understood the concept correctly.', activeLanguage, {
          rate: speechRate,
          onEnd: () => {
            setTimeout(() => {
              advanceToNextBeat();
            }, 600);
          }
        });
      } else {
        // Incorrect or Misconception!
        setLifecyclePhase('ADAPT');
        const miscObj = {
          category: data.category || 'conceptual_misconception',
          name: data.misconceptionName || 'Conceptual Misconception',
          diagnosis: data.diagnosedThought || 'Flawed intuitive assumption',
          speech: data.correctiveSpeech || 'Let us re-examine this through a practical example.'
        };
        setActiveMisconception(miscObj);

        logTeachingAction(
          'CORRECT_MISCONCEPTION',
          currentStep.concept.name,
          `[ADAPT Phase] Diagnosed: ${miscObj.name}. Strategy: ${data.suggestedStrategy || 'analogy'}`,
          data.suggestedStrategy || 'analogy'
        );

        // Speak corrective speech
        speechService.speak(miscObj.speech, activeLanguage, { rate: speechRate });
      }
    } catch (err) {
      console.warn('Error evaluating answer, applying local fallback', err);
      const isMatch = rawAnswer.toLowerCase().trim().includes(cp.correctAnswer.toLowerCase().trim());
      if (isMatch) {
        setIsAwaitingResponse(false);
        setLifecyclePhase('EXPLAIN');
        advanceToNextBeat();
      } else {
        setLifecyclePhase('ADAPT');
        setActiveMisconception({
          category: 'conceptual_misconception',
          name: 'Core Misconception',
          diagnosis: 'The selected option does not match the expected core physical relationship.',
          speech: 'Not quite. Let us observe the visual model carefully and try again.'
        });
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Continue after misconception explanation
  const handleContinueFromMisconception = () => {
    setActiveMisconception(null);
    setIsAwaitingResponse(false);
    setSelectedOption('');
    setFreeTextAnswer('');
    setLifecyclePhase('EXPLAIN');
    logTeachingAction('REEXPLAIN', currentStep.concept.name, 'Student reviewed adaptive explanation and resumes lesson.');
    advanceToNextBeat();
  };

  // Ask Teacher a Mid-Lesson Question (RAG Grounded AI)
  const handleAskTeacher = async (customQuery?: string) => {
    const queryToUse = customQuery !== undefined ? customQuery : studentQuery;
    if (!queryToUse.trim()) return;

    setIsQueryLoading(true);
    speechService.stop();

    try {
      const res = await fetch('/api/ask-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: queryToUse,
          currentConcept: currentStep?.concept?.name || lessonPlan.topic,
          currentTopic: lessonPlan.topic,
          language: activeLanguage,
          teacherPersonality,
          materialContext: lessonPlan.sourceDocumentName ? `Uploaded document: ${lessonPlan.sourceDocumentName}` : ''
        })
      });

      const data = await res.json();
      setTeacherAnswer(data.answer);
      setTeacherAnswerMeta({ isLiveAi: data.isLiveAi, modelUsed: data.modelUsed });

      logTeachingAction('EXPLAIN', currentStep.concept.name, `Answered student query: "${queryToUse.slice(0, 40)}..."`);

      // Speak teacher answer
      speechService.speak(data.answer, activeLanguage, { rate: speechRate });
    } catch (err) {
      console.warn('Error asking teacher:', err);
      setTeacherAnswer(`In ${currentStep.concept.name}, this principles links directly to our core model. Let us continue exploring to see how it works in practice.`);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Jump to specific step
  const handleJumpToStep = (stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < lessonPlan.steps.length) {
      setCurrentStepIdx(stepIdx);
      setCurrentBeatIdx(0);
      setLifecyclePhase('EXPLAIN');
      setIsAwaitingResponse(false);
      setActiveMisconception(null);
      logTeachingAction('MOVE_FORWARD', lessonPlan.steps[stepIdx].concept.name, `Navigated directly to Step ${stepIdx + 1}`);
    }
  };

  return {
    // Lifecycle State
    lifecyclePhase,
    currentStepIdx,
    currentBeatIdx,
    currentStep,
    currentBeat,
    activeSpeechText: getActiveSpeechText(currentBeat),
    understandSummary,
    planSummary,

    // Controls & Settings
    isPlaying,
    isSpeaking,
    speechRate,
    isMuted,
    activeLanguage,
    teacherPersonality,

    // Interaction State
    isAwaitingResponse,
    selectedOption,
    freeTextAnswer,
    isSubmittingAnswer,
    evaluationResult,
    activeMisconception,
    showAnalogyAlternative,

    // Mid-Lesson Ask Modal
    isAskModalOpen,
    studentQuery,
    teacherAnswer,
    teacherAnswerMeta,
    isQueryLoading,

    // Decision Logs & Completion
    decisionLogs,
    isLessonCompleted,

    // State Setters & Handlers
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
    setShowAnalogyAlternative,
    setIsAskModalOpen,
    setStudentQuery,
    handleAskTeacher,
    handleJumpToStep,
    logTeachingAction
  };
}
