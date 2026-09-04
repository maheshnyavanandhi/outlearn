import React, { useState } from 'react';
import { Scale, ChevronRight, RotateCcw, Check, Sparkles } from 'lucide-react';

interface MathStepsVisualProps {
  annotation?: string;
}

export const MathStepsVisual: React.FC<MathStepsVisualProps> = ({ annotation }) => {
  const steps = [
    {
      id: 1,
      equation: '2x + 3 = 11',
      action: 'Initial Equation',
      rule: 'Goal: Isolate the unknown variable x on the left-hand side.',
      leftScale: '2x + 3',
      rightScale: '11',
      balanced: true
    },
    {
      id: 2,
      equation: '2x + 3 - 3 = 11 - 3',
      action: 'Subtract 3 from BOTH sides',
      rule: 'Algebraic Equality: Subtracting 3 from both pans maintains perfect scale balance.',
      leftScale: '2x',
      rightScale: '8',
      balanced: true
    },
    {
      id: 3,
      equation: '2x = 8',
      action: 'Simplify',
      rule: 'Now 2 times x equals 8. We need the value of 1x, not 2x.',
      leftScale: '2x',
      rightScale: '8',
      balanced: true
    },
    {
      id: 4,
      equation: '2x / 2 = 8 / 2',
      action: 'Divide BOTH sides by coefficient 2',
      rule: 'Dividing both sides cuts the quantities equally, isolating x.',
      leftScale: 'x',
      rightScale: '4',
      balanced: true
    },
    {
      id: 5,
      equation: 'x = 4',
      action: 'Final Solution Verified!',
      rule: 'Check: 2(4) + 3 = 8 + 3 = 11. The equation holds true!',
      leftScale: 'x',
      rightScale: '4',
      balanced: true
    }
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const step = steps[currentStepIdx];

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden text-[#1C1C1C]" id="math-steps-visual">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <span>Equation Balancing Laboratory</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                2x + 3 = 11
              </span>
            </h3>
            <p className="text-[11px] text-[#666666] font-sans">Visual balance scale showing why equality is conserved</p>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex items-center gap-1.5 bg-[#F2EFEB] p-1 rounded-xl border border-[#1C1C1C]/15">
          <button
            onClick={() => setCurrentStepIdx((p) => Math.min(steps.length - 1, p + 1))}
            disabled={currentStepIdx >= steps.length - 1}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] disabled:opacity-40 flex items-center gap-1 transition-all shadow-sm"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentStepIdx(0)}
            className="p-1.5 rounded-lg text-[#666666] hover:text-[#1C1C1C] hover:bg-[#E6E3DB] transition-all"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Visual Balance Scale & Equation Reveal */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 py-2 min-h-[190px]">
        {/* SVG Balance Scale */}
        <div className="w-full sm:w-1/2 h-44 flex items-center justify-center">
          <svg viewBox="0 0 280 180" className="w-full h-full max-w-[280px]">
            {/* Base Stand */}
            <polygon points="125,170 155,170 144,110 136,110" fill="#1C1C1C" />
            <rect x="100" y="166" width="80" height="8" rx="3" fill="#1C1C1C" />
            {/* Center Fulcrum Pin */}
            <circle cx="140" cy="90" r="7" fill="#1C1C1C" stroke="#F9F8F6" strokeWidth="2" />

            {/* Horizontal Balance Beam */}
            <line x1="40" y1="90" x2="240" y2="90" stroke="#1C1C1C" strokeWidth="4" strokeLinecap="round" />

            {/* Left Pan Strings & Pan */}
            <line x1="60" y1="90" x2="45" y2="135" stroke="#666666" strokeWidth="1.5" />
            <line x1="60" y1="90" x2="75" y2="135" stroke="#666666" strokeWidth="1.5" />
            <path d="M 35 135 Q 60 145 85 135 Z" fill="#F2EFEB" stroke="#1C1C1C" strokeWidth="2" />
            {/* Left Weight / Pan Value */}
            <rect x="42" y="112" width="36" height="22" rx="4" fill="#1C1C1C" stroke="#1C1C1C" strokeWidth="1.5" />
            <text x="60" y="127" fill="#F9F8F6" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {step.leftScale}
            </text>

            {/* Right Pan Strings & Pan */}
            <line x1="220" y1="90" x2="205" y2="135" stroke="#666666" strokeWidth="1.5" />
            <line x1="220" y1="90" x2="235" y2="135" stroke="#666666" strokeWidth="1.5" />
            <path d="M 195 135 Q 220 145 245 135 Z" fill="#F2EFEB" stroke="#1C1C1C" strokeWidth="2" />
            {/* Right Weight / Pan Value */}
            <rect x="202" y="112" width="36" height="22" rx="4" fill="#1C1C1C" stroke="#1C1C1C" strokeWidth="1.5" />
            <text x="220" y="127" fill="#F9F8F6" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {step.rightScale}
            </text>

            {/* Equals Sign in Center */}
            <text x="140" y="65" fill="#1C1C1C" fontSize="24" textAnchor="middle" fontWeight="bold" fontFamily="serif">=</text>
          </svg>
        </div>

        {/* Step Breakdown Card */}
        <div className="w-full sm:w-1/2 bg-[#F9F8F6] rounded-xl p-3.5 border border-[#1C1C1C]/15 text-xs flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-mono font-bold text-[#666666]">Step {step.id} of {steps.length}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/10 font-semibold">
                {step.action}
              </span>
            </div>

            {/* Equation Big Banner */}
            <div className="py-2.5 px-3 rounded-lg bg-[#FFFFFF] border border-[#1C1C1C]/15 font-mono text-base sm:text-lg font-bold text-[#1C1C1C] text-center mb-2 shadow-xs">
              {step.equation}
            </div>

            <p className="text-[#1C1C1C] text-[11px] leading-relaxed font-sans">
              {step.rule}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-[#1C1C1C]/10">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStepIdx ? 'w-5 bg-[#1C1C1C]' : idx < currentStepIdx ? 'bg-[#666666]' : 'bg-[#E2DED6]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {annotation && (
        <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-serif italic flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1C1C1C] shrink-0" />
          <span>{annotation}</span>
        </div>
      )}
    </div>
  );
};
