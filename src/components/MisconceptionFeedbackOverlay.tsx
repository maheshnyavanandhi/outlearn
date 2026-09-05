import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Compass,
  RotateCcw,
  BookOpen,
  HelpCircle,
  X
} from 'lucide-react';

export interface MisconceptionData {
  category?: string;
  name: string;
  diagnosis: string;
  speech: string;
  strategy?: 'analogy' | 'visual_counterexample' | 'formula_breakdown' | 'step_trace' | string;
  correctiveStrategyText?: string;
  studentAnswer?: string;
  conceptName?: string;
}

interface MisconceptionFeedbackOverlayProps {
  misconception: MisconceptionData | null;
  onContinue: () => void;
  onAskForClarification?: (prefilledQuery: string) => void;
  teacherTitle?: string;
}

const STRATEGY_DETAILS: Record<string, { title: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  analogy: {
    title: 'Intuitive Physical Analogy Strategy',
    icon: Compass,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    desc: 'Connecting abstract physical relations to familiar real-world hydraulic and physical mechanisms.'
  },
  visual_counterexample: {
    title: 'Visual Counter-Example Strategy',
    icon: Sparkles,
    color: 'text-orange-800',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    desc: 'Demonstrating an edge case where the flawed assumption contradicts observed circuit behavior.'
  },
  formula_breakdown: {
    title: 'Formula & Variable Decomposition Strategy',
    icon: BookOpen,
    color: 'text-amber-900',
    bg: 'bg-amber-100/60',
    border: 'border-amber-300/80',
    desc: 'Breaking down numerator and denominator dependencies step-by-step to isolate variables.'
  },
  step_trace: {
    title: 'Sequential Step-Tracing Strategy',
    icon: RotateCcw,
    color: 'text-stone-800',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    desc: 'Tracing physical cause-and-effect sequentially from potential difference to current flow.'
  }
};

export const MisconceptionFeedbackOverlay: React.FC<MisconceptionFeedbackOverlayProps> = ({
  misconception,
  onContinue,
  onAskForClarification,
  teacherTitle = 'Dr. Vikram Sharma'
}) => {
  if (!misconception) return null;

  const strategyKey = misconception.strategy || 'analogy';
  const strategyMeta = STRATEGY_DETAILS[strategyKey] || STRATEGY_DETAILS.analogy;
  const StrategyIcon = strategyMeta.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="my-3 rounded-2xl bg-[#FAF8F5] border-2 border-amber-400/80 shadow-lg overflow-hidden relative"
      >
        {/* Glowing Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 animate-pulse" />

        <div className="p-4 sm:p-5 flex flex-col gap-3.5">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#1C1C1C]/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800">
                    Flagged Misconception
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-950 font-bold border border-amber-300/80">
                    {misconception.category || 'Conceptual Flaw'}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#1C1C1C] leading-tight">
                  {misconception.name}
                </h3>
              </div>
            </div>

            <button
              onClick={onContinue}
              className="p-1 rounded-lg text-[#777777] hover:text-[#1C1C1C] hover:bg-[#1C1C1C]/5 transition-colors"
              title="Close overlay"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Student Answer vs Diagnosed Thought */}
          {misconception.studentAnswer && (
            <div className="p-2.5 rounded-xl bg-amber-100/40 border border-amber-200/80 text-xs font-sans">
              <span className="font-mono font-bold text-[10px] text-amber-900 block mb-0.5">
                FLAGGED STUDENT RESPONSE:
              </span>
              <p className="italic text-[#222222]">"{misconception.studentAnswer}"</p>
            </div>
          )}

          {/* Diagnosed Thought Trap */}
          <div className="text-xs text-[#333333] font-sans leading-relaxed bg-[#FFFFFF] p-3 rounded-xl border border-[#1C1C1C]/10 shadow-2xs">
            <span className="font-mono font-bold text-[10px] text-[#777777] uppercase block mb-1">
              Cognitive Diagnosis:
            </span>
            <p className="font-serif text-[12.5px] text-[#1C1C1C]">
              {misconception.diagnosis}
            </p>
          </div>

          {/* Lesson Plan Corrective Strategy Card */}
          <div className={`p-3.5 rounded-xl ${strategyMeta.bg} ${strategyMeta.border} border shadow-2xs flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <StrategyIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>Lesson Plan Corrective Strategy</span>
              </span>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-[#F9F8F6]">
                ADAPT PHASE
              </span>
            </div>

            <h4 className={`font-serif font-bold text-xs ${strategyMeta.color}`}>
              {strategyMeta.title}
            </h4>

            <p className="text-[11.5px] text-[#333333] font-sans leading-relaxed">
              {misconception.correctiveStrategyText || strategyMeta.desc}
            </p>

            {/* Spoken Teacher Correction */}
            <div className="mt-1 pt-2 border-t border-[#1C1C1C]/10">
              <div className="text-[10px] font-mono text-[#777777] font-bold mb-1">
                {teacherTitle}'s Guided Pivot:
              </div>
              <p className="font-serif italic text-xs text-[#1C1C1C] leading-relaxed">
                "{misconception.speech}"
              </p>
            </div>
          </div>

          {/* Interactive Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {onAskForClarification && (
              <button
                type="button"
                onClick={() =>
                  onAskForClarification(
                    `Can you explain why "${misconception.name}" is incorrect using an example?`
                  )
                }
                className="px-3 py-1.5 rounded-xl border border-[#1C1C1C]/20 hover:bg-[#1C1C1C]/5 text-[#1C1C1C] text-xs font-sans font-medium flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Ask Teacher to Clarify</span>
              </button>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="ml-auto px-4 py-2 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] text-xs font-bold shadow flex items-center gap-1.5 transition-all group"
            >
              <span>Apply Corrective Strategy & Resume</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
