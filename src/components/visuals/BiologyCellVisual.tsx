import React, { useState } from 'react';
import { Microscope, Check, Info, Sparkles } from 'lucide-react';

interface BiologyCellVisualProps {
  initialCellType?: 'plant' | 'animal';
  highlightTarget?: string;
  annotation?: string;
}

export const BiologyCellVisual: React.FC<BiologyCellVisualProps> = ({
  initialCellType = 'plant',
  highlightTarget,
  annotation
}) => {
  const [cellType, setCellType] = useState<'plant' | 'animal'>(initialCellType);
  const [selectedOrganelle, setSelectedOrganelle] = useState<string | null>(highlightTarget || 'cell_wall');

  const organelles = {
    cell_wall: {
      name: 'Rigid Cell Wall',
      material: 'Cellulose fibers',
      function: 'Provides mechanical turgidity and structural rigidity. Plants lack bones, so the cell wall keeps tall stems erect against gravity.',
      onlyIn: 'Plant Cells Only'
    },
    cell_membrane: {
      name: 'Plasma Membrane',
      material: 'Phospholipid Bilayer',
      function: 'Selectively permeable barrier regulating ionic transport in and out of the cytoplasm.',
      onlyIn: 'Both Plant & Animal Cells'
    },
    chloroplast: {
      name: 'Chloroplast',
      material: 'Thylakoid membranes & Chlorophyll',
      function: 'Synthesizes glucose through photosynthesis by capturing photons of light energy.',
      onlyIn: 'Plant Cells Only'
    },
    mitochondria: {
      name: 'Mitochondria',
      material: 'Double-membrane organelle with Cristae',
      function: 'The cellular powerhouse: produces Adenosine Triphosphate (ATP) via aerobic cellular respiration.',
      onlyIn: 'Both Plant & Animal Cells'
    }
  };

  const currentInfo = selectedOrganelle ? (organelles as any)[selectedOrganelle] : organelles.cell_wall;

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden text-[#1C1C1C]" id="biology-cell-visual">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
            <Microscope className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <span>Cell Anatomy Explorer</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                Plant vs Animal
              </span>
            </h3>
            <p className="text-[11px] text-[#666666] font-sans">
              Interactive structural comparison & organelle inspection
            </p>
          </div>
        </div>

        {/* Plant vs Animal Toggle */}
        <div className="flex items-center gap-1 bg-[#F2EFEB] p-1 rounded-xl border border-[#1C1C1C]/15">
          <button
            onClick={() => setCellType('plant')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              cellType === 'plant'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            Plant Cell
          </button>
          <button
            onClick={() => setCellType('animal')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              cellType === 'animal'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            Animal Cell
          </button>
        </div>
      </div>

      {/* Main Interactive Cell Diagram */}
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 py-2 min-h-[190px]">
        {/* SVG Cell Diagram */}
        <div className="w-full sm:w-1/2 h-44 flex items-center justify-center">
          <svg viewBox="0 0 240 200" className="w-full h-full max-w-[240px]">
            {cellType === 'plant' ? (
              // Plant Cell: Hexagonal/Rectangular rigid shape with outer Cell Wall
              <g>
                {/* Thick Outer Cell Wall (Cellulose) */}
                <polygon
                  points="30,20 210,20 230,100 210,180 30,180 10,100"
                  fill="#D1FAE5"
                  stroke={selectedOrganelle === 'cell_wall' ? '#047857' : '#059669'}
                  strokeWidth={selectedOrganelle === 'cell_wall' ? '6' : '4'}
                  className="cursor-pointer transition-all"
                  onClick={() => setSelectedOrganelle('cell_wall')}
                />
                {/* Inner Cell Membrane */}
                <polygon
                  points="38,28 202,28 220,100 202,172 38,172 20,100"
                  fill="#ECFDF5"
                  stroke="#10B981"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => setSelectedOrganelle('cell_membrane')}
                />
                {/* Large Central Vacuole */}
                <ellipse cx="120" cy="110" rx="45" ry="35" fill="#E0F2FE" opacity="0.8" stroke="#0284C7" strokeWidth="1.5" />
                <text x="120" y="112" fill="#0369A1" fontSize="9" textAnchor="middle" fontFamily="serif" fontWeight="bold">Vacuole</text>
                {/* Nucleus */}
                <circle cx="65" cy="65" r="18" fill="#EDE9FE" opacity="0.9" stroke="#7C3AED" strokeWidth="1.5" />
                <text x="65" y="68" fill="#5B21B6" fontSize="8" textAnchor="middle" fontFamily="serif" fontWeight="bold">Nucleus</text>
                {/* Chloroplasts */}
                <ellipse cx="175" cy="60" rx="14" ry="9" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('chloroplast')} />
                <ellipse cx="170" cy="140" rx="14" ry="9" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('chloroplast')} />
                {/* Mitochondria */}
                <ellipse cx="75" cy="140" rx="12" ry="7" fill="#FECACA" opacity="0.9" stroke="#DC2626" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('mitochondria')} />
              </g>
            ) : (
              // Animal Cell: Flexible rounded / irregular oval shape (NO cell wall!)
              <g>
                {/* Flexible Outer Cell Membrane Only */}
                <ellipse
                  cx="120"
                  cy="100"
                  rx="95"
                  ry="75"
                  fill="#FEF3C7"
                  stroke={selectedOrganelle === 'cell_membrane' ? '#B45309' : '#D97706'}
                  strokeWidth={selectedOrganelle === 'cell_membrane' ? '5' : '3'}
                  strokeDasharray="4 2"
                  className="cursor-pointer transition-all"
                  onClick={() => setSelectedOrganelle('cell_membrane')}
                />
                {/* Nucleus in center */}
                <circle cx="120" cy="100" r="24" fill="#EDE9FE" opacity="0.9" stroke="#7C3AED" strokeWidth="1.5" />
                <text x="120" y="103" fill="#5B21B6" fontSize="9" textAnchor="middle" fontFamily="serif" fontWeight="bold">Nucleus</text>
                {/* Multiple Mitochondria */}
                <ellipse cx="65" cy="70" rx="15" ry="8" fill="#FECACA" opacity="0.9" stroke="#DC2626" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('mitochondria')} />
                <ellipse cx="175" cy="75" rx="14" ry="8" fill="#FECACA" opacity="0.9" stroke="#DC2626" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('mitochondria')} />
                <ellipse cx="160" cy="135" rx="15" ry="8" fill="#FECACA" opacity="0.9" stroke="#DC2626" strokeWidth="1.5" className="cursor-pointer" onClick={() => setSelectedOrganelle('mitochondria')} />
                {/* Note badge: NO CELL WALL */}
                <rect x="50" y="145" width="80" height="20" rx="4" fill="#FEE2E2" stroke="#EF4444" strokeWidth="1" />
                <text x="90" y="158" fill="#991B1B" fontSize="8" textAnchor="middle" fontWeight="bold" fontFamily="mono">NO Cell Wall</text>
              </g>
            )}
          </svg>
        </div>

        {/* Organelle Inspector Info Box */}
        <div className="w-full sm:w-1/2 bg-[#F9F8F6] rounded-xl p-3 border border-[#1C1C1C]/15 text-xs shadow-sm">
          {currentInfo ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-serif font-bold text-[#1C1C1C] text-sm">{currentInfo.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15 font-semibold">
                  {currentInfo.onlyIn}
                </span>
              </div>
              <div className="text-[#666666] text-[11px] mb-1.5 font-sans">
                <strong className="text-[#1C1C1C]">Structure:</strong> {currentInfo.material}
              </div>
              <p className="text-[#1C1C1C] text-[11px] leading-relaxed font-sans">
                {currentInfo.function}
              </p>
            </div>
          ) : (
            <div className="text-[#666666] text-[11px] font-sans">Click an organelle to inspect its function.</div>
          )}

          {/* Quick Select Buttons */}
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#1C1C1C]/10">
            {Object.keys(organelles).map((key) => {
              const item = (organelles as any)[key];
              const isSelected = selectedOrganelle === key;
              if (cellType === 'animal' && (key === 'cell_wall' || key === 'chloroplast')) return null;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedOrganelle(key)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                      : 'bg-[#F2EFEB] text-[#1C1C1C] hover:bg-[#E6E3DB] border border-[#1C1C1C]/10'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Misconception Alert Callout */}
      <div className="mt-1 p-2.5 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/30 text-xs text-[#92400E] flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#B45309] shrink-0" />
        <span>
          <strong className="text-[#B45309]">Key Distinction: </strong>
          Animals need <em>locomotion & flexibility</em> so they possess only elastic membranes, while plants rely on hydrostatic turgor against the rigid cellulose wall!
        </span>
      </div>
    </div>
  );
};
