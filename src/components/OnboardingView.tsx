import React, { useState } from 'react';
import {
  LearnerProfile,
  EducationalLevel,
  TeacherPersonality,
  LanguageCode,
  TimeBudget,
  DesiredDepth
} from '../types';
import {
  SUPPORTED_LANGUAGES,
  TEACHER_PERSONALITIES
} from '../data/curriculumData';
import { TeacherAvatar } from './TeacherAvatar';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Sliders,
  Check,
  ArrowRight,
  User,
  Brain,
  Clock,
  Globe,
  Compass,
  Zap
} from 'lucide-react';

interface OnboardingViewProps {
  learnerProfile: LearnerProfile;
  onCompleteOnboarding: (updatedProfile: LearnerProfile) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  learnerProfile,
  onCompleteOnboarding
}) => {
  const [level, setLevel] = useState<EducationalLevel>(learnerProfile.educationalLevel || 'beginner');
  const [personality, setPersonality] = useState<TeacherPersonality>(learnerProfile.teacherPersonality || 'mentor');
  const [language, setLanguage] = useState<LanguageCode>(learnerProfile.preferredLanguage || 'hinglish');
  const [timeBudget, setTimeBudget] = useState<TimeBudget>(learnerProfile.timeBudget || '20min');
  const [depth, setDepth] = useState<DesiredDepth>(learnerProfile.desiredDepth || 'conceptual_overview');
  const [priorKnowledge, setPriorKnowledge] = useState<string>(learnerProfile.statedPriorKnowledge || '');
  const [objective, setObjective] = useState<string>(learnerProfile.learningObjective || '');

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LearnerProfile = {
      ...learnerProfile,
      educationalLevel: level,
      teacherPersonality: personality,
      preferredLanguage: language,
      timeBudget,
      desiredDepth: depth,
      statedPriorKnowledge: priorKnowledge.trim() || 'General high school & basic concepts',
      learningObjective: objective.trim() || 'Master core subject principles and solve interactive checkpoints'
    };
    onCompleteOnboarding(updated);
  };

  const studentName = learnerProfile.authInfo?.name || learnerProfile.name || 'Learner';

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1C1C1C] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#1C1C1C] selection:text-[#F9F8F6]">
      {/* Background Subtle Gradient Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-transparent to-transparent"></div>

      <div className="w-full max-w-3xl relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C1C1C]/5 border border-[#1C1C1C]/15 mb-3 text-xs font-mono font-bold tracking-wide uppercase text-[#1C1C1C]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Welcome to OutLearn AI</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#1C1C1C] tracking-tight">
            Welcome, {studentName}!
          </h1>
          <p className="text-sm text-[#666666] max-w-md mx-auto mt-2 leading-relaxed font-sans">
            Let's configure your AI teacher personalization. OutLearn tailors explanations, audio tone, visual models, and checkpoint questions to your preferences.
          </p>
        </div>

        {/* Main Card */}
        <form onSubmit={handleFinish} className="bg-[#FFFFFF] border border-[#1C1C1C]/15 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
          
          {/* Section 1: Educational Level & Depth */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1C1C1C]/10 pb-2">
              <GraduationCap className="w-4 h-4 text-[#1C1C1C]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C]">
                1. Educational Level & Desired Depth
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'beginner' as EducationalLevel,
                  title: 'Beginner',
                  desc: 'Simple analogies, intuitive definitions, core mental models'
                },
                {
                  id: 'intermediate' as EducationalLevel,
                  title: 'Intermediate',
                  desc: 'Standard technical terms, operational examples, step-by-step logic'
                },
                {
                  id: 'advanced' as EducationalLevel,
                  title: 'Advanced',
                  desc: 'Mathematical formulas, deep proofs, implementation details'
                }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLevel(item.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    level === item.id
                      ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-md'
                      : 'bg-[#FAF9F5] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]'
                  }`}
                >
                  <div className="font-bold text-sm font-serif mb-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {level === item.id && <Check className="w-4 h-4 text-amber-400" />}
                  </div>
                  <p className={`text-xs leading-relaxed ${level === item.id ? 'text-[#D0D0D0]' : 'text-[#666666]'}`}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  id: 'conceptual_overview' as DesiredDepth,
                  title: 'Conceptual Overview',
                  desc: 'Focus on intuition & analogies'
                },
                {
                  id: 'standard_depth' as DesiredDepth,
                  title: 'Standard Operational',
                  desc: 'Balanced theory & practical examples'
                },
                {
                  id: 'deep_technical_math' as DesiredDepth,
                  title: 'Deep Technical',
                  desc: 'Formulas, derivations & edge cases'
                }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDepth(item.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    depth === item.id
                      ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6]'
                      : 'bg-[#FFFFFF] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1 flex items-center justify-between">
                    <span>{item.title}</span>
                    {depth === item.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className={`text-[11px] ${depth === item.id ? 'text-[#CCCCCC]' : 'text-[#666666]'}`}>
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Preferred Teaching Style */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1C1C1C]/10 pb-2">
              <Brain className="w-4 h-4 text-[#1C1C1C]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C]">
                2. AI Teacher Persona & Style
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEACHER_PERSONALITIES.map((p) => (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPersonality(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setPersonality(p.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    personality === p.id
                      ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-md'
                      : 'bg-[#FAF9F5] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#1C1C1C]/20 shrink-0 bg-[#F2EFEB] flex items-center justify-center">
                    <TeacherAvatar personality={p.id} isSpeaking={false} size="sm" />
                  </div>
                  <div>
                    <div className="font-bold text-sm font-serif flex items-center justify-between">
                      <span>{p.title}</span>
                      {personality === p.id && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className={`text-[11px] font-mono mt-0.5 ${
                      personality === p.id ? 'text-amber-300' : 'text-[#888888]'
                    }`}>
                      {p.subtitle}
                    </div>
                    <p className={`text-xs mt-1.5 leading-relaxed ${
                      personality === p.id ? 'text-[#D0D0D0]' : 'text-[#666666]'
                    }`}>
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Language & Time Budget */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1C1C1C]/10 pb-2">
              <Globe className="w-4 h-4 text-[#1C1C1C]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C]">
                3. Language & Session Pace
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#666666] block mb-1.5">
                  Preferred Delivery Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="w-full bg-[#FAF9F5] border border-[#1C1C1C]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1C1C1C] font-medium focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#666666] block mb-1.5">
                  Standard Session Budget
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '5min' as TimeBudget, label: '5 Min', desc: 'Quick' },
                    { id: '20min' as TimeBudget, label: '20 Min', desc: 'Balanced' },
                    { id: '60min' as TimeBudget, label: '60 Min', desc: 'Deep' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeBudget(t.id)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        timeBudget === t.id
                          ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6]'
                          : 'bg-[#FAF9F5] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]'
                      }`}
                    >
                      <div className="font-bold text-xs">{t.label}</div>
                      <div className={`text-[10px] ${timeBudget === t.id ? 'text-[#AAAAAA]' : 'text-[#777777]'}`}>
                        {t.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Learning Goal (Optional) */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#1C1C1C] block mb-1">
                Primary Goal or Objective <span className="text-[#888888] font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Ace my Class 10 Physics exams / Master database index query optimization"
                className="w-full bg-[#FAF9F5] border border-[#1C1C1C]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
              />
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] font-bold text-sm shadow-md flex items-center justify-center gap-2 group transition-all"
            >
              <span>Save Preferences & Start Learning</span>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
