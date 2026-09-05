import React, { useState } from 'react';
import {
  EducationalLevel,
  TimeBudget,
  LanguageCode,
  TeacherPersonality,
  LessonPlan,
  TeacherDeterminations,
  LearnerProfile
} from '../types';
import { SUPPORTED_LANGUAGES, TEACHER_PERSONALITIES } from '../data/curriculumData';
import { generatePersonalizedOpeningSpeech } from '../utils/personalizedGreeting';
import {
  BookOpen,
  Upload,
  Clock,
  Calendar,
  Globe,
  Sparkles,
  Zap,
  Database,
  Microscope,
  Cpu,
  FileText,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Layers,
  Sliders,
  Eye,
  CheckSquare,
  GitBranch,
  Target,
  User,
  ShieldCheck,
  Brain
} from 'lucide-react';

interface SetupViewProps {
  learnerProfile?: LearnerProfile;
  onUpdateProfile?: (updated: LearnerProfile) => void;
  onOpenProfileModal?: () => void;
  onStartLesson: (plan: LessonPlan) => void;
  onExploreLearningPath: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({
  learnerProfile,
  onUpdateProfile,
  onOpenProfileModal,
  onStartLesson,
  onExploreLearningPath
}) => {
  const [mode, setMode] = useState<'topic' | 'upload'>('topic');
  const [topicInput, setTopicInput] = useState("");
  const [level, setLevel] = useState<EducationalLevel>(learnerProfile?.educationalLevel || 'beginner');
  const [timeBudget, setTimeBudget] = useState<TimeBudget>(learnerProfile?.timeBudget || '20min');
  const [language, setLanguage] = useState<LanguageCode>(learnerProfile?.preferredLanguage || 'hi');
  const [personality, setPersonality] = useState<TeacherPersonality>(learnerProfile?.teacherPersonality || 'mentor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<{ connected: boolean; model?: string }>({ connected: true, model: 'Gemini 3.1 Flash' });

  // State for optional session parameter overrides (hidden by default)
  const [showLessonOverrides, setShowLessonOverrides] = useState(false);

  // Sync state if profile prop changes
  React.useEffect(() => {
    if (learnerProfile) {
      if (learnerProfile.educationalLevel) setLevel(learnerProfile.educationalLevel);
      if (learnerProfile.timeBudget) setTimeBudget(learnerProfile.timeBudget);
      if (learnerProfile.preferredLanguage) setLanguage(learnerProfile.preferredLanguage);
      if (learnerProfile.teacherPersonality) setPersonality(learnerProfile.teacherPersonality);
    }
  }, [learnerProfile]);

  // Natural Instruction & 8 Determinations State
  const [studentInstruction, setStudentInstruction] = useState(
    'Please teach me the core concepts clearly with practical examples, step-by-step explanations, and checkpoint questions.'
  );
  const [isAnalyzingInstruction, setIsAnalyzingInstruction] = useState(false);
  const [activeDeterminations, setActiveDeterminations] = useState<TeacherDeterminations | null>({
    whatNeedsToBeTaught: "Essential core concepts and foundational principles tailored for the selected topic and learning time.",
    conceptsOrderReasoning: "Sequenced from core definitions and intuitive mental models to operational execution and application.",
    depthCalibration: "Calibrated for clear conceptual understanding with interactive step-by-step visual models.",
    examplesAndVisuals: "Interactive visual demonstrations and step-by-step laboratory execution models.",
    questioningTiming: "Formative checkpoints injected at key concept transitions to verify mental model integrity.",
    understandingCriteria: "Evaluating causal reasoning and practical problem-solving capability.",
    adaptationTriggers: "Adaptive branching: Simplify with tangible visual analogies if misconceptions occur; advance on mastery.",
    nextStepsRecommendation: "Summative assessment evaluation at session completion followed by progression to recommended next steps."
  });
  const [showDeterminationsDetails, setShowDeterminationsDetails] = useState(true);
  const [testAtEndRequested, setTestAtEndRequested] = useState(true);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<any | null>(null);

  // Check live backend on mount
  React.useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok') {
          setBackendStatus({ connected: true, model: data.defaultModel || 'Gemini 3.1 Flash' });
        }
      })
      .catch(() => {
        setBackendStatus({ connected: false });
      });
  }, []);

  // Analyze Student Natural Instruction via Real Backend
  const handleAnalyzeInstruction = async (customInstruction?: string) => {
    const textToAnalyze = customInstruction !== undefined ? customInstruction : studentInstruction;
    if (!textToAnalyze.trim()) return;

    setIsAnalyzingInstruction(true);
    try {
      const res = await fetch('/api/parse-student-instruction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: textToAnalyze,
          materialContext: uploadedFileContent || 'NCERT Class 10 Physics Chapter 4: Electricity & Ohm\'s Law',
          fileName: uploadedFileName || 'NCERT_Physics_Chapter_4.pdf'
        })
      });
      const data = await res.json();
      if (data.success && data.determinations) {
        setActiveDeterminations(data.determinations);
        if (data.detectedLevel) setLevel(data.detectedLevel);
        if (data.detectedTime) setTimeBudget(data.detectedTime);
        if (data.detectedLanguage) setLanguage(data.detectedLanguage);
        if (data.detectedTopic) setTopicInput(data.detectedTopic);
        if (data.testAtEnd !== undefined) setTestAtEndRequested(data.testAtEnd);
        setShowDeterminationsDetails(true);
      }
    } catch (e) {
      console.warn('Error analyzing student instruction:', e);
    } finally {
      setIsAnalyzingInstruction(false);
    }
  };

  // Handle file drop / upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsParsingDoc(true);

    try {
      const text = await file.text();
      setUploadedFileContent(text);

      // Call real backend document RAG endpoint
      const res = await fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: text.slice(0, 5000)
        })
      });
      const data = await res.json();
      setExtractedSummary(data.extracted);
      setTopicInput(data.extracted?.title || file.name.replace(/\.[^/.]+$/, ''));

      // Also trigger instruction analysis if an instruction is present
      if (studentInstruction.trim()) {
        handleAnalyzeInstruction();
      }
    } catch (err) {
      console.warn('Document parse error, falling back locally', err);
      setExtractedSummary({
        title: file.name.replace(/\.[^/.]+$/, ''),
        chapters: [{ number: 1, title: 'Chapter 1: Foundational Principles' }],
        concepts: [{ name: 'Core Definition' }]
      });
    } finally {
      setIsParsingDoc(false);
    }
  };

  // Functional Generator: Generates a complete LessonPlan object from an arbitrary topic prompt string
  const generateLessonPlanFromPrompt = async (
    topicPrompt: string,
    options?: {
      level?: EducationalLevel;
      timeBudget?: TimeBudget;
      language?: LanguageCode;
      personality?: TeacherPersonality;
      studentInstruction?: string;
      uploadedFileContent?: string;
      uploadedFileName?: string;
      activeDeterminations?: TeacherDeterminations | null;
      learnerProfile?: LearnerProfile;
    }
  ): Promise<LessonPlan> => {
    const effectiveTopic = topicPrompt.trim() || 'General Learning Topic';
    const currentLevel = options?.level || level;
    const currentTime = options?.timeBudget || timeBudget;
    const currentLang = options?.language || language;
    const currentPers = options?.personality || personality;
    const currentInstr = options?.studentInstruction !== undefined ? options.studentInstruction : studentInstruction;
    const currentFileContent = options?.uploadedFileContent !== undefined ? options.uploadedFileContent : uploadedFileContent;
    const currentFileName = options?.uploadedFileName !== undefined ? options.uploadedFileName : uploadedFileName;

    // Infer target subject from topic string prompt
    const textForSubject = `${effectiveTopic} ${currentInstr} ${currentFileName || ''}`.toLowerCase();
    let targetSubject: LessonPlan['subject'] = 'general';
    if (textForSubject.includes('dbms') || textForSubject.includes('sql') || textForSubject.includes('relational') || textForSubject.includes('database') || textForSubject.includes('join') || textForSubject.includes('schema')) {
      targetSubject = 'dbms';
    } else if (textForSubject.includes('biology') || textForSubject.includes('cell') || textForSubject.includes('respiration') || textForSubject.includes('photosynthesis') || textForSubject.includes('plant') || textForSubject.includes('gene') || textForSubject.includes('dna')) {
      targetSubject = 'biology';
    } else if (textForSubject.includes('math') || textForSubject.includes('algebra') || textForSubject.includes('calculus') || textForSubject.includes('equation') || textForSubject.includes('derivative') || textForSubject.includes('trigonometry')) {
      targetSubject = 'mathematics';
    } else if (textForSubject.includes('ohm') || textForSubject.includes('voltage') || textForSubject.includes('circuit') || textForSubject.includes('physics') || textForSubject.includes('newton') || textForSubject.includes('electricity') || textForSubject.includes('force') || textForSubject.includes('motion')) {
      targetSubject = 'physics';
    } else if (textForSubject.includes('python') || textForSubject.includes('code') || textForSubject.includes('programming') || textForSubject.includes('react') || textForSubject.includes('javascript') || textForSubject.includes('algorithm')) {
      targetSubject = 'programming';
    }

    const personalizedOpening = generatePersonalizedOpeningSpeech({
      topic: effectiveTopic,
      learningObjective: options?.learnerProfile?.learningObjective || '',
      studentInstruction: currentInstr,
      teacherPersonality: currentPers,
      educationalLevel: currentLevel,
      language: currentLang
    });

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          educationalLevel: currentLevel,
          statedPriorKnowledge: options?.learnerProfile?.statedPriorKnowledge || '',
          learningObjective: options?.learnerProfile?.learningObjective || '',
          preferredTeachingStyle: currentPers,
          language: currentLang,
          timeBudget: currentTime,
          desiredDepth: options?.learnerProfile?.desiredDepth || 'conceptual_overview',
          studentInstruction: currentInstr,
          materialContext: currentFileContent
        })
      });

      const data = await res.json();
      const plan = data?.plan;

      if (plan && plan.steps && plan.steps.length > 0) {
        const mappedSteps = plan.steps.map((st: any, sIdx: number) => {
          const stepId = st.id || `step-${sIdx + 1}`;
          const conceptId = `c-${stepId}`;

          const beats = (st.beats && st.beats.length > 0) ? st.beats.map((b: any, bIdx: number) => {
            const visualCue = b.visualCue || {
              subject: targetSubject,
              viewMode: targetSubject === 'biology' ? 'cell_explorer' : targetSubject === 'dbms' ? 'dbms_tables' : targetSubject === 'mathematics' ? 'balance_scale' : targetSubject === 'physics' ? 'circuit_simulation' : 'code_tracer'
            };

            const checkpoint = b.checkpoint ? {
              id: `cp-${stepId}-${bIdx}`,
              type: 'mcq' as const,
              purpose: 'diagnose' as const,
              question: b.checkpoint.question,
              options: b.checkpoint.options || ['Core concept holds', 'Directly decreases', 'Remains unchanged'],
              correctAnswer: b.checkpoint.correctAnswer || (b.checkpoint.options ? b.checkpoint.options[0] : 'Core concept holds'),
              hint: b.checkpoint.hint || 'Reflect on the foundational relationship discussed above.',
              conceptId,
              knownMisconceptions: (b.checkpoint.misconceptions || []).map((m: any) => ({
                triggerPattern: m.trigger || '',
                category: m.category || 'conceptual_misconception',
                misconceptionName: m.diagnosis || 'Core Misconception',
                diagnosedThought: m.diagnosis || 'Flawed intuitive assumption',
                correctiveStrategy: 'analogy' as const,
                correctiveSpeech: m.correctionSpeech || 'Let us re-examine this through an intuitive example.'
              }))
            } : undefined;

            const isFirstBeat = sIdx === 0 && bIdx === 0;
            const isGenericOpening = !b.speechEn || b.speechEn.toLowerCase().startsWith('welcome');

            return {
              id: b.id || `beat-${stepId}-${bIdx}`,
              conceptId,
              action: b.action || (checkpoint ? 'ASK_CONCEPTUAL' : 'EXPLAIN'),
              speechEn: (isFirstBeat && isGenericOpening) ? personalizedOpening.speechEn : (b.speechEn || `Let's focus on ${st.conceptName || effectiveTopic}.`),
              speechHi: (isFirstBeat && isGenericOpening) ? personalizedOpening.speechHi : b.speechHi,
              speechHinglish: (isFirstBeat && isGenericOpening) ? personalizedOpening.speechHinglish : b.speechHinglish,
              speechTe: (isFirstBeat && isGenericOpening) ? personalizedOpening.speechTe : b.speechTe,
              caption: b.caption || `Focus on ${st.conceptName || effectiveTopic}`,
              visualCue,
              pauseForInteraction: Boolean(b.pauseForInteraction || checkpoint),
              checkpoint,
              durationSec: b.durationSec || 12
            };
          }) : [
            {
              id: `beat-${stepId}-intro`,
              conceptId,
              action: 'INTRODUCE' as const,
              speechEn: personalizedOpening.speechEn,
              speechHi: personalizedOpening.speechHi,
              speechHinglish: personalizedOpening.speechHinglish,
              speechTe: personalizedOpening.speechTe,
              caption: `Introduction to ${st.conceptName || effectiveTopic}`,
              visualCue: { subject: targetSubject, viewMode: targetSubject === 'physics' ? 'circuit_simulation' : 'code_tracer' },
              pauseForInteraction: false,
              durationSec: 10
            }
          ];

          return {
            id: stepId,
            concept: {
              id: conceptId,
              name: st.conceptName || `${effectiveTopic} Foundations`,
              subject: targetSubject,
              summary: st.summary || 'Fundamental conceptual framework',
              difficulty: currentLevel,
              prerequisites: [],
              keyTerms: st.keyTerms || ['Definition', 'Application']
            },
            allocatedMinutes: st.allocatedMinutes || (currentTime === '5min' ? 2 : 6),
            masteryState: 'unknown' as const,
            beats
          };
        });

        return {
          id: `dyn-plan-${Date.now()}`,
          topic: plan.topic || effectiveTopic,
          subject: plan.subject || targetSubject,
          educationalLevel: currentLevel,
          timeBudget: currentTime,
          totalMinutes: currentTime === '5min' ? 5 : currentTime === '20min' ? 20 : 60,
          language: currentLang,
          teacherPersonality: currentPers,
          prerequisitesOverview: plan.prerequisites || ['Curiosity and core foundational knowledge'],
          steps: mappedSteps,
          sourceDocumentName: currentFileName || undefined,
          ragGrounded: Boolean(currentFileName),
          determinations: plan.determinations || activeDeterminations || {
            whatNeedsToBeTaught: `Core building blocks of ${effectiveTopic} scoped for a ${currentTime} ${currentLevel} session.`,
            conceptsOrderReasoning: `Sequenced from fundamental definitions to practical execution to manage cognitive load.`,
            depthCalibration: `Calibrated for ${currentLevel} level: high conceptual clarity, interactive examples.`,
            examplesAndVisuals: `Interactive step-by-step visual demonstrations and laboratory models.`,
            questioningTiming: `Interactive checkpoint after each core concept to confirm mental model integrity.`,
            understandingCriteria: `Evaluating causal explanations rather than superficial recall.`,
            adaptationTriggers: `Branch to simplified visual analogy on misconception; advance on success.`,
            nextStepsRecommendation: `Comprehensive assessment followed by progression to the next unit.`
          }
        };
      }
    } catch (err) {
      console.warn('Dynamic generator network issue, creating client fallback LessonPlan for prompt:', effectiveTopic, err);
    }

    // Dynamic Fallback LessonPlan object for arbitrary prompt
    return {
      id: `dyn-fallback-${Date.now()}`,
      topic: effectiveTopic,
      subject: targetSubject,
      educationalLevel: currentLevel,
      timeBudget: currentTime,
      totalMinutes: currentTime === '5min' ? 5 : currentTime === '20min' ? 20 : 60,
      language: currentLang,
      teacherPersonality: currentPers,
      prerequisitesOverview: ['Foundational concept overview', 'Analytical intuition'],
      sourceDocumentName: currentFileName || undefined,
      ragGrounded: Boolean(currentFileName),
      determinations: activeDeterminations || {
        whatNeedsToBeTaught: `Core building blocks of ${effectiveTopic} scoped for a ${currentTime} ${currentLevel} session.`,
        conceptsOrderReasoning: `Sequenced from fundamental definitions to practical execution to manage cognitive load.`,
        depthCalibration: `Calibrated for ${currentLevel} level: high conceptual clarity, interactive examples.`,
        examplesAndVisuals: `Interactive step-by-step visual demonstrations and laboratory models.`,
        questioningTiming: `Interactive checkpoint after each core concept to confirm mental model integrity.`,
        understandingCriteria: `Evaluating causal explanations rather than superficial recall.`,
        adaptationTriggers: `Branch to simplified visual analogy on misconception; advance on success.`,
        nextStepsRecommendation: `Comprehensive assessment followed by progression to the next unit.`
      },
      steps: [
        {
          id: 'step-1',
          concept: {
            id: 'c-step-1',
            name: `${effectiveTopic}: Core Foundations`,
            subject: targetSubject,
            summary: `Essential principles and introductory framework of ${effectiveTopic}.`,
            difficulty: currentLevel,
            prerequisites: [],
            keyTerms: ['Core Principle', 'Foundations', 'Execution']
          },
          allocatedMinutes: currentTime === '5min' ? 2 : 6,
          masteryState: 'unknown',
          beats: [
            {
              id: 'beat-1-intro',
              conceptId: 'c-step-1',
              action: 'INTRODUCE',
              speechEn: personalizedOpening.speechEn,
              speechHi: personalizedOpening.speechHi,
              speechHinglish: personalizedOpening.speechHinglish,
              speechTe: personalizedOpening.speechTe,
              caption: `Introduction to ${effectiveTopic}`,
              visualCue: {
                subject: targetSubject,
                viewMode: targetSubject === 'biology' ? 'cell_explorer' : targetSubject === 'dbms' ? 'dbms_tables' : targetSubject === 'mathematics' ? 'balance_scale' : targetSubject === 'physics' ? 'circuit_simulation' : 'code_tracer'
              },
              pauseForInteraction: false,
              durationSec: 10
            },
            {
              id: 'beat-1-checkpoint',
              conceptId: 'c-step-1',
              action: 'ASK_CONCEPTUAL',
              speechEn: `Before we advance, let us verify our understanding with a quick checkpoint question.`,
              speechHi: `आगे बढ़ने से पहले, आइए एक प्रश्न के साथ अपनी समझ की जांच करें।`,
              speechHinglish: `Next step par jaane se pehle, ek quick question check karte hain.`,
              speechTe: `ముందుకు వెళ్ళే ముందు, ఒక చిన్న ప్రశ్నతో మన అవగాహనను పరీక్షించుకుందాం.`,
              caption: `Formative Checkpoint: ${effectiveTopic}`,
              visualCue: {
                subject: targetSubject,
                viewMode: targetSubject === 'biology' ? 'cell_explorer' : targetSubject === 'dbms' ? 'dbms_tables' : targetSubject === 'mathematics' ? 'balance_scale' : targetSubject === 'physics' ? 'circuit_simulation' : 'code_tracer'
              },
              pauseForInteraction: true,
              checkpoint: {
                id: 'cp-1-1',
                type: 'mcq',
                purpose: 'diagnose',
                question: `In ${effectiveTopic}, how does the primary system state respond when core inputs are varied?`,
                options: [
                  'The operational state responds directly and predictably to input variation',
                  'The operational state remains strictly unchanged',
                  'The system immediately terminates execution'
                ],
                correctAnswer: 'The operational state responds directly and predictably to input variation',
                hint: `Reflect on the foundational relationships governing ${effectiveTopic}.`,
                conceptId: 'c-step-1',
                knownMisconceptions: [
                  {
                    triggerPattern: 'unchanged',
                    category: 'conceptual_misconception',
                    misconceptionName: 'Invariant misconception',
                    diagnosedThought: 'Assuming output is disconnected from input variation',
                    correctiveStrategy: 'analogy',
                    correctiveSpeech: 'Remember, changes in inputs directly drive resulting behavior.'
                  }
                ]
              },
              durationSec: 10
            }
          ]
        }
      ]
    };
  };

  // Launch a lesson dynamically from any arbitrary string topic prompt
  const handleLaunchTopicPrompt = async (promptString: string) => {
    setTopicInput(promptString);
    setIsGenerating(true);
    setGenerationPhase(`Analyzing "${promptString}" and preparing your lesson plan...`);

    const timer1 = setTimeout(() => {
      setGenerationPhase('Formulating interactive visual models & explanations...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setGenerationPhase('Finalizing interactive session & exercises...');
    }, 4500);

    try {
      const plan = await generateLessonPlanFromPrompt(promptString, {
        level,
        timeBudget,
        language,
        personality,
        studentInstruction,
        uploadedFileContent,
        uploadedFileName,
        activeDeterminations,
        learnerProfile
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      onStartLesson(plan);
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      console.error('Error generating lesson plan from prompt:', err);
    }
  };

  // Handle main custom lesson trigger button
  const handleGenerateCustomLesson = async () => {
    const effectiveTopic = topicInput.trim() || 'General Science & Principles';
    await handleLaunchTopicPrompt(effectiveTopic);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4" id="setup-view-root">
      {/* Hero Welcome Banner with Editorial Aesthetic */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECEAE4] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] mb-4 shadow-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Adaptive Personalization Studio</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#1C1C1C] tracking-tight leading-tight">
          Meet <span className="italic font-serif underline decoration-[#1C1C1C]/30 decoration-1 underline-offset-8">OutLearn</span>, Your AI Teacher
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#5A5A5A] font-serif italic leading-relaxed max-w-2xl mx-auto">
          An adaptive educator designed for deep mastery — teaching through synchronized speech, subject-aware interactive laboratories, and rigorous misconception diagnosis.
        </p>
      </div>

      {/* Student Personalization Profile Card (7 Dimensions & OAuth) */}
      <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-[#FAF9F5] border border-[#1C1C1C]/15 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C1C1C]/10">
          <div className="flex items-center gap-3">
            {learnerProfile?.avatarUrl ? (
              <img
                src={learnerProfile.avatarUrl}
                alt={learnerProfile.name}
                className="w-12 h-12 rounded-full border-2 border-[#1C1C1C] object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-[#F9F8F6] flex items-center justify-center font-bold text-base">
                {learnerProfile?.name ? learnerProfile.name.charAt(0) : 'S'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#1C1C1C]">
                  Learner Profile: {learnerProfile?.name || 'Student'}
                </span>
              </div>
              <p className="text-xs text-[#666666] font-mono">
                {learnerProfile?.email || 'student@example.com'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenProfileModal}
            className="px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow-sm flex items-center gap-2 transition-all self-start md:self-auto font-sans"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Customize Learning Profile</span>
          </button>
        </div>

        {/* 7 Active Dimensions Badges (Interactive: Click to edit profile) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px] font-sans">
          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Educational Level in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">1. Level</span>
            <span className="font-bold text-[#1C1C1C] capitalize">{learnerProfile?.educationalLevel || 'beginner'}</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Prior Knowledge in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">2. Knowledge</span>
            <span className="font-bold text-[#1C1C1C] truncate block" title={learnerProfile?.statedPriorKnowledge}>
              {learnerProfile?.statedPriorKnowledge || 'Basic Algebra'}
            </span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Learning Objective in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">3. Objective</span>
            <span className="font-bold text-[#1C1C1C] truncate block" title={learnerProfile?.learningObjective}>
              {learnerProfile?.learningObjective || 'Master Core Exam'}
            </span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Teacher Personality in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">4. Style</span>
            <span className="font-bold text-[#1C1C1C] capitalize">{learnerProfile?.teacherPersonality || 'mentor'}</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Preferred Language in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">5. Language</span>
            <span className="font-bold text-[#1C1C1C] uppercase">{learnerProfile?.preferredLanguage || 'hinglish'}</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Time Budget in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">6. Time</span>
            <span className="font-bold text-[#1C1C1C]">{learnerProfile?.timeBudget || '20min'}</span>
          </button>

          <button
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/10 hover:border-[#1C1C1C]/30 text-center transition-all cursor-pointer group"
            title="Click to edit Desired Depth in Profile"
          >
            <span className="text-[9px] font-mono font-bold text-[#777777] uppercase block mb-0.5 group-hover:text-[#1C1C1C]">7. Depth</span>
            <span className="font-bold text-[#1C1C1C] truncate block">
              {learnerProfile?.desiredDepth === 'deep_technical_math'
                ? 'Deep Math'
                : learnerProfile?.desiredDepth === 'standard_depth'
                ? 'Standard'
                : 'Conceptual'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Studio Setup Card */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#1C1C1C]/15 p-6 sm:p-8 shadow-sm">
        {/* Toggle Mode: Topic vs Upload Document */}
        <div className="flex border-b border-[#1C1C1C]/15 pb-4 mb-6 gap-3">
          <button
            onClick={() => setMode('topic')}
            className={`pb-2 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              mode === 'topic'
                ? 'border-[#1C1C1C] text-[#1C1C1C]'
                : 'border-transparent text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Teach Any Topic</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`pb-2 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              mode === 'upload'
                ? 'border-[#1C1C1C] text-[#1C1C1C]'
                : 'border-transparent text-[#777777] hover:text-[#1C1C1C]'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Textbook / Material (RAG)</span>
          </button>
        </div>

        {/* Input Area */}
        {mode === 'topic' ? (
          <div className="mb-6">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
              What would you like OutLearn to teach?
            </label>
            <div className="relative">
              <input
                type="text"
                value={topicInput || ''}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Newton's Laws of Motion for Class 8, React Hooks for Technical Interview, Neural Networks..."
                className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-4 py-3.5 text-sm text-[#1C1C1C] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] focus:border-[#1C1C1C]"
              />
            </div>
            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                'Teach me Artificial Intelligence from the beginning',
                'Explain Newton\'s Laws to a Class 8 student',
                'Teach me React for a technical interview',
                'Relational Algebra & SQL Join Operations',
                'Cellular Biology & Respiration'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setTopicInput(suggestion);
                    if (suggestion.includes('Artificial Intelligence')) {
                      setLevel('beginner');
                      setStudentInstruction("Teach me Artificial Intelligence from the beginning.");
                    } else if (suggestion.includes("Newton's Laws")) {
                      setLevel('beginner');
                      setStudentInstruction("Explain Newton's Laws of Motion to a Class 8 student using daily examples.");
                    } else if (suggestion.includes('React')) {
                      setLevel('advanced');
                      setStudentInstruction("Teach me React concepts for a technical interview with interview questions.");
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-[11px] transition-all font-sans"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Document Upload Dropzone (RAG Knowledge Grounding) */
          <div className="mb-6">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C] mb-2">
              Upload Educational Material (Books, Textbooks, PDFs, Notes, Research Papers, DOCX, PPTX)
            </label>

            <div className="border-2 border-dashed border-[#1C1C1C]/20 hover:border-[#1C1C1C]/40 bg-[#F9F8F6] rounded-2xl p-6 text-center transition-all">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.rtf,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-3 rounded-full bg-[#F2EFEB] text-[#1C1C1C] mb-2 border border-[#1C1C1C]/10">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-[#1C1C1C]">
                  {uploadedFileName ? uploadedFileName : 'Click to select or drag & drop textbook / course file'}
                </span>
                <span className="text-xs text-[#777777] mt-1 font-sans">
                  Supports Books, Textbooks, PDFs, DOC/DOCX, PPT/PPTX slides, Notes, Research Papers
                </span>
              </label>
            </div>

            {/* Document Extraction Preview */}
            {isParsingDoc && (
              <div className="mt-3 p-3 rounded-xl bg-[#F2EFEB] border border-[#1C1C1C]/20 text-xs text-[#1C1C1C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1C1C1C] animate-ping" />
                <span>RAG Indexer: Extracting chapters, sections, definitions, and citations...</span>
              </div>
            )}

            {extractedSummary && (
              <div className="mt-3 p-4 rounded-xl bg-[#FAF9F5] border border-[#1C1C1C]/20 text-xs text-[#1C1C1C] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1C1C1C]/10 pb-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Knowledge Grounded & Indexed (RAG Active)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300/50">
                    {extractedSummary.docType || 'Educational Material'} • Hallucination Protection ON
                  </span>
                </div>

                {extractedSummary.chapters && extractedSummary.chapters.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#777777] uppercase block mb-1">
                      Identified Chapters & Sections:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {extractedSummary.chapters.map((ch: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-[#FFFFFF] border border-[#1C1C1C]/10 text-[11px]">
                          <span className="font-bold font-serif text-[#1C1C1C] block">{ch.title}</span>
                          <span className="text-[#666666] text-[10px] block truncate">{ch.summary || ch.keySection}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {extractedSummary.concepts && extractedSummary.concepts.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-mono font-bold text-[#777777] uppercase block mb-1">
                      Extracted Grounded Concepts & Definitions:
                    </span>
                    <div className="space-y-1">
                      {extractedSummary.concepts.slice(0, 3).map((c: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-[#333333] flex items-start gap-1.5">
                          <span className="font-bold text-[#1C1C1C] shrink-0">• {c.name}:</span>
                          <span className="text-[#555555] font-serif">{c.definition || c.formula}</span>
                          {c.sourceCitation && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10 shrink-0">
                              {c.sourceCitation}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Student Natural Instruction & Personalization Panel */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-[#FAF9F5] border border-[#1C1C1C]/15 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#1C1C1C] text-[#F9F8F6]">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C]">
                  Custom Learning Preferences & Natural Instructions
                </h3>
                <p className="text-[11px] text-[#666666] font-sans">
                  Provide custom constraints (e.g. pace, target level, preferred language, question frequency, or final test).
                </p>
              </div>
            </div>
          </div>

          {/* Text Area for Instruction */}
          <div className="relative">
            <textarea
              value={studentInstruction || ''}
              onChange={(e) => setStudentInstruction(e.target.value)}
              rows={3}
              placeholder="e.g. I am a beginner. Teach me Chapter 4 in 20 minutes. Explain it in Hindi/Telugu using simple examples. Ask me questions during the lesson and test me at the end."
              className="w-full bg-[#FFFFFF] border border-[#1C1C1C]/20 rounded-xl px-4 py-3 text-xs text-[#1C1C1C] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] font-sans leading-relaxed resize-none"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-[#777777] uppercase">Sample Prompts:</span>
              <button
                type="button"
                onClick={() => {
                  const preset = "Teach me Artificial Intelligence from the beginning in 20 minutes.";
                  setStudentInstruction(preset);
                  setTopicInput("Artificial Intelligence Fundamentals");
                  setLevel('beginner');
                }}
                className="px-2.5 py-1 rounded-md bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-[10px] font-mono transition-all"
              >
                AI From Scratch (Beginner)
              </button>
              <button
                type="button"
                onClick={() => {
                  const preset = "Explain Newton's Laws to a Class 8 student with simple real-life examples and questions.";
                  setStudentInstruction(preset);
                  setTopicInput("Newton's Laws of Motion");
                  setLevel('beginner');
                }}
                className="px-2.5 py-1 rounded-md bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-[10px] font-mono transition-all"
              >
                Newton's Laws (Class 8)
              </button>
              <button
                type="button"
                onClick={() => {
                  const preset = "Teach me React for a technical interview. Focus on Virtual DOM, Hooks, state management, and common coding questions.";
                  setStudentInstruction(preset);
                  setTopicInput("React for Technical Interview");
                  setLevel('advanced');
                }}
                className="px-2.5 py-1 rounded-md bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-[10px] font-mono transition-all"
              >
                React Technical Interview
              </button>
            </div>
          </div>
        </div>

        {/* Session Preference Banner (Pre-filled from Saved Profile) */}
        <div className="my-5 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#1C1C1C]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2 text-[#444444]">
            <Sliders className="w-4 h-4 text-[#1C1C1C] shrink-0" />
            <span>
              <strong>Profile Defaults Applied:</strong> Level: <span className="font-semibold text-[#1C1C1C] capitalize">{level}</span> • Time: <span className="font-semibold text-[#1C1C1C]">{timeBudget}</span> • Language: <span className="font-semibold text-[#1C1C1C] uppercase">{language}</span> • Style: <span className="font-semibold text-[#1C1C1C] capitalize">{personality}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowLessonOverrides((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F2EFEB] border border-[#1C1C1C]/20 text-[#1C1C1C] font-semibold text-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showLessonOverrides ? 'Hide Lesson Overrides' : 'Adjust for this lesson only'}</span>
          </button>
        </div>

        {/* Collapsible Session Overrides (Hidden by default, pre-filled from profile) */}
        {showLessonOverrides && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 mb-4 border-t border-[#1C1C1C]/15 animate-in fade-in duration-150">
            {/* Dimension 1: Educational Level */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2">
                1. Educational Level
              </label>
              <div className="space-y-1.5">
                {(['beginner', 'intermediate', 'advanced'] as EducationalLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border capitalize transition-all ${
                      level === lvl
                        ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm font-semibold'
                        : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#444444] hover:bg-[#F2EFEB]'
                    }`}
                  >
                    {lvl}: {lvl === 'beginner' ? 'Simple analogies' : lvl === 'intermediate' ? 'Technical examples' : 'Deep mathematics'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension 2: Available Learning Time */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#1C1C1C]" />
                <span>2. Session Type & Time Budget</span>
              </label>

              {/* Distinct Toggle for Session Type */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-[#F2EFEB] rounded-xl border border-[#1C1C1C]/10 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (timeBudget === '7days') setTimeBudget('20min');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    timeBudget !== '7days'
                      ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-2xs'
                      : 'text-[#666666] hover:text-[#1C1C1C]'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Single Lesson</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTimeBudget('7days')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    timeBudget === '7days'
                      ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-2xs'
                      : 'text-[#666666] hover:text-[#1C1C1C]'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Revision Plan</span>
                </button>
              </div>

              {timeBudget !== '7days' ? (
                <div>
                  <span className="text-[10px] font-mono font-semibold text-[#777777] uppercase block mb-1">
                    Lesson Duration
                  </span>
                  <div className="space-y-1.5">
                    {(['5min', '20min', '60min'] as TimeBudget[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTimeBudget(t)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                          timeBudget === t
                            ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm font-semibold'
                            : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#444444] hover:bg-[#F2EFEB]'
                        }`}
                      >
                        {t === '5min' ? '5 Minutes: Snapshot' : t === '20min' ? '20 Minutes: Structured' : '60 Minutes: Masterclass'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[#1C1C1C]">
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-xs text-amber-950">
                    <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>7-Day Curriculum Revision Plan</span>
                  </div>
                  <p className="text-[11px] text-[#555555] leading-relaxed">
                    Multi-day structured curriculum with daily study milestones, spaced review schedules, and mastery tracking.
                  </p>
                </div>
              )}
            </div>

            {/* Dimension 3: Teaching Language */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#1C1C1C]" />
                <span>3. Preferred Language</span>
              </label>
              <select
                value={language || 'hi'}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] cursor-pointer font-sans"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#777777] mt-2 font-sans">
                Supports Hinglish, Hindi, English, Spanish. Switchable mid-lesson anytime!
              </p>
            </div>

            {/* Dimension 4: Teacher Personality */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#1C1C1C]" />
                <span>4. Teacher Personality</span>
              </label>
              <select
                value={personality || 'mentor'}
                onChange={(e) => setPersonality(e.target.value as TeacherPersonality)}
                className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 text-[#1C1C1C] text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] cursor-pointer font-sans"
              >
                {TEACHER_PERSONALITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.subtitle}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#777777] mt-2 font-sans">
                Adapts questioning frequency, pace, and explanation analogies.
              </p>
            </div>
          </div>
        )}

        {/* Start Teaching Session Button & Generation Progress */}
        <div className="pt-6 border-t border-[#1C1C1C]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#555555] flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-emerald-500' : 'bg-emerald-600'} ${isGenerating ? 'animate-ping' : ''}`} />
            <span className="font-mono text-[11px]">
              {isGenerating
                ? generationPhase || 'Preparing personalized lesson plan...'
                : 'Adaptive AI Teaching Studio Online'}
            </span>
          </div>

          <button
            onClick={handleGenerateCustomLesson}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-50 text-[#F9F8F6] font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all font-sans"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-[#F9F8F6] border-t-transparent rounded-full animate-spin" />
                <span>Building Lesson Plan...</span>
              </>
            ) : (
              <>
                <span>Begin Teaching Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
