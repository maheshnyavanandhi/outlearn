import React, { useState, useEffect } from 'react';
import { Zap, Gauge, Lightbulb, RefreshCw, AlertCircle, ArrowRight, Waves } from 'lucide-react';

interface PhysicsCircuitVisualProps {
  initialVoltage?: number;
  initialResistance?: number;
  showAnalogyMode?: boolean;
  highlightTarget?: string;
  annotation?: string;
  onStateChange?: (state: { voltage: number; resistance: number; current: number }) => void;
}

export const PhysicsCircuitVisual: React.FC<PhysicsCircuitVisualProps> = ({
  initialVoltage = 9,
  initialResistance = 10,
  showAnalogyMode = false,
  highlightTarget,
  annotation,
  onStateChange
}) => {
  const [voltage, setVoltage] = useState<number>(initialVoltage ?? 9);
  const [resistance, setResistance] = useState<number>(initialResistance ?? 10);
  const [mode, setMode] = useState<'circuit' | 'analogy'>(showAnalogyMode ? 'analogy' : 'circuit');
  const [electronOffset, setElectronOffset] = useState(0);

  // Calculate current: I = V / R
  const current = Number((voltage / Math.max(1, resistance)).toFixed(2));
  // Power: P = V * I for lamp brightness
  const power = voltage * current;
  const lampBrightness = Math.min(1, Math.max(0.1, power / 15));

  // Update mode if parent requests analogy mode
  useEffect(() => {
    if (showAnalogyMode) {
      setMode('analogy');
    }
  }, [showAnalogyMode]);

  // Sync state changes with parent
  useEffect(() => {
    onStateChange?.({ voltage, resistance, current });
  }, [voltage, resistance, current, onStateChange]);

  // Electron animation speed is directly proportional to current I
  useEffect(() => {
    if (mode !== 'circuit') return;
    const interval = setInterval(() => {
      setElectronOffset((prev) => (prev + Math.max(0.4, current * 2)) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [current, mode]);

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden text-[#1C1C1C]" id="physics-circuit-visual">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <span>Interactive Ohm's Law Laboratory</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                V = I × R
              </span>
            </h3>
            <p className="text-[11px] text-[#666666] font-sans">
              Manipulate parameters live to discover electrical proportionalities
            </p>
          </div>
        </div>

        {/* Analogy Strategy Switcher (Crucial for Misconception Redirection!) */}
        <div className="flex items-center gap-1 bg-[#F2EFEB] p-1 rounded-xl border border-[#1C1C1C]/15">
          <button
            onClick={() => setMode('circuit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              mode === 'circuit'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            Circuit Diagram
          </button>
          <button
            onClick={() => setMode('analogy')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              mode === 'analogy'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Water Pipe Analogy</span>
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      <div className="flex-1 relative flex items-center justify-center min-h-[220px] py-2">
        {mode === 'circuit' ? (
          /* Circuit Diagram with Animated Flowing Electrons */
          <div className="relative w-full max-w-md h-52 flex items-center justify-center">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <defs>
                {/* Glow filter for lamp */}
                <filter id="lamp-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Circuit Wire Loop */}
              <rect
                x="40"
                y="30"
                width="320"
                height="140"
                rx="16"
                fill="none"
                stroke="#1C1C1C"
                strokeWidth="4"
              />

              {/* Animated Electron Dots along the wire loop */}
              {[...Array(14)].map((_, i) => {
                const totalPerimeter = 2 * (320 + 140);
                const pos = ((i * (totalPerimeter / 14) + electronOffset * 8) % totalPerimeter);
                let x = 40, y = 30;

                if (pos < 320) {
                  x = 40 + pos;
                  y = 30;
                } else if (pos < 320 + 140) {
                  x = 360;
                  y = 30 + (pos - 320);
                } else if (pos < 320 + 140 + 320) {
                  x = 360 - (pos - (320 + 140));
                  y = 170;
                } else {
                  x = 40;
                  y = 170 - (pos - (320 + 140 + 320));
                }

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#1C1C1C"
                    className="transition-all duration-75"
                  />
                );
              })}

              {/* Battery / DC Voltage Source on Left */}
              <g transform="translate(40, 100)" className={highlightTarget === 'battery' ? 'animate-pulse' : ''}>
                <rect x="-18" y="-22" width="36" height="44" rx="6" fill="#F2EFEB" stroke="#1C1C1C" strokeWidth="2" />
                <line x1="-12" y1="-8" x2="12" y2="-8" stroke="#DC2626" strokeWidth="3" />
                <line x1="-6" y1="8" x2="6" y2="8" stroke="#1C1C1C" strokeWidth="3" />
                <text x="-2" y="-12" fill="#DC2626" fontSize="10" fontWeight="bold">+</text>
                <text x="-1" y="20" fill="#1C1C1C" fontSize="10" fontWeight="bold">−</text>
                <text x="-25" y="4" fill="#1C1C1C" fontSize="11" textAnchor="end" fontWeight="bold" fontFamily="monospace">{voltage}V</text>
              </g>

              {/* Resistor Component on Top */}
              <g transform="translate(200, 30)" className={highlightTarget === 'resistor' ? 'animate-pulse' : ''}>
                <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#F2EFEB" stroke="#1C1C1C" strokeWidth="2" />
                {/* Resistor color bands */}
                <line x1="-24" y1="-8" x2="-24" y2="8" stroke="#DC2626" strokeWidth="3" />
                <line x1="-10" y1="-8" x2="-10" y2="8" stroke="#2563EB" strokeWidth="3" />
                <line x1="4" y1="-8" x2="4" y2="8" stroke="#059669" strokeWidth="3" />
                <line x1="18" y1="-8" x2="18" y2="8" stroke="#D97706" strokeWidth="3" />
                <text x="0" y="-18" fill="#1C1C1C" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                  R = {resistance} Ω
                </text>
              </g>

              {/* Glowing Incandescent Lamp / Load on Bottom */}
              <g transform="translate(200, 170)" className={highlightTarget === 'lamp' ? 'animate-pulse' : ''}>
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  fill={`rgba(245, 158, 11, ${0.15 + lampBrightness * 0.85})`}
                  stroke="#B45309"
                  strokeWidth="2"
                  filter={lampBrightness > 0.3 ? 'url(#lamp-glow)' : undefined}
                />
                {/* Filament */}
                <path d="M -7 5 Q 0 -12 7 5" stroke="#92400E" strokeWidth="2" fill="none" />
                <text x="0" y="32" fill="#1C1C1C" fontSize="10" textAnchor="middle" fontFamily="serif">
                  Lamp Load ({power.toFixed(1)}W)
                </text>
              </g>

              {/* Digital Ammeter on Right Wire */}
              <g transform="translate(360, 100)" className={highlightTarget === 'ammeter' ? 'animate-pulse' : ''}>
                <circle cx="0" cy="0" r="22" fill="#F2EFEB" stroke="#1C1C1C" strokeWidth="2" />
                <text x="0" y="-3" fill="#1C1C1C" fontSize="11" textAnchor="middle" fontWeight="bold">A</text>
                <text x="0" y="11" fill="#1C1C1C" fontSize="10" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
                  {current} A
                </text>
              </g>
            </svg>
          </div>
        ) : (
          /* Water Pipe Analogy Representation (Crucial for Misconception Redirection!) */
          <div className="w-full max-w-md bg-[#F9F8F6] rounded-xl p-4 border border-[#1C1C1C]/15 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
                Intuition Analogy: Water in a Pipe
              </span>
            </div>

            {/* SVG Water Pipe diagram */}
            <svg viewBox="0 0 360 110" className="w-full h-24 bg-[#FFFFFF] rounded-lg p-1 border border-[#1C1C1C]/10">
              {/* Wide inlet pipe */}
              <rect x="20" y="25" width="100" height="60" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
              {/* Narrow constriction valve = RESISTANCE */}
              <rect
                x="120"
                y={25 + Math.min(24, resistance * 0.4)}
                width="80"
                height={Math.max(12, 60 - resistance * 0.5)}
                fill="#FEF3C7"
                stroke="#D97706"
                strokeWidth="2"
              />
              {/* Outlet pipe */}
              <rect x="200" y="25" width="140" height="60" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />

              {/* Water flow arrows */}
              <path d="M 40 55 L 90 55 M 80 48 L 90 55 L 80 62" stroke="#0284C7" strokeWidth="3" fill="none" />
              <path d="M 230 55 L 290 55 M 280 48 L 290 55 L 280 62" stroke="#0284C7" strokeWidth="3" fill="none" />

              {/* Labels */}
              <text x="70" y="20" fill="#0284C7" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Water Pressure (V)</text>
              <text x="160" y="18" fill="#B45309" fontSize="10" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">
                Constriction (R = {resistance}Ω)
              </text>
              <text x="270" y="20" fill="#0284C7" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Flow Rate (I = {current}A)</text>
            </svg>

            <div className="mt-3 p-3 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30 text-xs text-[#92400E]">
              <strong className="text-[#B45309]">Why Current Decreases: </strong>
              Resistance is literally an <span className="underline decoration-[#D97706]">obstruction</span>. Squeezing the pipe makes it harder for water to pass through. Thus, as <strong>R increases</strong>, the flow <strong>I decreases</strong>!
            </div>
          </div>
        )}

        {/* Live Mathematical Formula Pill */}
        <div className="absolute top-2 right-2 bg-[#F9F8F6] px-3 py-1.5 rounded-xl border border-[#1C1C1C]/15 shadow-sm text-right">
          <div className="text-[10px] text-[#666666] font-mono uppercase tracking-wider">Ohm's Equation</div>
          <div className="text-sm font-mono font-bold text-[#1C1C1C]">
            I = {voltage}V / {resistance}Ω = <span className="font-black underline">{current} A</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls (Sliders for Voltage and Resistance) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#1C1C1C]/10">
        {/* Voltage Slider */}
        <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#1C1C1C]/15">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-[#1C1C1C] flex items-center gap-1.5 font-serif">
              <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
              Voltage (Potential Push V)
            </label>
            <span className="text-xs font-mono font-bold text-[#1C1C1C]">{voltage} Volts</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="1"
            value={voltage ?? 9}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full accent-[#1C1C1C] cursor-pointer h-1.5 bg-[#E2DED6] rounded-lg"
          />
        </div>

        {/* Resistance Slider */}
        <div className="bg-[#F9F8F6] p-2.5 rounded-xl border border-[#1C1C1C]/15">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-[#1C1C1C] flex items-center gap-1.5 font-serif">
              <span className="w-2 h-2 rounded-full bg-[#666666]" />
              Resistance (Opposition R)
            </label>
            <span className="text-xs font-mono font-bold text-[#1C1C1C]">{resistance} Ohms</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={resistance ?? 10}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full accent-[#1C1C1C] cursor-pointer h-1.5 bg-[#E2DED6] rounded-lg"
          />
        </div>
      </div>

      {/* Teacher's Visual Annotation Callout */}
      {annotation && (
        <div className="mt-2.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-serif italic">
          <Lightbulb className="w-4 h-4 text-[#1C1C1C] shrink-0" />
          <span>{annotation}</span>
        </div>
      )}
    </div>
  );
};
