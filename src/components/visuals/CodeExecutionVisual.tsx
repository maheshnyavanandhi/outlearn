import React, { useState } from 'react';
import { Terminal, Play, StepForward, RotateCcw, CheckCircle } from 'lucide-react';

interface CodeExecutionVisualProps {
  initialCode?: string;
  annotation?: string;
}

export const CodeExecutionVisual: React.FC<CodeExecutionVisualProps> = ({
  initialCode,
  annotation
}) => {
  const codeLines = [
    { num: 1, text: 'total_charge = 0' },
    { num: 2, text: 'current_samples = [0.9, 0.45, 0.22]' },
    { num: 3, text: 'for i in range(len(current_samples)):' },
    { num: 4, text: '    total_charge += current_samples[i]' },
    { num: 5, text: '    print(f"Sample {i}: Charge = {total_charge:.2f}")' },
    { num: 6, text: 'print("Batch computation complete!")' }
  ];

  const executionSteps = [
    { line: 1, vars: { total_charge: 0, i: 'undefined' }, output: '' },
    { line: 2, vars: { total_charge: 0, current_samples: '[0.9, 0.45, 0.22]' }, output: '' },
    { line: 3, vars: { total_charge: 0, i: 0 }, output: '' },
    { line: 4, vars: { total_charge: 0.9, i: 0 }, output: '' },
    { line: 5, vars: { total_charge: 0.9, i: 0 }, output: 'Sample 0: Charge = 0.90' },
    { line: 3, vars: { total_charge: 0.9, i: 1 }, output: 'Sample 0: Charge = 0.90' },
    { line: 4, vars: { total_charge: 1.35, i: 1 }, output: 'Sample 0: Charge = 0.90' },
    { line: 5, vars: { total_charge: 1.35, i: 1 }, output: 'Sample 0: Charge = 0.90\nSample 1: Charge = 1.35' },
    { line: 6, vars: { total_charge: 1.57, i: 2 }, output: 'Sample 0: Charge = 0.90\nSample 1: Charge = 1.35\nSample 2: Charge = 1.57\nBatch computation complete!' }
  ];

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const step = executionSteps[currentStepIdx];

  const handleNextStep = () => {
    if (currentStepIdx < executionSteps.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden text-[#1C1C1C]" id="code-execution-visual">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <span>Interactive Code Execution Tracer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                Step-by-Step
              </span>
            </h3>
            <p className="text-[11px] text-[#666666] font-sans">Watch execution pointer and variables evolve in real time</p>
          </div>
        </div>

        {/* Step Controls */}
        <div className="flex items-center gap-1.5 bg-[#F2EFEB] p-1 rounded-xl border border-[#1C1C1C]/15">
          <button
            onClick={handleNextStep}
            disabled={currentStepIdx >= executionSteps.length - 1}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] disabled:opacity-40 flex items-center gap-1 transition-all shadow-sm"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Next Line</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#666666] hover:text-[#1C1C1C] hover:bg-[#E6E3DB] transition-all"
            title="Reset execution"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Editor & Watcher Grid */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 py-2 text-xs">
        {/* Code Lines with Execution Pointer */}
        <div className="sm:col-span-7 bg-[#F9F8F6] rounded-xl p-3 border border-[#1C1C1C]/15 font-mono overflow-y-auto shadow-sm">
          <div className="text-[10px] text-[#666666] mb-2 font-mono flex items-center justify-between">
            <span>source.py</span>
            <span className="text-[#1C1C1C] font-semibold">Step {currentStepIdx + 1} of {executionSteps.length}</span>
          </div>
          <div className="space-y-1">
            {codeLines.map((line) => {
              const isCurrent = step.line === line.num;
              return (
                <div
                  key={line.num}
                  className={`flex items-center gap-2 px-2 py-1 rounded transition-all ${
                    isCurrent
                      ? 'bg-[#FEF3C7] border-l-4 border-[#1C1C1C] text-[#1C1C1C] font-bold shadow-xs'
                      : 'text-[#666666] hover:text-[#1C1C1C]'
                  }`}
                >
                  <span className="w-4 text-right text-[#999999] select-none">{line.num}</span>
                  <span className="flex-1">{line.text}</span>
                  {isCurrent && <span className="text-[10px] text-[#1C1C1C] font-mono">◀ CURRENT</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Variables & Output Pane */}
        <div className="sm:col-span-5 flex flex-col gap-2">
          {/* Watch Variables */}
          <div className="bg-[#F9F8F6] rounded-xl p-2.5 border border-[#1C1C1C]/15 shadow-sm">
            <div className="text-[10px] uppercase font-mono font-bold text-[#666666] tracking-wider mb-1.5">
              Variable Watcher
            </div>
            <div className="space-y-1 font-mono text-[11px]">
              {Object.entries(step.vars).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between px-2 py-1 rounded bg-[#FFFFFF] border border-[#1C1C1C]/10">
                  <span className="text-[#1C1C1C] font-semibold">{k}:</span>
                  <span className="text-[#059669] font-bold">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="flex-1 bg-[#1C1C1C] rounded-xl p-2.5 border border-[#1C1C1C] font-mono text-[11px] text-[#F9F8F6] overflow-y-auto min-h-[70px] shadow-sm">
            <div className="text-[10px] text-[#888888] uppercase font-mono mb-1">Terminal Output</div>
            {step.output ? (
              <pre className="whitespace-pre-wrap text-[#86EFAC]">{step.output}</pre>
            ) : (
              <span className="text-[#888888] italic">No output generated yet...</span>
            )}
          </div>
        </div>
      </div>

      {annotation && (
        <div className="mt-1 px-3 py-1.5 rounded-lg bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-serif italic flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#1C1C1C] shrink-0" />
          <span>{annotation}</span>
        </div>
      )}
    </div>
  );
};
