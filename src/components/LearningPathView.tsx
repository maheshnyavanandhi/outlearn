import React, { useState, useEffect } from 'react';
import { LearnerProfile } from '../types';
import {
  generateDynamicRoadmap,
  LearningPath,
  LearningPathStage
} from '../utils/roadmapGenerator';
import {
  Network,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Play,
  Search,
  Compass,
  GraduationCap,
  BrainCircuit,
  TrendingUp
} from 'lucide-react';

interface LearningPathViewProps {
  currentTopic?: string;
  activeSubject?: string;
  learnerProfile: LearnerProfile;
  onSelectPathStage: (stageTitle: string, stageDetails?: LearningPathStage) => void;
  onBackToSetup: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  currentTopic = '',
  activeSubject,
  learnerProfile,
  onSelectPathStage,
  onBackToSetup
}) => {
  const [searchTopic, setSearchTopic] = useState(currentTopic || learnerProfile.learningObjective || 'Machine Learning');
  const [roadmap, setRoadmap] = useState<LearningPath>(() =>
    generateDynamicRoadmap(searchTopic, learnerProfile)
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Re-sync roadmap if currentTopic changes
  useEffect(() => {
    if (currentTopic) {
      setSearchTopic(currentTopic);
      const dynamic = generateDynamicRoadmap(currentTopic, learnerProfile);
      setRoadmap(dynamic);
    }
  }, [currentTopic, learnerProfile]);

  // Handle generating AI roadmap for any search topic
  const handleGeneratePathForTopic = async (topicToUse: string) => {
    if (!topicToUse.trim()) return;
    setIsGeneratingAi(true);
    setSearchTopic(topicToUse);

    // Fast local generation first for instant UX
    const localDynamic = generateDynamicRoadmap(topicToUse, learnerProfile);
    setRoadmap(localDynamic);

    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse,
          educationalLevel: learnerProfile.educationalLevel,
          learningObjective: learnerProfile.learningObjective
        })
      });
      const data = await res.json();
      if (data.success && data.roadmap && Array.isArray(data.roadmap.stages)) {
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.warn('Backend AI roadmap generation fallback to local generator:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Preset topic recommendations
  const PRESET_TOPICS = [
    { label: '🤖 Machine Learning', topic: 'Machine Learning' },
    { label: '⚡ Physics & Circuit Laws', topic: "Physics & Circuit Laws (Ohm's Law)" },
    { label: '💾 DBMS & Data Eng', topic: 'Relational DBMS & SQL Engineering' },
    { label: '🧬 Cellular Biology', topic: 'Cellular Biology & Metabolic Pathways' },
    { label: '🐍 Python Fundamentals', topic: 'Python CS & Data Structures' },
    { label: '⚛️ Quantum Computing', topic: 'Quantum Computing & Qubits' }
  ];

  // Calculate student path progress
  const totalStages = roadmap.stages.length;
  const masteredCount = roadmap.stages.filter(s => s.status === 'mastered').length;
  const understoodCount = roadmap.stages.filter(s => s.status === 'understood').length;
  const developingStage = roadmap.stages.find(s => s.status === 'developing') || roadmap.stages.find(s => s.status === 'unknown') || roadmap.stages[0];
  const progressPercent = Math.round(((masteredCount * 1.0 + understoodCount * 0.5) / Math.max(totalStages, 1)) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="learning-path-root">
      {/* Back button & Header controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToSetup}
          className="px-3.5 py-1.5 rounded-xl bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#E6E3DB] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lesson Setup</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666666] font-mono flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Progress-Guiding Engine Active</span>
          </span>
        </div>
      </div>

      {/* Main Topic Input & AI Learning Path Generator */}
      <div className="bg-[#FFFFFF] border border-[#1C1C1C]/15 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-3">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1C1C] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#1C1C1C]" />
            <span>Learning Path Generator (Broad Topic Explorer)</span>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#888888]" />
            <input
              type="text"
              value={searchTopic}
              onChange={(e) => setSearchTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePathForTopic(searchTopic)}
              placeholder="Enter any broad topic (e.g. Machine Learning, Neuroscience, Quantum Physics)..."
              className="w-full bg-[#F9F8F6] border border-[#1C1C1C]/20 rounded-xl pl-9 pr-3 py-2 text-xs font-serif text-[#1C1C1C] focus:outline-none focus:ring-1 focus:ring-[#1C1C1C]"
            />
          </div>

          <button
            onClick={() => handleGeneratePathForTopic(searchTopic)}
            disabled={isGeneratingAi || !searchTopic.trim()}
            className="px-4 py-2 bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-50 text-[#F9F8F6] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 font-sans"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isGeneratingAi ? 'Generating AI Roadmap...' : 'Generate AI Path'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] text-[#888888] font-mono uppercase tracking-wider shrink-0 mr-1">
            Popular Paths:
          </span>
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleGeneratePathForTopic(preset.topic)}
              className="px-2.5 py-1 rounded-lg bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/10 text-[#1C1C1C] text-[11px] font-medium whitespace-nowrap transition-all shrink-0"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Roadmap Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15 text-xs font-mono font-semibold mb-3 shadow-sm">
          <Network className="w-3.5 h-3.5" />
          <span>Structured Curriculum • {totalStages} Sequential Stages</span>
          <span className="px-2 py-0.5 rounded bg-[#1C1C1C] text-[#F9F8F6] text-[10px] font-bold uppercase tracking-wider font-mono">
            {activeSubject || roadmap.subject || 'GENERAL'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1C1C] tracking-tight">
          {roadmap.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] font-serif italic mt-2">
          {roadmap.description}. OutLearn guides your progression based on evaluated concept mastery.
        </p>
      </div>

      {/* AI Progress Guide & Active Stage Recommendation Banner */}
      <div className="bg-[#1C1C1C] text-[#F9F8F6] rounded-2xl p-5 mb-10 shadow-md relative overflow-hidden border border-[#1C1C1C]">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-[#1C1C1C] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" />
                <span>AI Progress Guide</span>
              </span>
              <span className="text-xs font-mono text-[#D1FAE5]">
                {progressPercent}% Path Mastery ({masteredCount}/{totalStages} Stages Mastered)
              </span>
            </div>

            <h3 className="text-lg font-serif font-bold text-[#F9F8F6]">
              Recommended Next Milestone: <span className="text-amber-300">{developingStage?.title}</span>
            </h3>

            <p className="text-xs text-[#CCCCCC] font-serif leading-relaxed">
              Based on your demonstrated knowledge, prerequisites for this stage are satisfied. OutLearn will adapt lesson pacing, interactive visuals, and checkpoints specifically for this module.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => {
                if (developingStage) {
                  setSelectedStageId(developingStage.id);
                  onSelectPathStage(developingStage.title, developingStage);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#1C1C1C] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all font-sans"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Recommended Stage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-[#A0A0A0] text-center font-mono">
              Est. Duration: 20 Minutes • Adaptive Checkpoints
            </span>
          </div>
        </div>

        {/* Path Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
          <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(progressPercent, 12)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-[#CCCCCC] shrink-0">
            {masteredCount} Mastered • {understoodCount} Understood • 1 Active
          </span>
        </div>
      </div>

      {/* Structured Multi-Stage Roadmap Graph */}
      <div className="relative border-l-2 border-[#1C1C1C]/15 ml-4 sm:ml-28 space-y-8 pl-6 sm:pl-8">
        {roadmap.stages.map((stage, idx) => {
          const isMastered = stage.status === 'mastered';
          const isUnderstood = stage.status === 'understood';
          const isDeveloping = stage.status === 'developing';
          const isLocked = stage.status === 'unknown' && idx > 3; // Keep first 4 stages accessible
          const isSelected = selectedStageId === stage.id;

          return (
            <div key={stage.id || idx} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isMastered
                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                    : isUnderstood
                    ? 'bg-[#444444] border-[#444444] text-[#F9F8F6]'
                    : isDeveloping
                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] ring-4 ring-amber-400/40 shadow-md'
                    : 'bg-[#F2EFEB] border-[#1C1C1C]/20 text-[#888888]'
                }`}
              >
                {isMastered ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isUnderstood ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                ) : isDeveloping ? (
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Card */}
              <div
                onClick={() => {
                  if (!isLocked) {
                    setSelectedStageId(stage.id);
                    onSelectPathStage(stage.title, stage);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all ${
                  isDeveloping
                    ? 'bg-[#FFFFFF] border-2 border-[#1C1C1C] shadow-md cursor-pointer hover:scale-[1.01]'
                    : !isLocked
                    ? 'bg-[#FFFFFF] border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 cursor-pointer shadow-sm hover:scale-[1.005]'
                    : 'bg-[#F9F8F6] border border-[#1C1C1C]/10 opacity-70 cursor-not-allowed'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#666666]">
                      STAGE {idx + 1} OF {totalStages}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#1C1C1C]">{stage.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold uppercase tracking-wider ${
                        isMastered
                          ? 'bg-[#D1FAE5] text-[#065F46]'
                          : isUnderstood
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : isDeveloping
                          ? 'bg-[#1C1C1C] text-[#F9F8F6]'
                          : 'bg-[#F2EFEB] text-[#888888]'
                      }`}
                    >
                      {stage.status}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#666666] font-mono capitalize">
                      {stage.level}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#555555] mb-3 font-serif leading-relaxed">
                  {stage.description || `Covers ${stage.conceptsCount || 6} core competencies with AI checkpoint evaluations.`}
                </p>

                {/* Launch Action Bar */}
                {!isLocked && (
                  <div className="flex items-center justify-between pt-3 border-t border-[#1C1C1C]/10 mt-2">
                    <span className="text-[11px] text-[#666666] font-mono flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#1C1C1C]" />
                      <span>{stage.conceptsCount || 6} Core Concepts • Interactive AI Teaching Session</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStageId(stage.id);
                        onSelectPathStage(stage.title, stage);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all font-sans ${
                        isDeveloping
                          ? 'bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6]'
                          : 'bg-[#F2EFEB] hover:bg-[#1C1C1C] text-[#1C1C1C] hover:text-[#F9F8F6] border border-[#1C1C1C]/15'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Teach This Stage</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
