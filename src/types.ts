export type EducationalLevel = 'beginner' | 'intermediate' | 'advanced';

export type TimeBudget = '5min' | '20min' | '60min' | '7days';

export type LanguageCode = 'en' | 'hi' | 'hinglish' | 'es' | 'ta' | 'te';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  voiceLang: string;
  flag: string;
}

export type TeacherPersonality = 'mentor' | 'coach' | 'socratic' | 'technical';

export interface TeacherPersonalityConfig {
  id: TeacherPersonality;
  title: string;
  subtitle: string;
  avatarMood: string;
  description: string;
  avatarStyle: {
    skinTone: string;
    hairColor: string;
    shirtColor: string;
    accentColor: string;
    glasses?: boolean;
    tie?: boolean;
  };
}

export type SubjectType = 'physics' | 'mathematics' | 'dbms' | 'biology' | 'programming' | 'history' | 'general';

export type ConceptMasteryState = 'unknown' | 'introduced' | 'developing' | 'understood' | 'mastered' | 'needs_revision';

export type TeachingActionType =
  | 'INTRODUCE'
  | 'EXPLAIN'
  | 'GIVE_ANALOGY'
  | 'DEMONSTRATE'
  | 'SHOW_VISUAL'
  | 'GIVE_EXAMPLE'
  | 'GIVE_COUNTEREXAMPLE'
  | 'ASK_RECALL'
  | 'ASK_CONCEPTUAL'
  | 'ASK_APPLICATION'
  | 'ASK_TEACH_BACK'
  | 'PROVIDE_HINT'
  | 'CORRECT_MISCONCEPTION'
  | 'REEXPLAIN'
  | 'SIMPLIFY'
  | 'DEEPEN'
  | 'PRACTICE'
  | 'REVIEW_PREREQUISITE'
  | 'MOVE_FORWARD'
  | 'ASSESS';

export type MisconceptionCategory =
  | 'correct'
  | 'careless_mistake'
  | 'conceptual_misconception'
  | 'prerequisite_gap'
  | 'partial';

export interface MisconceptionPattern {
  triggerPattern: string; // e.g. "increases", "R increases -> I increases"
  category: MisconceptionCategory;
  misconceptionName: string;
  diagnosedThought: string;
  correctiveStrategy: 'analogy' | 'visual_counterexample' | 'formula_breakdown' | 'step_trace';
  correctiveSpeech: string;
  correctiveVisualState?: any;
}

export interface CheckpointQuestion {
  id: string;
  type: 'mcq' | 'conceptual' | 'application' | 'teach_back';
  purpose: 'diagnose' | 'expose_misconception' | 'gate_progression' | 'bridge';
  question: string;
  questionHindi?: string;
  questionHinglish?: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  conceptId: string;
  knownMisconceptions: MisconceptionPattern[];
}

export interface TeachingBeat {
  id: string;
  conceptId: string;
  action: TeachingActionType;
  speechEn: string;
  speechHi?: string;
  speechHinglish?: string;
  speechTe?: string;
  caption: string;
  visualCue: {
    subject: SubjectType;
    viewMode: string; // e.g. 'circuit_simulation', 'dbms_tables', 'step_reveal', etc.
    highlightTarget?: string;
    state?: any;
    annotation?: string;
  };
  pauseForInteraction?: boolean;
  checkpoint?: CheckpointQuestion;
  durationSec: number;
}

export interface Concept {
  id: string;
  name: string;
  subject: SubjectType;
  summary: string;
  difficulty: EducationalLevel;
  prerequisites: string[]; // IDs of required concepts
  keyFormulas?: string[];
  keyTerms?: string[];
  sourceReference?: string; // e.g. "Chapter 4, Section 4.2"
}

export interface LessonStep {
  id: string;
  concept: Concept;
  allocatedMinutes: number;
  beats: TeachingBeat[];
  masteryState: ConceptMasteryState;
}

export interface TeacherDeterminations {
  whatNeedsToBeTaught: string;                           // 1. What needs to be taught
  conceptsOrderReasoning?: string;                       // 2. Which concepts should be covered first
  conceptsCoveredFirst?: string[] | string;
  depthCalibration?: string;                             // 3. How deeply each concept should be explained
  depthOfExplanation?: string;
  examplesAndVisuals: string[] | string;                 // 4. Which examples or visuals should be used
  questioningTiming: string;                            // 5. When the student should be questioned
  understandingCriteria?: string;                        // 6. Whether the student has understood the concept
  understandingVerification?: string;
  adaptationTriggers?: string;                           // 7. Whether the lesson needs to be simplified or expanded
  simplificationOrExpansion?: string;
  nextStepsRecommendation?: string;                      // 8. What should be taught next
  whatShouldBeTaughtNext?: string;
  rawStudentInstruction?: string;
  testAtEnd?: boolean;
}

export interface LessonPlan {
  id: string;
  topic: string;
  subject: SubjectType;
  educationalLevel: EducationalLevel;
  timeBudget: TimeBudget;
  totalMinutes: number;
  language: LanguageCode;
  teacherPersonality: TeacherPersonality;
  prerequisitesOverview: string[];
  steps: LessonStep[];
  sourceDocumentName?: string;
  ragGrounded: boolean;
  determinations?: TeacherDeterminations;
}

export interface LearnerProfile {
  id: string;
  name: string;
  educationalLevel: EducationalLevel;
  statedPriorKnowledge: string;
  learningObjective: string;
  preferredLanguage: LanguageCode;
  timeBudget: TimeBudget;
  teacherPersonality: TeacherPersonality;
  conceptMastery: Record<string, ConceptMasteryState>;
  recentMisconceptions: {
    conceptId: string;
    misconception: string;
    timestamp: number;
  }[];
  sessionsCompleted: number;
  dailyStreak?: number;
}

export interface AssessmentItem {
  id: string;
  conceptId: string;
  conceptName: string;
  type: 'mcq' | 'conceptual' | 'calculation' | 'teach_back';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface AssessmentSubmission {
  itemId: string;
  studentAnswer: string;
  isCorrect: boolean;
  misconceptionCategory?: MisconceptionCategory;
  feedback: string;
}

export interface LearningReport {
  lessonId: string;
  topic: string;
  scorePercentage: number;
  timeSpentMinutes: number;
  strongConcepts: string[];
  needsImprovement: string[];
  identifiedMisconceptions: string[];
  actionableRecommendation: string;
  recommendedNextTopic: string;
  sevenDayStudyPlan: {
    day: number;
    title: string;
    focus: string;
    tasks: string[];
  }[];
  flashcards: {
    front: string;
    back: string;
    category: string;
  }[];
  summaryNotesMarkdown: string;
}

export interface TeachingActionLogEntry {
  id: string;
  timestamp: string;
  action: TeachingActionType;
  conceptName: string;
  reason: string;
  strategySwitched?: string;
}
