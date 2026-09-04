import React from 'react';
import { MACHINE_LEARNING_PATH } from '../data/curriculumData';
import { Network, CheckCircle2, Clock, Lock, ArrowRight, BookOpen, ArrowLeft } from 'lucide-react';

interface LearningPathViewProps {
  onSelectPathStage: (stageTitle: string) => void;
  onBackToSetup: () => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  onSelectPathStage,
  onBackToSetup
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="learning-path-root">
      {/* Back button & Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToSetup}
          className="px-3.5 py-1.5 rounded-xl bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#E6E3DB] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lesson Setup</span>
        </button>

        <span className="text-xs text-[#666666] font-mono">
          Curriculum Engine (PDF Section 15)
        </span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15 text-xs font-mono font-semibold mb-3 shadow-sm">
          <Network className="w-3.5 h-3.5" />
          <span>AI-Generated Adaptive Learning Path</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1C1C] tracking-tight">
          {MACHINE_LEARNING_PATH.title}
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] font-serif italic mt-2">
          {MACHINE_LEARNING_PATH.description}. OutLearn guides you step-by-step through prerequisites.
        </p>
      </div>

      {/* Structured 8-Stage Roadmap Graph */}
      <div className="relative border-l-2 border-[#1C1C1C]/15 ml-4 sm:ml-32 space-y-8 pl-6 sm:pl-8">
        {MACHINE_LEARNING_PATH.stages.map((stage, idx) => {
          const isMastered = stage.status === 'mastered';
          const isUnderstood = stage.status === 'understood';
          const isDeveloping = stage.status === 'developing';
          const isLocked = stage.status === 'unknown';

          return (
            <div key={stage.id} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isMastered
                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                    : isUnderstood
                    ? 'bg-[#444444] border-[#444444] text-[#F9F8F6]'
                    : isDeveloping
                    ? 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] ring-4 ring-[#1C1C1C]/15 shadow-md'
                    : 'bg-[#F2EFEB] border-[#1C1C1C]/20 text-[#888888]'
                }`}
              >
                {isMastered ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isUnderstood ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isDeveloping ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Card */}
              <div
                onClick={() => !isLocked && onSelectPathStage(stage.title)}
                className={`p-5 rounded-2xl border transition-all ${
                  isDeveloping
                    ? 'bg-[#FFFFFF] border-2 border-[#1C1C1C] shadow-md cursor-pointer'
                    : isMastered || isUnderstood
                    ? 'bg-[#FFFFFF] border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/30 cursor-pointer shadow-sm'
                    : 'bg-[#F9F8F6] border border-[#1C1C1C]/10 opacity-70'
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
                          ? 'bg-[#F2EFEB] text-[#1C1C1C]'
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

                <p className="text-xs text-[#666666] mb-3 font-sans">
                  Covers {stage.conceptsCount} core competencies with checkpoint evaluations.
                </p>

                {isDeveloping && (
                  <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]/10">
                    <span className="text-xs text-[#1C1C1C] font-serif italic font-semibold">
                      Current Milestone Recommended by OutLearn
                    </span>
                    <button className="px-3.5 py-1.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all font-sans">
                      <span>Start Teaching Session</span>
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
