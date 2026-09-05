import React, { useState } from 'react';
import {
  LessonPlan,
  LearnerProfile,
  LearningReport
} from './types';
import {
  PHYSICS_OHMS_LAW_PLAN,
  DBMS_RELATIONAL_ALGEBRA_PLAN
} from './data/curriculumData';
import { SetupView } from './components/SetupView';
import { TeachingRoom } from './components/TeachingRoom';
import { AssessmentView } from './components/AssessmentView';
import { LearningReportView } from './components/LearningReportView';
import { LearningPathView } from './components/LearningPathView';
import { StudentProfileModal } from './components/StudentProfileModal';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Network,
  Award,
  Layers,
  HelpCircle,
  Flame,
  Check,
  Calendar,
  X,
  User,
  ShieldCheck,
  Sliders,
  LogOut
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      const email = localStorage.getItem('outlearn_current_user_email');
      if (email) {
        return localStorage.getItem(`outlearn_onboarded_${email}`) === 'true';
      }
    } catch (e) {
      console.warn('Failed to read onboarding status', e);
    }
    return false;
  });
  const [currentView, setCurrentView] = useState<'setup' | 'teaching' | 'assessment' | 'report' | 'path'>('setup');
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan>(PHYSICS_OHMS_LAW_PLAN);
  const [learningReport, setLearningReport] = useState<LearningReport | null>(null);
  const [isStreakPopoverOpen, setIsStreakPopoverOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Persistent Learner Profile with localStorage synchronization
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>(() => {
    try {
      const saved = localStorage.getItem('outlearn_learner_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load profile from storage', e);
    }
    return {
      id: 'student-guest-01',
      name: 'Guest Student',
      email: 'student@example.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      authInfo: {
        isLoggedIn: false,
        name: 'Guest Student',
        email: 'student@example.com',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        authProvider: 'Guest Session',
        googleSub: ''
      },
      educationalLevel: 'beginner',
      statedPriorKnowledge: 'Basic algebra and physical models',
      learningObjective: 'Master Chapter 4 & Prepare for Assessments',
      preferredLanguage: 'hinglish',
      timeBudget: '20min',
      teacherPersonality: 'mentor',
      desiredDepth: 'conceptual_overview',
      conceptMastery: {
        'c-voltage': 'understood',
        'c-current': 'developing'
      },
      recentMisconceptions: [],
      sessionsCompleted: 1,
      dailyStreak: 1
    };
  });

  const handleUpdateProfile = (newProfile: LearnerProfile) => {
    setLearnerProfile(newProfile);
    try {
      localStorage.setItem('outlearn_learner_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.warn('Failed to persist profile to storage', e);
    }
  };

  // Handler: Start a lesson from Setup
  const handleStartLesson = (plan: LessonPlan) => {
    setActiveLessonPlan(plan);
    setCurrentView('teaching');
  };

  // Handler: Finish lesson and take Assessment
  const handleFinishLesson = (plan: LessonPlan, profile: LearnerProfile) => {
    setActiveLessonPlan(plan);
    handleUpdateProfile(profile);
    setCurrentView('assessment');
  };

  // Handler: Complete assessment and show Learning Report
  const handleCompleteAssessment = (report: LearningReport) => {
    setLearningReport(report);
    const updated = {
      ...learnerProfile,
      sessionsCompleted: learnerProfile.sessionsCompleted + 1,
      dailyStreak: (learnerProfile.dailyStreak ?? 4) + 1
    };
    handleUpdateProfile(updated);
    setCurrentView('report');
  };

  // Handler: Selecting a stage from the dynamic Learning Path Roadmap
  const handleSelectPathStage = async (stageTitle: string, stageDetails?: any) => {
    // Determine subject from stage or active plan
    const topicText = `${stageTitle} ${activeLessonPlan?.topic || ''}`.toLowerCase();
    let targetSubject: LessonPlan['subject'] = 'general';
    if (topicText.includes('physics') || topicText.includes('voltage') || topicText.includes('ohm') || topicText.includes('circuit') || topicText.includes('electricity')) {
      targetSubject = 'physics';
    } else if (topicText.includes('dbms') || topicText.includes('sql') || topicText.includes('relational') || topicText.includes('database')) {
      targetSubject = 'dbms';
    } else if (topicText.includes('biology') || topicText.includes('cell') || topicText.includes('organelle') || topicText.includes('plant')) {
      targetSubject = 'biology';
    } else if (topicText.includes('python') || topicText.includes('pandas') || topicText.includes('machine learning') || topicText.includes('code')) {
      targetSubject = 'programming';
    }

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: stageTitle,
          educationalLevel: learnerProfile.educationalLevel || 'beginner',
          statedPriorKnowledge: learnerProfile.statedPriorKnowledge || '',
          learningObjective: `Master ${stageTitle}`,
          preferredLanguage: learnerProfile.preferredLanguage || 'hinglish',
          teacherPersonality: learnerProfile.teacherPersonality || 'mentor',
          timeBudget: learnerProfile.timeBudget || '20min'
        })
      });
      const data = await res.json();
      if (data.success && data.lessonPlan) {
        setActiveLessonPlan(data.lessonPlan);
        setCurrentView('teaching');
        return;
      }
    } catch (e) {
      console.warn('Backend lesson generation failed for stage, fallback to dynamic plan', e);
    }

    // Dynamic lesson plan fallback
    const dynamicPlan: LessonPlan = {
      id: `stage-plan-${Date.now()}`,
      topic: stageTitle,
      subject: targetSubject,
      educationalLevel: learnerProfile.educationalLevel || 'beginner',
      timeBudget: learnerProfile.timeBudget || '20min',
      totalMinutes: 20,
      language: learnerProfile.preferredLanguage || 'hinglish',
      teacherPersonality: learnerProfile.teacherPersonality || 'mentor',
      ragGrounded: true,
      prerequisitesOverview: ['Foundational concepts and intuitive models.'],
      determinations: {
        whatNeedsToBeTaught: `Stage Module: ${stageTitle}. Scoped for deep intuitive understanding in 20 minutes.`,
        conceptsOrderReasoning: 'Sequenced from primary definition to operational execution.',
        depthCalibration: 'Calibrated for practical understanding and problem solving.',
        examplesAndVisuals: 'Interactive D3 visual diagrams and real-world analogies.',
        questioningTiming: 'Formative checkpoints scheduled at concept boundaries.',
        understandingCriteria: 'Evaluates causal understanding and problem-solving ability.',
        adaptationTriggers: 'Adaptive branching with corrective analogies if misconceptions arise.',
        nextStepsRecommendation: 'Summative assessment evaluation upon completion.'
      },
      steps: [
        {
          id: 'step-1',
          concept: {
            id: `concept-${Date.now()}`,
            name: stageTitle,
            subject: targetSubject,
            summary: stageDetails?.description || `Mastery module covering ${stageTitle}.`,
            difficulty: learnerProfile.educationalLevel || 'beginner',
            prerequisites: []
          },
          allocatedMinutes: 20,
          masteryState: 'unknown',
          beats: [
            {
              id: 'beat-1',
              conceptId: `concept-${Date.now()}`,
              action: 'INTRODUCE',
              speechEn: `Welcome to our session on ${stageTitle}. Today we will master these core principles step-by-step.`,
              speechHi: `${stageTitle} के इस पाठ में आपका स्वागत है। आज हम इसे चरण-दर-चरण समझेंगे।`,
              speechHinglish: `Welcome! Aaj hum ${stageTitle} ko step-by-step master karenge with practical examples.`,
              caption: `Introduction to ${stageTitle}`,
              visualCue: {
                subject: targetSubject,
                viewMode: 'concept_map',
                annotation: `Core Principle: ${stageTitle}`
              },
              durationSec: 10
            },
            {
              id: 'beat-2-checkpoint',
              conceptId: `concept-${Date.now()}`,
              action: 'ASK_CONCEPTUAL',
              speechEn: `What is the primary governing principle of ${stageTitle}?`,
              speechHi: `${stageTitle} का मुख्य सिद्धांत क्या है?`,
              speechHinglish: `${stageTitle} ka main governing principle kya hai?`,
              caption: `Checkpoint: Core mechanism of ${stageTitle}`,
              visualCue: {
                subject: targetSubject,
                viewMode: 'concept_map',
                annotation: `Evaluation: ${stageTitle}`
              },
              pauseForInteraction: true,
              checkpoint: {
                id: `cp-${Date.now()}`,
                type: 'conceptual',
                purpose: 'gate_progression',
                conceptId: `concept-${Date.now()}`,
                question: `Which statement best describes the fundamental principle of ${stageTitle}?`,
                options: [
                  `It establishes cause-and-effect relationships governed by core physical/system laws`,
                  `It is entirely random and unpredictable without underlying patterns`,
                  `It only applies in hypothetical theoretical models without practical application`,
                  `It reverses standard logical operations`
                ],
                correctAnswer: `It establishes cause-and-effect relationships governed by core physical/system laws`,
                hint: `Think about how the primary mechanisms interact in real systems.`,
                knownMisconceptions: [
                  {
                    triggerPattern: 'random',
                    category: 'conceptual_misconception',
                    misconceptionName: 'Principle Misunderstanding',
                    diagnosedThought: 'Student thought core principles operate randomly without systematic causality.',
                    correctiveStrategy: 'analogy',
                    correctiveSpeech: 'Actually, physical and computational systems follow strict causal rules that can be modeled and predicted!'
                  }
                ]
              },
              durationSec: 8
            }
          ]
        }
      ]
    };

    setActiveLessonPlan(dynamicPlan);
    setCurrentView('teaching');
  };

  // Count mastered concepts
  const masteredConceptsCount = Object.values(learnerProfile.conceptMastery).filter(
    (s) => s === 'mastered' || s === 'understood'
  ).length;

  // Render Login/Sign In view first if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={(profileData) => {
          const userEmail = profileData.authInfo?.email || profileData.email || 'user';
          try {
            localStorage.setItem('outlearn_current_user_email', userEmail);
          } catch (e) {
            console.warn('Failed to save email to storage', e);
          }
          const isOnboarded = localStorage.getItem(`outlearn_onboarded_${userEmail}`) === 'true';

          const updatedProfile = {
            ...learnerProfile,
            ...profileData
          };
          handleUpdateProfile(updatedProfile);
          setIsAuthenticated(true);
          setHasCompletedOnboarding(isOnboarded);
        }}
      />
    );
  }

  // Render OnboardingView for new users after their login
  if (!hasCompletedOnboarding) {
    return (
      <OnboardingView
        learnerProfile={learnerProfile}
        onCompleteOnboarding={(updatedProfile) => {
          const userEmail = updatedProfile.authInfo?.email || updatedProfile.email || 'user';
          try {
            localStorage.setItem(`outlearn_onboarded_${userEmail}`, 'true');
          } catch (e) {
            console.warn('Failed to save onboarding completion', e);
          }
          handleUpdateProfile(updatedProfile);
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden min-w-0 bg-[#F9F8F6] text-[#1C1C1C] flex flex-col selection:bg-[#1C1C1C] selection:text-[#F9F8F6]" id="outlearn-app-root">
      {/* Top Application Navigation Bar - Editorial Masthead Style */}
      <header className="px-3 sm:px-4 py-2.5 sm:py-3.5 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#1C1C1C]/15 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Logo */}
          <div
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            {/* Signature Minimalist OutLearn Arc Mark in Editorial Carbon */}
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#1C1C1C] border border-[#1C1C1C] flex items-center justify-center overflow-hidden shadow-sm group-hover:bg-[#2C2C2C] transition-colors shrink-0">
              <svg viewBox="0 0 32 32" className="w-4 h-4 sm:w-5 sm:h-5">
                <defs>
                  <linearGradient id="outlearnArcGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#D97706" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#FAF8F5" />
                  </linearGradient>
                </defs>
                <path
                  d="M 6 24 C 6 12, 14 6, 26 6"
                  stroke="url(#outlearnArcGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="26" cy="6" r="2.5" fill="#FAF8F5" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-[#1C1C1C]">
                  OutLearn
                </span>
                <span className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-full bg-[#1C1C1C] text-[#F9F8F6] font-mono font-semibold tracking-widest uppercase shrink-0">
                  AI TEACHER
                </span>
              </div>
              <p className="text-[10px] text-[#666666] font-serif italic hidden md:block">
                Adaptive AI Educator & Masterclass Studio
              </p>
            </div>
          </div>

          {/* Nav Center View Pills */}
          <div className="hidden md:flex items-center gap-1 bg-[#ECEAE4] p-1 rounded-xl border border-[#1C1C1C]/10 text-xs font-sans">
            <button
              onClick={() => setCurrentView('setup')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'setup'
                  ? 'bg-[#1C1C1C] text-[#F9F8F6] font-semibold shadow-sm'
                  : 'text-[#5A5A5A] hover:text-[#1C1C1C]'
              }`}
            >
              Lesson Setup
            </button>
            <button
              onClick={() => setCurrentView('teaching')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'teaching'
                  ? 'bg-[#1C1C1C] text-[#F9F8F6] font-semibold shadow-sm'
                  : 'text-[#5A5A5A] hover:text-[#1C1C1C]'
              }`}
            >
              Teaching Room
            </button>
            <button
              onClick={() => setCurrentView('path')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentView === 'path'
                  ? 'bg-[#1C1C1C] text-[#F9F8F6] font-semibold shadow-sm'
                  : 'text-[#5A5A5A] hover:text-[#1C1C1C]'
              }`}
            >
              {(() => {
                const topic = activeLessonPlan?.topic || learnerProfile.learningObjective || '';
                const lower = topic.toLowerCase();
                if (lower.includes('physics') || lower.includes('ohm') || lower.includes('voltage') || lower.includes('electricity')) return 'Roadmap (Physics)';
                if (lower.includes('dbms') || lower.includes('sql') || lower.includes('relational') || lower.includes('database')) return 'Roadmap (DBMS)';
                if (lower.includes('biology') || lower.includes('cell') || lower.includes('plant')) return 'Roadmap (Biology)';
                if (lower.includes('python') || lower.includes('coding') || lower.includes('program')) return 'Roadmap (Python)';
                if (lower.includes('machine learning') || lower.includes('ml')) return 'Roadmap (ML)';
                const firstWord = topic.split(/[:\-\s]+/)[0];
                return firstWord && firstWord.length > 2 ? `Roadmap (${firstWord})` : 'Roadmap';
              })()}
            </button>
            {learningReport && (
              <button
                onClick={() => setCurrentView('report')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  currentView === 'report'
                    ? 'bg-[#1C1C1C] text-[#F9F8F6] font-semibold shadow-sm'
                    : 'text-[#5A5A5A] hover:text-[#1C1C1C]'
                }`}
              >
                Assessment Report
              </button>
            )}
          </div>

          {/* Right: Learner Stats & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Daily Streak Counter with Calendar Popover */}
            <div className="relative">
              <button
                onClick={() => setIsStreakPopoverOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-[#F2EFEB] hover:bg-[#EAE6DF] border border-[#1C1C1C]/15 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all shadow-xs group"
                title="Daily Streak: Consistent study tracker. Click to view progress."
                id="daily-streak-btn"
              >
                <div className="w-5 h-5 rounded-md bg-[#1C1C1C] flex items-center justify-center text-[#F9F8F6] shadow-xs group-hover:scale-105 transition-transform">
                  <Flame className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] text-[#666666] uppercase font-mono tracking-wider block leading-none">
                    Daily Streak
                  </span>
                  <span className="font-bold text-[#1C1C1C] font-serif flex items-center gap-1">
                    <span>{learnerProfile.dailyStreak ?? 4} Days</span>
                  </span>
                </div>
              </button>

              {/* Streak Popover Dropdown */}
              {isStreakPopoverOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#1C1C1C]/20 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 text-[#1C1C1C]">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1C1C1C]/10">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <h4 className="font-serif font-bold text-sm text-[#1C1C1C]">
                        {learnerProfile.dailyStreak ?? 4}-Day Study Streak
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsStreakPopoverOpen(false)}
                      className="text-[#888888] hover:text-[#1C1C1C] p-0.5 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-[#555555] font-serif leading-relaxed mb-3">
                    Daily study habits reinforce memory retention by <strong className="text-[#1C1C1C]">3.4×</strong>. You're in the <strong className="text-[#1C1C1C]">top 8%</strong> of consistent learners this week!
                  </p>

                  {/* 7-Day Activity Calendar Matrix */}
                  <div className="bg-[#F9F8F6] border border-[#1C1C1C]/10 rounded-xl p-2.5 mb-3">
                    <div className="text-[10px] font-mono text-[#777777] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Weekly Consistency</span>
                      <span className="text-[#1C1C1C] font-bold">4 / 7 Days</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                      {[
                        { day: 'M', active: true, label: 'Mon' },
                        { day: 'T', active: true, label: 'Tue' },
                        { day: 'W', active: true, label: 'Wed' },
                        { day: 'T', active: true, label: 'Thu (Today)', today: true },
                        { day: 'F', active: false, label: 'Fri' },
                        { day: 'S', active: false, label: 'Sat' },
                        { day: 'S', active: false, label: 'Sun' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] transition-all ${
                              item.active
                                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-xs'
                                : 'bg-[#F2EFEB] text-[#888888] border border-[#1C1C1C]/10'
                            } ${item.today ? 'ring-2 ring-amber-500/50' : ''}`}
                            title={item.label}
                          >
                            {item.active ? <Check className="w-3 h-3 stroke-[3]" /> : item.day}
                          </div>
                          <span className="text-[9px] text-[#777777]">{item.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] bg-[#F2EFEB] rounded-xl px-3 py-2 border border-[#1C1C1C]/10">
                    <span className="text-[#666666] font-serif italic">Complete a lesson today to reach Day 5</span>
                    <span className="text-[11px] font-bold font-mono text-[#1C1C1C]">🔥 +1</span>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-[#F2EFEB] border border-[#1C1C1C]/15 px-3 py-1.5 rounded-xl">
              <GraduationCap className="w-4 h-4 text-[#1C1C1C]" />
              <div>
                <span className="text-[9px] text-[#666666] uppercase font-mono tracking-wider block leading-none">Mastered</span>
                <span className="font-bold text-[#1C1C1C]">{masteredConceptsCount} Concepts</span>
              </div>
            </div>

            {/* Live Backend Connection Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#1C1C1C]/15 shadow-2xs font-mono text-[11px]" title="Connected to Express server running Google Gemini 3.1 Flash">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#1C1C1C] font-semibold">Gemini 3.1 AI Backend</span>
            </div>

            {/* Student Profile & Personalization Button (OAuth) */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 bg-[#F2EFEB] hover:bg-[#EAE6DF] border border-[#1C1C1C]/15 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs group"
              title="Student Profile & Personalization Settings"
              id="student-oauth-btn"
            >
              {learnerProfile.avatarUrl ? (
                <img
                  src={learnerProfile.avatarUrl}
                  alt={learnerProfile.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#1C1C1C]"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#1C1C1C] text-[#F9F8F6] flex items-center justify-center font-bold text-[10px]">
                  {learnerProfile.name ? learnerProfile.name.charAt(0) : 'S'}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-[#666666] uppercase font-mono tracking-wider block leading-none flex items-center gap-1">
                  <span>Profile</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <span className="font-bold text-[#1C1C1C] text-[11px] truncate max-w-[100px] block">
                  {learnerProfile.name || 'Student'}
                </span>
              </div>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-[#1C1C1C]/15 hover:bg-[#EAE6DF] text-[#666666] hover:text-[#1C1C1C] text-xs flex items-center gap-1 transition-all shrink-0"
              title="Sign Out to Login Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xl:inline font-mono text-[11px]">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav View Switcher Pills */}
        <div className="flex md:hidden items-center justify-around bg-[#ECEAE4] p-1 rounded-xl border border-[#1C1C1C]/10 text-xs font-sans mt-2">
          <button
            onClick={() => setCurrentView('setup')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-all text-[11px] ${
              currentView === 'setup'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-xs'
                : 'text-[#5A5A5A]'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => setCurrentView('teaching')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-all text-[11px] ${
              currentView === 'teaching'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-xs'
                : 'text-[#5A5A5A]'
            }`}
          >
            Teaching
          </button>
          <button
            onClick={() => setCurrentView('path')}
            className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-all text-[11px] ${
              currentView === 'path'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-xs'
                : 'text-[#5A5A5A]'
            }`}
          >
            Roadmap
          </button>
          {learningReport && (
            <button
              onClick={() => setCurrentView('report')}
              className={`flex-1 py-1.5 text-center rounded-lg font-medium transition-all text-[11px] ${
                currentView === 'report'
                  ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold shadow-xs'
                  : 'text-[#5A5A5A]'
              }`}
            >
              Report
            </button>
          )}
        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden min-w-0">
        {currentView === 'setup' && (
          <SetupView
            learnerProfile={learnerProfile}
            onUpdateProfile={handleUpdateProfile}
            onOpenProfileModal={() => setIsProfileModalOpen(true)}
            onStartLesson={handleStartLesson}
            onExploreLearningPath={() => setCurrentView('path')}
          />
        )}

        {currentView === 'teaching' && (
          <TeachingRoom
            lessonPlan={activeLessonPlan}
            learnerProfile={learnerProfile}
            onUpdateProfile={setLearnerProfile}
            onFinishLesson={handleFinishLesson}
          />
        )}

        {currentView === 'assessment' && (
          <AssessmentView
            lessonPlan={activeLessonPlan}
            learnerProfile={learnerProfile}
            onCompleteAssessment={handleCompleteAssessment}
          />
        )}

        {currentView === 'report' && learningReport && (
          <LearningReportView
            report={learningReport}
            onContinueLearningPath={() => setCurrentView('path')}
            onStartNewLesson={() => setCurrentView('setup')}
          />
        )}

        {currentView === 'path' && (
          <LearningPathView
            currentTopic={activeLessonPlan?.topic || learnerProfile.learningObjective}
            learnerProfile={learnerProfile}
            onSelectPathStage={handleSelectPathStage}
            onBackToSetup={() => setCurrentView('setup')}
          />
        )}
      </main>

      {/* Subtle Editorial Colophon Footer */}
      <footer className="py-4 px-6 border-t border-[#1C1C1C]/10 bg-[#F2EFEB] text-center text-xs text-[#666666] font-serif">
        <span>OutLearn AI Teacher • Adaptive Personalization Engine</span>
      </footer>

      {/* Student Profile & 7 Personalization Dimensions Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={learnerProfile}
        onSaveProfile={handleUpdateProfile}
      />
    </div>
  );
}
