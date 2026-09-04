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

export interface ConversationTurn {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  phase: LifecyclePhase;
  timestamp: string;
}

export interface UseLessonOrchestratorProps {
  topic?: string;
  lessonPlan?: LessonPlan;
  learnerProfile: LearnerProfile;
  onUpdateProfile?: (profile: LearnerProfile) => void;
  onFinishLesson?: (lessonPlan: LessonPlan, profile: LearnerProfile) => void;
}

export function useLessonOrchestrator({
  topic: topicProp,
  lessonPlan: initialLessonPlan,
  learnerProfile,
  onUpdateProfile,
  onFinishLesson
}: UseLessonOrchestratorProps) {
  // Determine effective topic and lesson plan
  const effectiveTopic = topicProp || initialLessonPlan?.topic || 'Curriculum Subject';

  // Dynamic Lesson Plan State (Can be refined or generated live via Gemini API)
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan>(() => {
    if (initialLessonPlan) return initialLessonPlan;
    return {
      id: `plan-${Date.now()}`,
      topic: effectiveTopic,
      subject: 'physics',
      educationalLevel: learnerProfile.educationalLevel || 'beginner',
      timeBudget: learnerProfile.timeBudget || '20min',
      totalMinutes: 20,
      language: learnerProfile.preferredLanguage || 'en',
      teacherPersonality: learnerProfile.teacherPersonality || 'mentor',
      prerequisitesOverview: ['Fundamental concept definitions'],
      ragGrounded: true,
      steps: [
        {
          id: 'step-1',
          concept: {
            id: 'c-1',
            name: effectiveTopic,
            subject: 'physics',
            summary: `Core introduction to ${effectiveTopic}`,
            difficulty: learnerProfile.educationalLevel || 'beginner',
            prerequisites: []
          },
          allocatedMinutes: 20,
          masteryState: 'unknown',
          beats: [
            {
              id: 'beat-1',
              conceptId: 'c-1',
              action: 'INTRODUCE',
              speechEn: `Welcome! Today we will explore ${effectiveTopic}. Let us build an intuitive understanding step by step.`,
              caption: `Introduction to ${effectiveTopic}`,
              visualCue: {
                subject: 'physics',
                viewMode: 'concept_map'
              },
              durationSec: 15
            }
          ]
        }
      ]
    };
  });

  // Conversation History state
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);

  const addConversationTurn = useCallback((
    role: 'user' | 'assistant' | 'system',
    content: string,
    phase: LifecyclePhase
  ) => {
    if (!content || !content.trim()) return;
    const turn: ConversationTurn = {
      id: `turn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role,
      content,
      phase,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversationHistory((prev) => [...prev, turn]);
  }, []);

  // Sync active lesson plan when initial prop changes
  useEffect(() => {
    setActiveLessonPlan(initialLessonPlan);
  }, [initialLessonPlan]);

  // Core Lifecycle State (Understand -> Plan -> Explain -> Question -> Adapt -> Completed)
  const [lifecyclePhase, setLifecyclePhase] = useState<LifecyclePhase>('UNDERSTAND');
  const [isOrchestratingLifecycle, setIsOrchestratingLifecycle] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [currentBeatIdx, setCurrentBeatIdx] = useState(0);

  // Playback & Speech Settings
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>(initialLessonPlan?.language || learnerProfile.preferredLanguage || 'en');
  const [teacherPersonality, setTeacherPersonality] = useState<TeacherPersonality>(initialLessonPlan?.teacherPersonality || learnerProfile.teacherPersonality || 'mentor');

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

  // Current active step and beat derived from activeLessonPlan
  const steps = activeLessonPlan?.steps || [];
  const currentStep: LessonStep = steps[currentStepIdx] || steps[0];
  const beats = currentStep?.beats || [];
  const currentBeat: TeachingBeat = beats[currentBeatIdx] || beats[0];

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
      conceptName: conceptName || activeLessonPlan.topic,
      reason,
      strategySwitched: strategy
    };
    setDecisionLogs((prev) => [entry, ...prev.slice(0, 30)]);
  }, [activeLessonPlan?.topic]);

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

  // 2. Gemini-Driven Lifecycle Orchestration Engine (UNDERSTAND -> PLAN -> EXPLAIN)
  useEffect(() => {
    let isCancelled = false;
    setCurrentStepIdx(0);
    setCurrentBeatIdx(0);
    setIsLessonCompleted(false);
    setActiveMisconception(null);
    setIsAwaitingResponse(false);
    setIsOrchestratingLifecycle(true);

    const runLifecycle = async () => {
      // -------------------------------------------------------------
      // PHASE 1: UNDERSTAND
      // -------------------------------------------------------------
      setLifecyclePhase('UNDERSTAND');
      const learnerLevel = learnerProfile.educationalLevel || 'beginner';
      const lang = activeLanguage || 'en';
      const topic = activeLessonPlan.topic;

      const fallbackUSummary = `Analyzed Learner Profile: ${learnerProfile.name || 'Student'} (${learnerLevel} level, language: ${lang}, depth: ${learnerProfile.desiredDepth || 'conceptual'}). Prior knowledge: "${learnerProfile.statedPriorKnowledge || 'Basic concepts'}".`;
      setUnderstandSummary(fallbackUSummary);
      addConversationTurn('system', fallbackUSummary, 'UNDERSTAND');
      logTeachingAction('INTRODUCE', topic, `[UNDERSTAND Phase] Intercepted learner profile & parameters for "${topic}".`);

      // Interface with Gemini API to refine the 8 determinations if missing or on plan change
      try {
        const res = await fetch('/api/parse-student-instruction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instruction: `Teach me ${topic}`,
            educationalLevel: learnerLevel,
            statedPriorKnowledge: learnerProfile.statedPriorKnowledge,
            learningObjective: learnerProfile.learningObjective,
            preferredTeachingStyle: teacherPersonality,
            preferredLanguage: lang,
            timeBudget: learnerProfile.timeBudget || '20min',
            desiredDepth: learnerProfile.desiredDepth || 'conceptual_overview'
          })
        });

        if (res.ok && !isCancelled) {
          const data = await res.json();
          if (data.determinations) {
            const dynamicDets = data.determinations;
            const updatedSummary = `[Gemini AI Analysis] Learner level calibrated to ${learnerLevel}. Scope: ${dynamicDets.whatNeedsToBeTaught || fallbackUSummary}`;
            setUnderstandSummary(updatedSummary);
            addConversationTurn('assistant', updatedSummary, 'UNDERSTAND');
            
            // Attach live determinations to active plan
            setActiveLessonPlan((prev) => ({
              ...prev,
              determinations: dynamicDets
            }));

            logTeachingAction(
              'INTRODUCE',
              topic,
              `[UNDERSTAND Phase - Gemini Verified] 8 Pedagogical Determinations derived live via ${data.modelUsed || 'Gemini 3.1 Flash'}`
            );
          }
        }
      } catch (e) {
        console.warn('[LessonOrchestrator] Dynamic Gemini understand phase fallback used', e);
      }

      if (isCancelled) return;

      // Small natural pause for cognitive transition
      await new Promise((r) => setTimeout(r, 600));
      if (isCancelled) return;

      // -------------------------------------------------------------
      // PHASE 2: PLAN
      // -------------------------------------------------------------
      setLifecyclePhase('PLAN');
      const dets = activeLessonPlan?.determinations;
      const pSummary = dets?.whatNeedsToBeTaught || `Mapped ${steps.length} concept steps with ${activeLessonPlan.totalMinutes || 20}min budget.`;
      setPlanSummary(pSummary);
      addConversationTurn('assistant', pSummary, 'PLAN');
      logTeachingAction(
        'INTRODUCE',
        topic,
        `[PLAN Phase] Sequence established: ${pSummary.slice(0, 110)}...`
      );

      await new Promise((r) => setTimeout(r, 600));
      if (isCancelled) return;

      // -------------------------------------------------------------
      // PHASE 3: EXPLAIN
      // -------------------------------------------------------------
      setIsOrchestratingLifecycle(false);
      setLifecyclePhase('EXPLAIN');
      logTeachingAction(
        'EXPLAIN',
        steps[0]?.concept?.name || topic,
        `[EXPLAIN Phase] Ready to deliver interactive concept beats in ${lang}.`
      );
    };

    runLifecycle();

    return () => {
      isCancelled = true;
    };
  }, [activeLessonPlan.id]);

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
    logTeachingAction(beat.action, currentStep?.concept?.name || activeLessonPlan.topic, `Delivering ${beat.action} beat in ${activeLanguage}`);
    addConversationTurn('assistant', textToSpeak, 'EXPLAIN');

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
      personality: teacherPersonality,
      onEnd: () => {
        if (beat.pauseForInteraction || beat.checkpoint) {
          setLifecyclePhase('QUESTION');
          setIsAwaitingResponse(true);
          setIsPlaying(false);
          if (beat.checkpoint?.question) {
            addConversationTurn('assistant', beat.checkpoint.question, 'QUESTION');
          }
          logTeachingAction(
            'ASK_CONCEPTUAL',
            currentStep?.concept?.name || activeLessonPlan.topic,
            '[QUESTION Phase] Intercepted checkpoint pause — awaiting student response.'
          );
        } else if (isPlaying) {
          setTimeout(() => {
            advanceToNextBeat();
          }, 400);
        }
      }
    });
  }, [currentStep, activeLanguage, isMuted, speechRate, isPlaying, getActiveSpeechText, logTeachingAction, activeLessonPlan?.topic, addConversationTurn]);

  // Auto-play speech when playing or beat changes in EXPLAIN phase
  useEffect(() => {
    if (isPlaying && currentBeat && lifecyclePhase === 'EXPLAIN') {
      deliverBeatSpeech(currentBeat);
    }
  }, [currentStepIdx, currentBeatIdx, isPlaying, activeLanguage, lifecyclePhase]);

  // Advance to Next Beat / Step
  const advanceToNextBeat = useCallback(() => {
    if (!currentStep) return;

    if (currentBeatIdx < beats.length - 1) {
      setCurrentBeatIdx((prev) => prev + 1);
      setLifecyclePhase('EXPLAIN');
    } else if (currentStepIdx < steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      setCurrentBeatIdx(0);
      setLifecyclePhase('EXPLAIN');
      logTeachingAction('MOVE_FORWARD', steps[nextIdx]?.concept?.name || 'Next Step', 'Mastery gate cleared. Advancing to next concept step.');
    } else {
      // Completed all steps
      setIsPlaying(false);
      setLifecyclePhase('COMPLETED');
      setIsLessonCompleted(true);
      logTeachingAction('ASSESS', 'Lesson Final Assessment', 'All concept steps completed. Transitioning to summative assessment.');
      if (onFinishLesson) {
        onFinishLesson(activeLessonPlan, learnerProfile);
      }
    }
  }, [currentStep, currentBeatIdx, currentStepIdx, beats, steps, activeLessonPlan, learnerProfile, logTeachingAction, onFinishLesson]);

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

  // -------------------------------------------------------------
  // PHASE 4: QUESTION & USER INPUT INTERCEPTION (Gemini-Evaluated)
  // -------------------------------------------------------------
  const handleCheckAnswer = async (answerOverride?: string) => {
    const rawAnswer = answerOverride !== undefined ? answerOverride : (selectedOption || freeTextAnswer);
    if (!rawAnswer || !currentBeat?.checkpoint) return;

    setIsSubmittingAnswer(true);
    addConversationTurn('user', rawAnswer, 'QUESTION');
    const cp = currentBeat.checkpoint;

    try {
      // Intercept user input and evaluate with Gemini API
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: cp.question,
          studentAnswer: rawAnswer,
          correctAnswer: cp.correctAnswer,
          conceptName: currentStep?.concept?.name || activeLessonPlan.topic,
          knownMisconceptions: cp.knownMisconceptions || []
        })
      });

      const data = await res.json();
      setEvaluationResult(data);

      if (data.isCorrect) {
        // Correct Answer -> Trigger celebratory feedback & update mastery
        confetti({ particleCount: 55, spread: 60, origin: { y: 0.7 } });
        setActiveMisconception(null);
        setIsAwaitingResponse(false);
        setLifecyclePhase('EXPLAIN');
        addConversationTurn('assistant', data.correctiveSpeech || 'Correct! Concept verified.', 'EXPLAIN');

        // Update profile mastery
        if (onUpdateProfile && currentStep?.concept?.id) {
          const updatedMastery = {
            ...learnerProfile.conceptMastery,
            [currentStep.concept.id]: 'understood' as const
          };
          onUpdateProfile({ ...learnerProfile, conceptMastery: updatedMastery });
        }

        logTeachingAction(
          'MOVE_FORWARD',
          currentStep?.concept?.name || activeLessonPlan.topic,
          `Student answered correctly ("${rawAnswer}"). Concept mastery updated.`
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
        // Incorrect / Misconception -> Phase 5: ADAPT
        setLifecyclePhase('ADAPT');
        const miscObj = {
          category: data.category || 'conceptual_misconception',
          name: data.misconceptionName || 'Conceptual Misconception',
          diagnosis: data.diagnosedThought || 'Flawed intuitive assumption',
          speech: data.correctiveSpeech || 'Let us re-examine this through a practical example.'
        };
        setActiveMisconception(miscObj);
        addConversationTurn('assistant', miscObj.speech, 'ADAPT');

        logTeachingAction(
          'CORRECT_MISCONCEPTION',
          currentStep?.concept?.name || activeLessonPlan.topic,
          `[ADAPT Phase] Intercepted Misconception: ${miscObj.name}. Strategy: ${data.suggestedStrategy || 'analogy'}`,
          data.suggestedStrategy || 'analogy'
        );

        // Speak corrective speech
        speechService.speak(miscObj.speech, activeLanguage, { rate: speechRate });
      }
    } catch (err) {
      console.warn('[LessonOrchestrator] Error evaluating answer, using local diagnostic fallback', err);
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
    logTeachingAction('REEXPLAIN', currentStep?.concept?.name || activeLessonPlan.topic, 'Student reviewed adaptive explanation and resumes lesson.');
    advanceToNextBeat();
  };

  // Intercept Mid-Lesson Student Question (RAG Grounded AI via Gemini)
  const handleAskTeacher = async (customQuery?: string) => {
    const queryToUse = customQuery !== undefined ? customQuery : studentQuery;
    if (!queryToUse.trim()) return;

    setIsQueryLoading(true);
    addConversationTurn('user', queryToUse, lifecyclePhase);
    speechService.stop();

    try {
      const res = await fetch('/api/ask-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentQuestion: queryToUse,
          currentConcept: currentStep?.concept?.name || activeLessonPlan.topic,
          currentTopic: activeLessonPlan.topic,
          language: activeLanguage,
          teacherPersonality,
          materialContext: activeLessonPlan.sourceDocumentName ? `Uploaded document: ${activeLessonPlan.sourceDocumentName}` : ''
        })
      });

      const data = await res.json();
      setTeacherAnswer(data.answer);
      setTeacherAnswerMeta({ isLiveAi: data.isLiveAi, modelUsed: data.modelUsed });
      addConversationTurn('assistant', data.answer, lifecyclePhase);

      logTeachingAction('EXPLAIN', currentStep?.concept?.name || activeLessonPlan.topic, `Answered student query: "${queryToUse.slice(0, 40)}..."`);

      // Speak teacher answer
      speechService.speak(data.answer, activeLanguage, { rate: speechRate });
    } catch (err) {
      console.warn('[LessonOrchestrator] Error asking teacher:', err);
      const fallbackAns = `In ${currentStep?.concept?.name || activeLessonPlan.topic}, this principle links directly to our core model. Let us continue exploring to see how it works in practice.`;
      setTeacherAnswer(fallbackAns);
      addConversationTurn('assistant', fallbackAns, lifecyclePhase);
    } finally {
      setIsQueryLoading(false);
    }
  };

  // Jump to specific step
  const handleJumpToStep = (stepIdx: number) => {
    if (stepIdx >= 0 && stepIdx < steps.length) {
      setCurrentStepIdx(stepIdx);
      setCurrentBeatIdx(0);
      setLifecyclePhase('EXPLAIN');
      setIsAwaitingResponse(false);
      setActiveMisconception(null);
      logTeachingAction('MOVE_FORWARD', steps[stepIdx]?.concept?.name || 'Step Jump', `Navigated directly to Step ${stepIdx + 1}`);
    }
  };

  return {
    // Dynamic Lesson Plan & Lifecycle
    activeLessonPlan,
    lifecyclePhase,
    isOrchestratingLifecycle,
    currentStepIdx,
    currentBeatIdx,
    currentStep,
    currentBeat,
    activeSpeechText: getActiveSpeechText(currentBeat),
    understandSummary,
    planSummary,
    conversationHistory,

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

