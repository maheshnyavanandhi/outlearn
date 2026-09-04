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
  X
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'setup' | 'teaching' | 'assessment' | 'report' | 'path'>('setup');
  const [activeLessonPlan, setActiveLessonPlan] = useState<LessonPlan>(PHYSICS_OHMS_LAW_PLAN);
  const [learningReport, setLearningReport] = useState<LearningReport | null>(null);
  const [isStreakPopoverOpen, setIsStreakPopoverOpen] = useState(false);

  // Persistent Learner Profile
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile>({
    id: 'student-demo-01',
    name: 'Mahesh N.',
    educationalLevel: 'beginner',
    statedPriorKnowledge: 'Basic algebra and physical models',
    learningObjective: 'Master Chapter 4 & Prepare for Assessments',
    preferredLanguage: 'hinglish',
    timeBudget: '20min',
    teacherPersonality: 'mentor',
    conceptMastery: {
      'c-voltage': 'understood',
      'c-current': 'developing'
    },
    recentMisconceptions: [],
    sessionsCompleted: 3,
    dailyStreak: 4
  });

  // Handler: Start a lesson from Setup
  const handleStartLesson = (plan: LessonPlan) => {
    setActiveLessonPlan(plan);
    setCurrentView('teaching');
  };

  // Handler: Finish lesson and take Assessment
  const handleFinishLesson = (plan: LessonPlan, profile: LearnerProfile) => {
    setActiveLessonPlan(plan);
    setLearnerProfile(profile);
    setCurrentView('assessment');
  };

  // Handler: Complete assessment and show Learning Report
  const handleCompleteAssessment = (report: LearningReport) => {
    setLearningReport(report);
    setLearnerProfile((prev) => ({
      ...prev,
      sessionsCompleted: prev.sessionsCompleted + 1,
      dailyStreak: (prev.dailyStreak ?? 4) + 1
    }));
    setCurrentView('report');
  };

  // Count mastered concepts
  const masteredConceptsCount = Object.values(learnerProfile.conceptMastery).filter(
    (s) => s === 'mastered' || s === 'understood'
  ).length;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1C1C] flex flex-col selection:bg-[#1C1C1C] selection:text-[#F9F8F6]" id="outlearn-app-root">
      {/* Top Application Navigation Bar - Editorial Masthead Style */}
      <header className="px-4 py-3.5 bg-[#F9F8F6]/95 backdrop-blur-md border-b border-[#1C1C1C]/15 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand & Logo */}
          <div
            onClick={() => setCurrentView('setup')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Signature Minimalist OutLearn Arc Mark in Editorial Carbon */}
            <div className="relative w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#1C1C1C] flex items-center justify-center overflow-hidden shadow-sm group-hover:bg-[#2C2C2C] transition-colors">
              <svg viewBox="0 0 32 32" className="w-5 h-5">
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
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-xl tracking-tight text-[#1C1C1C]">
                  OutLearn
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1C1C1C] text-[#F9F8F6] font-mono font-semibold tracking-widest uppercase">
                  AI TEACHER
                </span>
              </div>
              <p className="text-[10px] text-[#666666] font-serif italic hidden sm:block">
                AI Innovation Hackathon 2026 — Bharat Academix Edition
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
              Learning Path (ML)
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

            <button
              onClick={() => setCurrentView('path')}
              className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Network className="w-3.5 h-3.5 text-[#F9F8F6]" />
              <span className="hidden sm:inline">Roadmap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'setup' && (
          <SetupView
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
            onSelectPathStage={(stageTitle) => {
              setActiveLessonPlan({
                ...PHYSICS_OHMS_LAW_PLAN,
                topic: `Machine Learning: ${stageTitle}`,
                educationalLevel: 'intermediate',
                timeBudget: '20min',
                language: 'en'
              });
              setCurrentView('teaching');
            }}
            onBackToSetup={() => setCurrentView('setup')}
          />
        )}
      </main>

      {/* Subtle Editorial Colophon Footer */}
      <footer className="py-4 px-6 border-t border-[#1C1C1C]/10 bg-[#F2EFEB] text-center text-xs text-[#666666] font-serif">
        <span>OutLearn AI Teacher • AI Innovation Hackathon 2026 • Bharat Academix Pedagogical Edition</span>
      </footer>
    </div>
  );
}
