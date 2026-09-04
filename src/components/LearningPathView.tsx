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
  Play
} from 'lucide-react';

interface LearningPathViewProps {
  currentTopic?: string;
  learnerProfile: LearnerProfile;
  onSelectPathStage: (stageTitle: string, stageDetails?: LearningPathStage) => void;
  onBackToSetup: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  currentTopic = '',
  learnerProfile,
  onSelectPathStage,
  onBackToSetup
}) => {
  const [roadmap, setRoadmap] = useState<LearningPath>(() =>
    generateDynamicRoadmap(currentTopic || learnerProfile.learningObjective, learnerProfile)
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  // Re-sync roadmap if currentTopic changes
  useEffect(() => {
    const dynamic = generateDynamicRoadmap(currentTopic || learnerProfile.learningObjective, learnerProfile);
    setRoadmap(dynamic);
  }, [currentTopic, learnerProfile]);

  // Option to request AI Gemini model to regenerate a 6-stage roadmap
  const handleRegenerateWithAi = async () => {
    setIsGeneratingAi(true);
    try {
      const topicToUse = currentTopic || learnerProfile.learningObjective || 'General Science';
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
      console.warn('Failed to regenerate roadmap via backend AI, using local dynamic roadmap:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

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
          <button
            onClick={handleRegenerateWithAi}
            disabled={isGeneratingAi}
            className="px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#1C1C1C]/20 hover:bg-[#F2EFEB] text-[#1C1C1C] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50"
            title="Generate custom 6-stage roadmap using Gemini AI"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin text-amber-600' : 'text-[#1C1C1C]'}`} />
            <span>{isGeneratingAi ? 'Synthesizing AI Roadmap...' : 'Regenerate with Gemini AI'}</span>
          </button>

          <span className="text-xs text-[#666666] font-mono hidden sm:inline">
            Dynamic Adaptive Engine
          </span>
        </div>
      </div>

      {/* Main Roadmap Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15 text-xs font-mono font-semibold mb-3 shadow-sm">
          <Network className="w-3.5 h-3.5" />
          <span>AI Adaptive Learning Path</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1C1C] tracking-tight">
          {roadmap.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] font-serif italic mt-2">
          {roadmap.description}. Select any active stage below to launch a live AI teaching session.
        </p>
      </div>

      {/* Structured Multi-Stage Roadmap Graph */}
      <div className="relative border-l-2 border-[#1C1C1C]/15 ml-4 sm:ml-28 space-y-8 pl-6 sm:pl-8">
        {roadmap.stages.map((stage, idx) => {
          const isMastered = stage.status === 'mastered';
          const isUnderstood = stage.status === 'understood';
          const isDeveloping = stage.status === 'developing';
          const isLocked = stage.status === 'unknown' && idx > 2; // Keep first 3 stages unlocked for exploration
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
                      STAGE {idx + 1}
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
                      <span>{stage.conceptsCount || 6} Concepts • Interactive AI Lab</span>
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
