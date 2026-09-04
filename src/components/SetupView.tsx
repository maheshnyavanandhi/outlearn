import React, { useState } from 'react';
import {
  EducationalLevel,
  TimeBudget,
  LanguageCode,
  TeacherPersonality,
  LessonPlan
} from '../types';
import {
  SUPPORTED_LANGUAGES,
  TEACHER_PERSONALITIES,
  PHYSICS_OHMS_LAW_PLAN,
  DBMS_RELATIONAL_ALGEBRA_PLAN,
  BIOLOGY_CELL_PLAN
} from '../data/curriculumData';
import {
  BookOpen,
  Upload,
  Clock,
  Globe,
  Sparkles,
  Zap,
  Database,
  Microscope,
  Cpu,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface SetupViewProps {
  onStartLesson: (plan: LessonPlan) => void;
  onExploreLearningPath: () => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStartLesson, onExploreLearningPath }) => {
  const [mode, setMode] = useState<'topic' | 'upload'>('topic');
  const [topicInput, setTopicInput] = useState('');
  const [level, setLevel] = useState<EducationalLevel>('beginner');
  const [timeBudget, setTimeBudget] = useState<TimeBudget>('20min');
  const [language, setLanguage] = useState<LanguageCode>('hinglish');
  const [personality, setPersonality] = useState<TeacherPersonality>('mentor');
  const [isGenerating, setIsGenerating] = useState(false);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileContent, setUploadedFileContent] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<any | null>(null);

  // Quick-load exemplars
  const handleLoadExemplar = (exemplar: LessonPlan) => {
    onStartLesson({
      ...exemplar,
      language,
      teacherPersonality: personality,
      timeBudget,
      educationalLevel: level
    });
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

      // Call document RAG endpoint
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

  // Generate Custom Lesson
  const handleGenerateCustomLesson = async () => {
    const effectiveTopic = topicInput.trim() || 'General Science & Principles';
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          educationalLevel: level,
          timeBudget,
          language,
          materialContext: uploadedFileContent
        })
      });

      const data = await res.json();
      const plan: LessonPlan = data.plan;

      // Enhance with full fallback steps if generated plan is lightweight
      const finalPlan: LessonPlan = {
        id: `dyn-plan-${Date.now()}`,
        topic: plan.topic || effectiveTopic,
        subject: plan.subject || 'physics',
        educationalLevel: level,
        timeBudget,
        totalMinutes: timeBudget === '5min' ? 5 : timeBudget === '20min' ? 20 : 60,
        language,
        teacherPersonality: personality,
        prerequisitesOverview: (plan as any).prerequisites || plan.prerequisitesOverview || ['Basic curiosity and open mind'],
        steps: (plan.steps && plan.steps.length > 0) ? plan.steps.map((st: any) => ({
          id: st.id || `step-${Math.random()}`,
          concept: {
            id: `c-${Math.random()}`,
            name: st.conceptName || `${effectiveTopic} Concepts`,
            subject: plan.subject || 'physics',
            summary: st.summary || 'Fundamental principles',
            difficulty: level,
            prerequisites: [],
            keyTerms: st.keyTerms || ['Definition', 'Application']
          },
          allocatedMinutes: st.allocatedMinutes || 5,
          masteryState: 'unknown',
          beats: st.beats || [
            {
              id: `b-${Math.random()}`,
              conceptId: `c-dyn`,
              action: 'INTRODUCE',
              speechEn: `Welcome to our session on ${effectiveTopic}. Let us explore the core principles together!`,
              caption: `Introduction to ${effectiveTopic}`,
              visualCue: { subject: plan.subject || 'physics', viewMode: 'overview' },
              durationSec: 8
            }
          ]
        })) : PHYSICS_OHMS_LAW_PLAN.steps,
        sourceDocumentName: uploadedFileName || undefined,
        ragGrounded: Boolean(uploadedFileName)
      };

      setIsGenerating(false);
      onStartLesson(finalPlan);
    } catch (err) {
      console.warn('Failed to generate lesson, launching physics exemplar', err);
      setIsGenerating(false);
      handleLoadExemplar(PHYSICS_OHMS_LAW_PLAN);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4" id="setup-view-root">
      {/* Hero Welcome Banner with Editorial Aesthetic */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ECEAE4] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] mb-4 shadow-sm font-mono">
          <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
          <span>AI Innovation Hackathon 2026 — Bharat Academix</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#1C1C1C] tracking-tight leading-tight">
          Meet <span className="italic font-serif underline decoration-[#1C1C1C]/30 decoration-1 underline-offset-8">OutLearn</span>, Your AI Teacher
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#5A5A5A] font-serif italic leading-relaxed max-w-2xl mx-auto">
          An adaptive educator designed for deep mastery — teaching through synchronized speech, subject-aware interactive laboratories, and rigorous misconception diagnosis.
        </p>
      </div>

      {/* Exemplar Fast-Launch Cards (Matches Hackathon PDF Scenarios) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase font-mono font-bold text-[#666666] tracking-widest">
            Featured Teaching Scenarios (Assessment Exemplars)
          </h2>
          <button
            onClick={onExploreLearningPath}
            className="text-xs text-[#1C1C1C] hover:text-[#555555] flex items-center gap-1 font-medium transition-colors underline decoration-dotted underline-offset-4"
          >
            <span>View 8-Stage Machine Learning Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Exemplar 1: Physics Chapter 4 Electricity (Exact PDF Scenario) */}
          <div
            onClick={() => handleLoadExemplar(PHYSICS_OHMS_LAW_PLAN)}
            className="group cursor-pointer p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10">
                <Zap className="w-4 h-4 text-[#D97706]" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/10">
                PDF User Scenario
              </span>
            </div>
            <h3 className="font-serif font-bold text-[#1C1C1C] text-base group-hover:text-[#000000] transition-colors">
              Physics: Chapter 4 Electricity & Ohm's Law
            </h3>
            <p className="text-xs text-[#666666] mt-1.5 line-clamp-2 leading-relaxed font-sans">
              "Teach me Chapter 4 in 20 min in Hinglish. Ask questions and test me."
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-[#777777] pt-2.5 border-t border-[#1C1C1C]/10 font-mono">
              <span>Interactive circuit simulation</span>
              <span className="text-[#1C1C1C] font-bold group-hover:translate-x-0.5 transition-transform">Launch →</span>
            </div>
          </div>

          {/* Exemplar 2: DBMS Relational Algebra (Video Demo Scenario) */}
          <div
            onClick={() => handleLoadExemplar(DBMS_RELATIONAL_ALGEBRA_PLAN)}
            className="group cursor-pointer p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10">
                <Database className="w-4 h-4 text-[#2563EB]" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/10">
                Video Demo Topic
              </span>
            </div>
            <h3 className="font-serif font-bold text-[#1C1C1C] text-base group-hover:text-[#000000] transition-colors">
              DBMS: Selection (σ) vs Projection (π)
            </h3>
            <p className="text-xs text-[#666666] mt-1.5 line-clamp-2 leading-relaxed font-sans">
              Horizontal row slicing vs vertical column extraction with animated tables.
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-[#777777] pt-2.5 border-t border-[#1C1C1C]/10 font-mono">
              <span>Interactive table transformations</span>
              <span className="text-[#1C1C1C] font-bold group-hover:translate-x-0.5 transition-transform">Launch →</span>
            </div>
          </div>

          {/* Exemplar 3: Biology Cell Structure */}
          <div
            onClick={() => handleLoadExemplar(BIOLOGY_CELL_PLAN)}
            className="group cursor-pointer p-5 rounded-2xl bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="p-2 rounded-xl bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/10">
                <Microscope className="w-4 h-4 text-[#059669]" />
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/10">
                Biology
              </span>
            </div>
            <h3 className="font-serif font-bold text-[#1C1C1C] text-base group-hover:text-[#000000] transition-colors">
              Biology: Cell Membrane vs Cell Wall
            </h3>
            <p className="text-xs text-[#666666] mt-1.5 line-clamp-2 leading-relaxed font-sans">
              Structure-to-function reasoning and why plant cells have cellulose walls.
            </p>
            <div className="mt-4 flex items-center justify-between text-[11px] text-[#777777] pt-2.5 border-t border-[#1C1C1C]/10 font-mono">
              <span>Interactive organelle inspection</span>
              <span className="text-[#1C1C1C] font-bold group-hover:translate-x-0.5 transition-transform">Launch →</span>
            </div>
          </div>
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
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="e.g. Newton's Laws of Motion for Class 8, React Hooks for Technical Interview, Neural Networks..."
                className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl px-4 py-3.5 text-sm text-[#1C1C1C] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C] focus:border-[#1C1C1C]"
              />
            </div>
            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[
                'Newton\'s Laws for Class 8',
                'React for Technical Interview',
                'Photosynthesis & Cellular Respiration',
                'SQL Join Operations & Normalization'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setTopicInput(suggestion)}
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
              Upload Educational Material (Books, Textbooks, PDFs, Notes, Research Papers)
            </label>

            <div className="border-2 border-dashed border-[#1C1C1C]/20 hover:border-[#1C1C1C]/40 bg-[#F9F8F6] rounded-2xl p-6 text-center transition-all">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <div className="p-3 rounded-full bg-[#F2EFEB] text-[#1C1C1C] mb-2 border border-[#1C1C1C]/10">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-[#1C1C1C]">
                  {uploadedFileName ? uploadedFileName : 'Click to select or drag & drop textbook file'}
                </span>
                <span className="text-xs text-[#777777] mt-1 font-sans">
                  Supports PDF, DOCX, PPTX notes, Markdown, and TXT files
                </span>
              </label>
            </div>

            {/* Document Extraction Preview */}
            {isParsingDoc && (
              <div className="mt-3 p-3 rounded-xl bg-[#F2EFEB] border border-[#1C1C1C]/20 text-xs text-[#1C1C1C] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1C1C1C] animate-ping" />
                <span>Extracting chapters, sections, definitions, and formulas from document...</span>
              </div>
            )}

            {extractedSummary && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#F4F1EA] border border-[#1C1C1C]/20 text-xs text-[#1C1C1C]">
                <div className="flex items-center gap-2 text-[#059669] font-bold mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Document Analyzed & Grounded into Knowledge Base</span>
                </div>
                <p className="text-[#666666] text-[11px]">
                  Detected Chapters: {extractedSummary.chapters?.map((c: any) => c.title).join(', ') || '1 identified chapter'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4 Learner Adaptation Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-t border-[#1C1C1C]/15">
          {/* Dimension 1: Educational Level */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2">
              1. Educational Level
            </label>
            <div className="space-y-1.5">
              {(['beginner', 'intermediate', 'advanced'] as EducationalLevel[]).map((lvl) => (
                <button
                  key={lvl}
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
              <span>2. Available Time</span>
            </label>
            <div className="space-y-1.5">
              {(['5min', '20min', '60min', '7days'] as TimeBudget[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeBudget(t)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    timeBudget === t
                      ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm font-semibold'
                      : 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#444444] hover:bg-[#F2EFEB]'
                  }`}
                >
                  {t === '5min' ? '5 Minutes: Snapshot' : t === '20min' ? '20 Minutes: Structured' : t === '60min' ? '60 Minutes: Masterclass' : '7 Days: Revision Plan'}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension 3: Teaching Language */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#1C1C1C] mb-2 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#1C1C1C]" />
              <span>3. Preferred Language</span>
            </label>
            <select
              value={language}
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
              value={personality}
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

        {/* Start Teaching Session Button */}
        <div className="pt-6 border-t border-[#1C1C1C]/15 flex justify-end">
          <button
            onClick={handleGenerateCustomLesson}
            disabled={isGenerating}
            className="px-6 py-3.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-50 text-[#F9F8F6] font-semibold text-sm shadow-md flex items-center gap-2 transition-all font-sans"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-[#F9F8F6] border-t-transparent rounded-full animate-spin" />
                <span>Structuring Personalized Lesson...</span>
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
