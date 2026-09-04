import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  Zap,
  TrendingUp,
  Database,
  Activity,
  GitBranch,
  RotateCcw,
  Sliders,
  Info,
  Sparkles,
  Play,
  Pause,
  Layers,
  Cpu,
  Globe,
  SlidersHorizontal
} from 'lucide-react';
import { SubjectType } from '../../types';

export interface D3InteractiveDiagramProps {
  topic: string;
  subject?: SubjectType;
  conceptName?: string;
  highlightTarget?: string;
  annotation?: string;
  onDiagramInteract?: (info: string) => void;
}

export const D3InteractiveDiagram: React.FC<D3InteractiveDiagramProps> = ({
  topic,
  subject = 'physics',
  conceptName,
  highlightTarget,
  annotation,
  onDiagramInteract
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. Detect Subject strictly based on subject prop & topic keywords
  const detectSubject = (): SubjectType => {
    const t = `${topic} ${conceptName || ''}`.toLowerCase();
    
    if (subject === 'physics' || t.includes('circuit') || t.includes('ohm') || t.includes('voltage') || t.includes('current') || t.includes('electric') || t.includes('potential') || t.includes('physics') || t.includes('force') || t.includes('newton') || t.includes('energy') || t.includes('wave')) {
      return 'physics';
    }
    if (subject === 'dbms' || t.includes('dbms') || t.includes('sql') || t.includes('database') || t.includes('relational') || t.includes('join') || t.includes('table') || t.includes('query')) {
      return 'dbms';
    }
    if (subject === 'biology' || t.includes('bio') || t.includes('cell') || t.includes('respiration') || t.includes('atp') || t.includes('dna') || t.includes('mitochondria') || t.includes('gene')) {
      return 'biology';
    }
    if (subject === 'mathematics' || t.includes('math') || t.includes('graph') || t.includes('equation') || t.includes('calculus') || t.includes('function') || t.includes('sine') || t.includes('algebra') || t.includes('derivative')) {
      return 'mathematics';
    }
    if (subject === 'programming' || t.includes('code') || t.includes('programming') || t.includes('algorithm') || t.includes('python') || t.includes('java') || t.includes('stack') || t.includes('heap') || t.includes('sort')) {
      return 'programming';
    }
    return (subject as SubjectType) || 'general';
  };

  const activeSubject = detectSubject();

  // 2. State for subject-specific sub-views
  // For Physics: 'circuit' | 'vi_curve' | 'potential' | 'concept_map'
  // For DBMS: 'er_schema' | 'sql_join' | 'btree' | 'concept_map'
  // For Biology: 'respiration' | 'cell_structure' | 'dna_flow' | 'concept_map'
  // For Math: 'function_plot' | 'derivative' | 'integral' | 'concept_map'
  // For CS: 'stack_exec' | 'binary_tree' | 'sorting' | 'concept_map'
  // For General: 'concept_map'

  const getDefaultSubView = (sub: SubjectType): string => {
    switch (sub) {
      case 'physics':
        return 'circuit';
      case 'dbms':
        return 'er_schema';
      case 'biology':
        return 'respiration';
      case 'mathematics':
        return 'function_plot';
      case 'programming':
        return 'stack_exec';
      default:
        return 'concept_map';
    }
  };

  const [activeSubView, setActiveSubView] = useState<string>(getDefaultSubView(activeSubject));

  // Sync sub view when subject changes
  useEffect(() => {
    setActiveSubView(getDefaultSubView(activeSubject));
  }, [topic, conceptName, subject]);

  // Interactive parameters state
  // Physics params
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(10);
  const [workDone, setWorkDone] = useState(36); // Joules
  const [charge, setCharge] = useState(3); // Coulombs

  // Math graph params
  const [mathFunction, setMathFunction] = useState<'sine' | 'parabola' | 'cubic' | 'exponential'>('sine');
  const [frequency, setFrequency] = useState(1.5);
  const [amplitude, setAmplitude] = useState(2);
  const [xEval, setXEval] = useState(1.5);

  // DBMS params
  const [joinType, setJoinType] = useState<'INNER' | 'LEFT' | 'RIGHT'>('INNER');

  // General animation & node selection
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState<string | null>(null);

  // Main D3 Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 340;

    // Clear previous SVG contents
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    if (activeSubject === 'physics') {
      if (activeSubView === 'circuit') {
        renderPhysicsCircuit(svg, width, height);
      } else if (activeSubView === 'vi_curve') {
        renderPhysicsVICurve(svg, width, height);
      } else if (activeSubView === 'potential') {
        renderPhysicsPotentialDifference(svg, width, height);
      } else {
        renderTopicConceptMap(svg, width, height);
      }
    } else if (activeSubject === 'dbms') {
      if (activeSubView === 'er_schema') {
        renderDbmsErSchema(svg, width, height);
      } else if (activeSubView === 'sql_join') {
        renderDbmsSqlJoin(svg, width, height);
      } else {
        renderTopicConceptMap(svg, width, height);
      }
    } else if (activeSubject === 'biology') {
      if (activeSubView === 'respiration') {
        renderBiologyRespiration(svg, width, height);
      } else {
        renderTopicConceptMap(svg, width, height);
      }
    } else if (activeSubject === 'mathematics') {
      if (activeSubView === 'function_plot' || activeSubView === 'derivative') {
        renderMathFunctionPlot(svg, width, height);
      } else {
        renderTopicConceptMap(svg, width, height);
      }
    } else if (activeSubject === 'programming') {
      if (activeSubView === 'stack_exec') {
        renderCsStackMemory(svg, width, height);
      } else {
        renderTopicConceptMap(svg, width, height);
      }
    } else {
      renderTopicConceptMap(svg, width, height);
    }
  }, [
    activeSubject,
    activeSubView,
    voltage,
    resistance,
    workDone,
    charge,
    mathFunction,
    frequency,
    amplitude,
    xEval,
    joinType,
    topic,
    conceptName,
    isAnimating
  ]);

  // ==========================================
  // RENDERER 1: PHYSICS CIRCUIT & OHM'S LAW
  // ==========================================
  const renderPhysicsCircuit = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const current = Number((voltage / Math.max(1, resistance)).toFixed(2));
    const power = (voltage * current).toFixed(1);

    const g = svg.append('g').attr('class', 'circuit-group');

    const circuitW = width * 0.6;
    const padX = 40;
    const padY = 50;
    const loopX1 = padX;
    const loopY1 = padY;
    const loopX2 = circuitW - padX;
    const loopY2 = height - padY;

    // Wire Loop
    const wirePathData = `M ${loopX1} ${loopY1} L ${loopX2} ${loopY1} L ${loopX2} ${loopY2} L ${loopX1} ${loopY2} Z`;

    g.append('path')
      .attr('d', wirePathData)
      .attr('fill', 'none')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 3)
      .attr('stroke-linejoin', 'round');

    // Battery Source (Left)
    const batY = (loopY1 + loopY2) / 2;
    const batG = g.append('g').attr('transform', `translate(${loopX1}, ${batY})`);

    batG.append('rect')
      .attr('x', -22)
      .attr('y', -32)
      .attr('width', 44)
      .attr('height', 64)
      .attr('fill', '#FFFFFF')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2.5)
      .attr('rx', 8);

    batG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -8)
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text(`${voltage} V`);

    batG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 14)
      .attr('font-size', '10px')
      .attr('font-family', 'monospace')
      .attr('fill', '#059669')
      .text('Voltage (V)');

    // Resistor Component (Top)
    const resX = (loopX1 + loopX2) / 2;
    const resG = g.append('g').attr('transform', `translate(${resX}, ${loopY1})`);

    resG.append('rect')
      .attr('x', -40)
      .attr('y', -18)
      .attr('width', 80)
      .attr('height', 36)
      .attr('fill', '#FEF3C7')
      .attr('stroke', '#D97706')
      .attr('stroke-width', 2)
      .attr('rx', 6);

    resG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#92400E')
      .text(`R = ${resistance} Ω`);

    // Load Light Bulb (Right)
    const bulbY = (loopY1 + loopY2) / 2;
    const bulbG = g.append('g').attr('transform', `translate(${loopX2}, ${bulbY})`);

    const bulbBrightness = Math.min(1, current / 2.5);
    bulbG.append('circle')
      .attr('r', 24)
      .attr('fill', d3.interpolateYlOrRd(bulbBrightness))
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2.5);

    bulbG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', bulbBrightness > 0.5 ? '#FFFFFF' : '#1C1C1C')
      .text(`${power} W`);

    // Ammeter (Bottom)
    const ammeterX = (loopX1 + loopX2) / 2;
    const ammG = g.append('g').attr('transform', `translate(${ammeterX}, ${loopY2})`);

    ammG.append('circle')
      .attr('r', 20)
      .attr('fill', '#EFF6FF')
      .attr('stroke', '#2563EB')
      .attr('stroke-width', 2.5);

    ammG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1E40AF')
      .text(`${current}A`);

    // Electron flow animation
    if (isAnimating && current > 0) {
      const electronCount = Math.min(24, Math.max(6, Math.round(current * 8)));
      const pathEl = g.select('path').node() as SVGPathElement;
      if (pathEl) {
        const totalLen = pathEl.getTotalLength();
        for (let i = 0; i < electronCount; i++) {
          const dot = g.append('circle')
            .attr('r', 4)
            .attr('fill', '#3B82F6')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 1);

          const animateDot = () => {
            dot.transition()
              .duration(Math.max(700, 2800 / current))
              .ease(d3.easeLinear)
              .attrTween('transform', () => (t: number) => {
                const offset = ((i / electronCount) + t) % 1;
                const pt = pathEl.getPointAtLength(offset * totalLen);
                return `translate(${pt.x}, ${pt.y})`;
              })
              .on('end', animateDot);
          };
          animateDot();
        }
      }
    }

    // Right Side Live Formula Box
    const boxG = svg.append('g').attr('transform', `translate(${circuitW + 15}, 30)`);
    const boxW = width - circuitW - 30;

    boxG.append('rect')
      .attr('width', boxW)
      .attr('height', height - 60)
      .attr('rx', 12)
      .attr('fill', '#FAF9F5')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 1.5);

    boxG.append('text')
      .attr('x', boxW / 2)
      .attr('y', 28)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text("Ohm's Law Relation");

    boxG.append('text')
      .attr('x', boxW / 2)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('font-size', '20px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2563EB')
      .text("V = I × R");

    boxG.append('text')
      .attr('x', boxW / 2)
      .attr('y', 95)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text(`I = V / R = ${voltage} / ${resistance}`);

    boxG.append('text')
      .attr('x', boxW / 2)
      .attr('y', 120)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#059669')
      .text(`I = ${current} Amperes`);

    boxG.append('text')
      .attr('x', boxW / 2)
      .attr('y', 155)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('fill', '#6B7280')
      .text(`Dissipated Power: ${power} W`);
  };

  // ==================================================
  // RENDERER 2: PHYSICS V-I CHARACTERISTIC CURVE
  // ==================================================
  const renderPhysicsVICurve = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const current = Number((voltage / Math.max(1, resistance)).toFixed(2));
    const margin = { top: 35, right: 35, bottom: 45, left: 50 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 24]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 3]).range([innerH, 0]);

    // Grid
    g.append('g')
      .attr('opacity', 0.1)
      .call(d3.axisBottom(xScale).ticks(8).tickSize(innerH).tickFormat(() => ''));

    g.append('g')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).ticks(6).tickSize(-innerW).tickFormat(() => ''));

    // Axes
    g.append('g')
      .attr('transform', `translate(0, ${innerH})`)
      .call(d3.axisBottom(xScale).ticks(8))
      .attr('font-size', '10px');

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(6))
      .attr('font-size', '10px');

    // Axis Labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text('Voltage V (Volts)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text('Current I (Amperes)');

    // Line data I = V / R
    const lineData = d3.range(0, 25, 1).map((v) => ({
      v,
      i: v / Math.max(1, resistance)
    }));

    const lineGen = d3.line<{ v: number; i: number }>()
      .x((d) => xScale(d.v))
      .y((d) => yScale(d.i));

    g.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', '#2563EB')
      .attr('stroke-width', 3)
      .attr('d', lineGen);

    // Active operating point
    g.append('circle')
      .attr('cx', xScale(voltage))
      .attr('cy', yScale(current))
      .attr('r', 7)
      .attr('fill', '#EF4444')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', xScale(voltage) + 10)
      .attr('y', yScale(current) - 10)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#DC2626')
      .text(`Operating Point: (${voltage}V, ${current}A)`);

    // Title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '13px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text(`V-I Linear Characteristic Slope (Resistance R = ${resistance} Ω, Slope = 1/R = ${(1/resistance).toFixed(3)})`);
  };

  // ==========================================================
  // RENDERER 3: ELECTRIC POTENTIAL DIFFERENCE & CHARGE FIELD
  // ==========================================================
  const renderPhysicsPotentialDifference = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    // V = W / Q
    const potVolt = Number((workDone / Math.max(0.1, charge)).toFixed(2));

    const g = svg.append('g');

    // High potential plate (Left)
    const plateX1 = 80;
    const plateX2 = width - 80;
    const plateY1 = 50;
    const plateY2 = height - 50;

    // High Potential Terminal Plate
    g.append('rect')
      .attr('x', plateX1 - 15)
      .attr('y', plateY1)
      .attr('width', 30)
      .attr('height', plateY2 - plateY1)
      .attr('rx', 6)
      .attr('fill', '#FEE2E2')
      .attr('stroke', '#EF4444')
      .attr('stroke-width', 2.5);

    g.append('text')
      .attr('x', plateX1)
      .attr('y', plateY1 - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#DC2626')
      .text(`High Potential (+${potVolt} V)`);

    // Low Potential Terminal Plate
    g.append('rect')
      .attr('x', plateX2 - 15)
      .attr('y', plateY1)
      .attr('width', 30)
      .attr('height', plateY2 - plateY1)
      .attr('rx', 6)
      .attr('fill', '#DBEAFE')
      .attr('stroke', '#2563EB')
      .attr('stroke-width', 2.5);

    g.append('text')
      .attr('x', plateX2)
      .attr('y', plateY1 - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1D4ED8')
      .text(`Low Potential (0 V)`);

    // Field Arrow Lines
    const arrowCount = 5;
    for (let i = 0; i < arrowCount; i++) {
      const y = plateY1 + ((i + 1) * (plateY2 - plateY1)) / (arrowCount + 1);
      g.append('line')
        .attr('x1', plateX1 + 20)
        .attr('y1', y)
        .attr('x2', plateX2 - 20)
        .attr('y2', y)
        .attr('stroke', '#9CA3AF')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,4');
    }

    // Moving Test Charges
    if (isAnimating) {
      const particleCount = Math.min(15, Math.max(3, charge * 3));
      for (let i = 0; i < particleCount; i++) {
        const yPos = plateY1 + 30 + ((i * 37) % (plateY2 - plateY1 - 60));
        const circle = g.append('circle')
          .attr('r', 8)
          .attr('fill', '#F59E0B')
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 1.5);

        g.append('text')
          .attr('font-size', '9px')
          .attr('font-weight', 'bold')
          .attr('fill', '#FFFFFF')
          .attr('text-anchor', 'middle')
          .text('+q');

        const anim = () => {
          circle
            .attr('cx', plateX1 + 25)
            .attr('cy', yPos)
            .transition()
            .duration(Math.max(1200, 3000 / potVolt))
            .ease(d3.easeLinear)
            .attr('cx', plateX2 - 25)
            .on('end', anim);
        };
        anim();
      }
    }

    // Formula Badge Card
    const cardG = g.append('g').attr('transform', `translate(${width / 2}, ${height / 2 - 35})`);

    cardG.append('rect')
      .attr('x', -120)
      .attr('y', -35)
      .attr('width', 240)
      .attr('height', 70)
      .attr('rx', 12)
      .attr('fill', '#1C1C1C')
      .attr('opacity', 0.92);

    cardG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -10)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#F9F8F6')
      .text(`Voltage V = Work Done (W) / Charge (Q)`);

    cardG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 18)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#FBBF24')
      .text(`V = ${workDone} J / ${charge} C = ${potVolt} Volts`);
  };

  // ==========================================
  // RENDERER 4: DBMS ER SCHEMA
  // ==========================================
  const renderDbmsErSchema = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const nodes = [
      { id: 'Students', group: 'Entity Table', count: '10,000 rows', icon: '👤' },
      { id: 'Courses', group: 'Entity Table', count: '150 rows', icon: '📚' },
      { id: 'Enrollments', group: 'Junction Table', count: '45,000 rows', icon: '🔗' },
      { id: 'Instructors', group: 'Entity Table', count: '40 rows', icon: '👨‍🏫' },
      { id: 'Grades', group: 'Attribute Table', count: 'Indexed', icon: '📊' }
    ];

    const links = [
      { source: 'Students', target: 'Enrollments', label: '1 : N (student_id)' },
      { source: 'Courses', target: 'Enrollments', label: '1 : N (course_id)' },
      { source: 'Instructors', target: 'Courses', label: '1 : N (instructor_id)' },
      { source: 'Enrollments', target: 'Grades', label: 'Attributes' }
    ];

    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#94A3B8')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    const linkText = g.append('g')
      .selectAll('text')
      .data(links)
      .join('text')
      .attr('font-size', '9px')
      .attr('fill', '#64748B')
      .attr('text-anchor', 'middle')
      .text((d) => d.label);

    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    node.append('rect')
      .attr('x', -45)
      .attr('y', -22)
      .attr('width', 90)
      .attr('height', 44)
      .attr('rx', 8)
      .attr('fill', (d) => (d.id === 'Enrollments' ? '#FEF3C7' : '#FFFFFF'))
      .attr('stroke', (d) => (d.id === 'Enrollments' ? '#D97706' : '#1C1C1C'))
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -4)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text((d) => `${d.icon} ${d.id}`);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 12)
      .attr('font-size', '9px')
      .attr('fill', '#64748B')
      .text((d) => d.count);

    node.on('click', (e, d) => {
      setSelectedNodeInfo(`Entity: ${d.id} (${d.group}) - ${d.count}`);
      if (onDiagramInteract) onDiagramInteract(`Selected Entity: ${d.id}`);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      linkText
        .attr('x', (d: any) => (d.source.x + d.target.x) / 2)
        .attr('y', (d: any) => (d.source.y + d.target.y) / 2 - 4);

      node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });
  };

  // ==========================================
  // RENDERER 5: DBMS SQL JOIN VISUALIZER
  // ==========================================
  const renderDbmsSqlJoin = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const g = svg.append('g');

    const cx1 = width / 2 - 60;
    const cx2 = width / 2 + 60;
    const cy = height / 2;
    const r = 90;

    // Table A Circle
    g.append('circle')
      .attr('cx', cx1)
      .attr('cy', cy)
      .attr('r', r)
      .attr('fill', joinType === 'LEFT' ? '#3B82F6' : joinType === 'INNER' ? '#E0E7FF' : '#F3F4F6')
      .attr('opacity', 0.6)
      .attr('stroke', '#2563EB')
      .attr('stroke-width', 3);

    // Table B Circle
    g.append('circle')
      .attr('cx', cx2)
      .attr('cy', cy)
      .attr('r', r)
      .attr('fill', joinType === 'RIGHT' ? '#10B981' : joinType === 'INNER' ? '#E0E7FF' : '#F3F4F6')
      .attr('opacity', 0.6)
      .attr('stroke', '#059669')
      .attr('stroke-width', 3);

    g.append('text')
      .attr('x', cx1 - 40)
      .attr('y', cy)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1E40AF')
      .text('Table A (Left)');

    g.append('text')
      .attr('x', cx2 + 10)
      .attr('y', cy)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#065F46')
      .text('Table B (Right)');

    g.append('text')
      .attr('x', width / 2)
      .attr('y', cy - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text('Matched Records');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text(`SQL ${joinType} JOIN Query Result Set`);
  };

  // ==========================================
  // RENDERER 6: BIOLOGY CELLULAR RESPIRATION
  // ==========================================
  const renderBiologyRespiration = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const g = svg.append('g');

    // Mitochondria boundary
    g.append('ellipse')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('rx', width * 0.42)
      .attr('ry', height * 0.38)
      .attr('fill', '#ECFDF5')
      .attr('stroke', '#10B981')
      .attr('stroke-width', 3);

    const nodes = [
      { id: 'Glucose', x: width * 0.18, y: height / 2, color: '#3B82F6', label: 'Glucose (C₆H₁₂O₆)' },
      { id: 'Pyruvate', x: width * 0.38, y: height / 2, color: '#10B981', label: 'Pyruvate (3-Carbon)' },
      { id: 'Krebs', x: width * 0.58, y: height / 2, color: '#F59E0B', label: 'Krebs Cycle' },
      { id: 'ATP', x: width * 0.8, y: height / 2, color: '#EF4444', label: '36 ATP Molecules' }
    ];

    for (let i = 0; i < nodes.length - 1; i++) {
      g.append('line')
        .attr('x1', nodes[i].x + 25)
        .attr('y1', nodes[i].y)
        .attr('x2', nodes[i + 1].x - 25)
        .attr('y2', nodes[i + 1].y)
        .attr('stroke', '#1C1C1C')
        .attr('stroke-width', 2.5);
    }

    nodes.forEach((n) => {
      const ng = g.append('g').attr('transform', `translate(${n.x}, ${n.y})`).style('cursor', 'pointer');

      ng.append('circle')
        .attr('r', 22)
        .attr('fill', n.color)
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 2);

      ng.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 4)
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .attr('fill', '#FFFFFF')
        .text(n.id);

      ng.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 36)
        .attr('font-size', '9px')
        .attr('fill', '#1C1C1C')
        .text(n.label);

      ng.on('click', () => {
        setSelectedNodeInfo(`Stage: ${n.label}`);
        if (onDiagramInteract) onDiagramInteract(`Biology Node: ${n.id}`);
      });
    });
  };

  // ==========================================
  // RENDERER 7: MATH FUNCTION PLOTTER
  // ==========================================
  const renderMathFunctionPlot = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const margin = { top: 30, right: 30, bottom: 40, left: 45 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([-10, 10]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([-5, 5]).range([innerH, 0]);

    g.append('line')
      .attr('x1', 0)
      .attr('y1', yScale(0))
      .attr('x2', innerW)
      .attr('y2', yScale(0))
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2);

    g.append('line')
      .attr('x1', xScale(0))
      .attr('y1', 0)
      .attr('x2', xScale(0))
      .attr('y2', innerH)
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2);

    const evalY = (x: number): number => {
      if (mathFunction === 'sine') return amplitude * Math.sin(frequency * x);
      if (mathFunction === 'parabola') return amplitude * 0.15 * Math.pow(x, 2) - 2;
      if (mathFunction === 'cubic') return amplitude * 0.05 * Math.pow(x, 3) - x;
      return amplitude * 0.2 * Math.exp(0.4 * x) - 3;
    };

    const points: [number, number][] = [];
    for (let x = -10; x <= 10; x += 0.1) {
      points.push([x, evalY(x)]);
    }

    const lineGen = d3.line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(Math.max(-10, Math.min(10, d[1]))))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#4338CA')
      .attr('stroke-width', 3)
      .attr('d', lineGen);

    // Dynamic Evaluated Point
    const yVal = evalY(xEval);
    g.append('circle')
      .attr('cx', xScale(xEval))
      .attr('cy', yScale(yVal))
      .attr('r', 6)
      .attr('fill', '#EF4444')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', xScale(xEval) + 8)
      .attr('y', yScale(yVal) - 8)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#DC2626')
      .text(`(${xEval.toFixed(1)}, ${yVal.toFixed(2)})`);
  };

  // ==========================================
  // RENDERER 8: CS CALL STACK & MEMORY
  // ==========================================
  const renderCsStackMemory = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    const g = svg.append('g');

    // Call Stack Box
    const stackW = width * 0.4;
    g.append('rect')
      .attr('x', 30)
      .attr('y', 40)
      .attr('width', stackW)
      .attr('height', height - 70)
      .attr('rx', 10)
      .attr('fill', '#FAF9F5')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', 30 + stackW / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text('Call Stack (LIFO)');

    const stackFrames = ['computePotential()', 'calculateWork()', 'main()'];
    stackFrames.forEach((frame, i) => {
      const fy = height - 70 - i * 45;
      g.append('rect')
        .attr('x', 45)
        .attr('y', fy)
        .attr('width', stackW - 30)
        .attr('height', 36)
        .attr('rx', 6)
        .attr('fill', i === 0 ? '#3B82F6' : '#E5E7EB')
        .attr('stroke', '#1C1C1C')
        .attr('stroke-width', 1.5);

      g.append('text')
        .attr('x', 45 + (stackW - 30) / 2)
        .attr('y', fy + 22)
        .attr('text-anchor', 'middle')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .attr('fill', i === 0 ? '#FFFFFF' : '#1C1C1C')
        .text(frame);
    });

    // Heap Box
    const heapX = stackW + 60;
    const heapW = width - heapX - 30;

    g.append('rect')
      .attr('x', heapX)
      .attr('y', 40)
      .attr('width', heapW)
      .attr('height', height - 70)
      .attr('rx', 10)
      .attr('fill', '#FAF9F5')
      .attr('stroke', '#1C1C1C')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', heapX + heapW / 2)
      .attr('y', 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1C1C1C')
      .text('Heap Memory (Objects)');

    g.append('rect')
      .attr('x', heapX + 20)
      .attr('y', 60)
      .attr('width', heapW - 40)
      .attr('height', 80)
      .attr('rx', 8)
      .attr('fill', '#FEF3C7')
      .attr('stroke', '#D97706')
      .attr('stroke-width', 2);

    g.append('text')
      .attr('x', heapX + heapW / 2)
      .attr('y', 105)
      .attr('text-anchor', 'middle')
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('fill', '#92400E')
      .text('{ voltage: 12, current: 1.2 }');
  };

  // ==========================================================
  // RENDERER 9: DYNAMIC TOPIC CONCEPT NETWORK (FOR ANY TOPIC)
  // ==========================================================
  const renderTopicConceptMap = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    width: number,
    height: number
  ) => {
    // Generate topic-bound concept nodes
    const rootLabel = conceptName || topic || 'Core Lesson Topic';
    
    // Generate derived nodes based on topic
    let derivedNodes: { id: string; group: string; color: string }[] = [];

    const tLower = `${topic} ${conceptName || ''}`.toLowerCase();

    if (tLower.includes('electric') || tLower.includes('voltage') || tLower.includes('ohm')) {
      derivedNodes = [
        { id: rootLabel, group: 'Root Concept', color: '#1C1C1C' },
        { id: 'Voltage V (Volts)', group: 'Formula Element', color: '#2563EB' },
        { id: 'Work Done W (Joules)', group: 'Formula Element', color: '#D97706' },
        { id: 'Charge Q (Coulombs)', group: 'Formula Element', color: '#059669' },
        { id: 'Current I (Amperes)', group: 'Related Concept', color: '#7C3AED' },
        { id: 'Voltmeter (Parallel)', group: 'Measurement', color: '#DC2626' }
      ];
    } else if (tLower.includes('sql') || tLower.includes('dbms')) {
      derivedNodes = [
        { id: rootLabel, group: 'Root Concept', color: '#1C1C1C' },
        { id: 'Primary Key (PK)', group: 'Constraint', color: '#2563EB' },
        { id: 'Foreign Key (FK)', group: 'Constraint', color: '#059669' },
        { id: '1:N Relationship', group: 'Cardinality', color: '#D97706' },
        { id: 'INNER JOIN', group: 'Operation', color: '#7C3AED' }
      ];
    } else {
      derivedNodes = [
        { id: rootLabel, group: 'Root Concept', color: '#1C1C1C' },
        { id: 'Core Principles', group: 'Theory', color: '#2563EB' },
        { id: 'Practical Applications', group: 'Practice', color: '#059669' },
        { id: 'Mathematical Form', group: 'Equation', color: '#D97706' },
        { id: 'Key Examples', group: 'Demonstration', color: '#7C3AED' }
      ];
    }

    const links = derivedNodes.slice(1).map((n) => ({
      source: rootLabel,
      target: n.id
    }));

    const simulation = d3.forceSimulation(derivedNodes as any)
      .force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const g = svg.append('g');

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 2);

    const node = g.append('g')
      .selectAll('.node')
      .data(derivedNodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer');

    node.append('rect')
      .attr('x', (d) => (d.id === rootLabel ? -70 : -55))
      .attr('y', (d) => (d.id === rootLabel ? -24 : -18))
      .attr('width', (d) => (d.id === rootLabel ? 140 : 110))
      .attr('height', (d) => (d.id === rootLabel ? 48 : 36))
      .attr('rx', 10)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 4)
      .attr('font-size', (d) => (d.id === rootLabel ? '11px' : '9px'))
      .attr('font-weight', 'bold')
      .attr('fill', '#FFFFFF')
      .text((d) => (d.id.length > 20 ? d.id.slice(0, 18) + '...' : d.id));

    node.on('click', (e, d) => {
      setSelectedNodeInfo(`Concept: ${d.id} (${d.group})`);
      if (onDiagramInteract) onDiagramInteract(`Clicked Concept Node: ${d.id}`);
    });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden border border-[#1C1C1C]/15 shadow-sm text-[#1C1C1C]" id="d3-interactive-diagram-container">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#1C1C1C] text-[#F9F8F6]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-[#1C1C1C] flex items-center gap-1.5">
              <span>Interactive D3.js Diagram</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-mono font-bold uppercase">
                {activeSubject}
              </span>
            </h3>
            <p className="text-[10px] text-[#666666] font-sans">
              Topic: <strong className="text-[#1C1C1C]">{topic}</strong> {conceptName ? `— ${conceptName}` : ''}
            </p>
          </div>
        </div>

        {/* Sub-view switcher tabs ONLY relevant to current active subject */}
        <div className="flex items-center gap-1 bg-[#F4F1EA] p-1 rounded-xl border border-[#1C1C1C]/10 text-xs font-mono">
          {activeSubject === 'physics' && (
            <>
              <button
                onClick={() => setActiveSubView('circuit')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'circuit' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Circuit Loop</span>
              </button>
              <button
                onClick={() => setActiveSubView('vi_curve')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'vi_curve' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-indigo-400" />
                <span>V-I Curve</span>
              </button>
              <button
                onClick={() => setActiveSubView('potential')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'potential' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Zap className="w-3 h-3 text-rose-400" />
                <span>Potential (V=W/Q)</span>
              </button>
              <button
                onClick={() => setActiveSubView('concept_map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'concept_map' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <GitBranch className="w-3 h-3 text-emerald-400" />
                <span>Concept Map</span>
              </button>
            </>
          )}

          {activeSubject === 'dbms' && (
            <>
              <button
                onClick={() => setActiveSubView('er_schema')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'er_schema' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Database className="w-3 h-3 text-emerald-400" />
                <span>ER Schema</span>
              </button>
              <button
                onClick={() => setActiveSubView('sql_join')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'sql_join' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>SQL Joins</span>
              </button>
              <button
                onClick={() => setActiveSubView('concept_map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'concept_map' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <GitBranch className="w-3 h-3 text-sky-400" />
                <span>Concept Map</span>
              </button>
            </>
          )}

          {activeSubject === 'biology' && (
            <>
              <button
                onClick={() => setActiveSubView('respiration')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'respiration' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Activity className="w-3 h-3 text-rose-400" />
                <span>Respiration Flow</span>
              </button>
              <button
                onClick={() => setActiveSubView('concept_map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'concept_map' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <GitBranch className="w-3 h-3 text-emerald-400" />
                <span>Concept Map</span>
              </button>
            </>
          )}

          {activeSubject === 'mathematics' && (
            <>
              <button
                onClick={() => setActiveSubView('function_plot')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'function_plot' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-indigo-400" />
                <span>Function Plotter</span>
              </button>
              <button
                onClick={() => setActiveSubView('concept_map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'concept_map' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <GitBranch className="w-3 h-3 text-sky-400" />
                <span>Concept Map</span>
              </button>
            </>
          )}

          {activeSubject === 'programming' && (
            <>
              <button
                onClick={() => setActiveSubView('stack_exec')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'stack_exec' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <Cpu className="w-3 h-3 text-indigo-400" />
                <span>Call Stack</span>
              </button>
              <button
                onClick={() => setActiveSubView('concept_map')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  activeSubView === 'concept_map' ? 'bg-[#1C1C1C] text-[#F9F8F6] font-bold' : 'text-[#666666] hover:text-[#1C1C1C]'
                }`}
              >
                <GitBranch className="w-3 h-3 text-sky-400" />
                <span>Concept Map</span>
              </button>
            </>
          )}

          {activeSubject === 'general' && (
            <button
              onClick={() => setActiveSubView('concept_map')}
              className="px-2.5 py-1 rounded-lg bg-[#1C1C1C] text-[#F9F8F6] font-bold flex items-center gap-1"
            >
              <GitBranch className="w-3 h-3 text-amber-400" />
              <span>Concept Network</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas View */}
      <div ref={containerRef} className="flex-1 w-full min-h-[260px] relative my-2 bg-[#FAF9F5] rounded-xl border border-[#1C1C1C]/10 flex items-center justify-center overflow-hidden">
        <svg ref={svgRef} className="w-full h-full block" />

        {selectedNodeInfo && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#1C1C1C]/90 backdrop-blur-md text-[#F9F8F6] p-2.5 rounded-xl border border-white/20 text-xs font-mono flex items-center justify-between shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{selectedNodeInfo}</span>
            </div>
            <button
              onClick={() => setSelectedNodeInfo(null)}
              className="text-xs text-[#A0A0A0] hover:text-white font-bold px-1.5 py-0.5 rounded bg-white/10"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Subject Sliders & Controls */}
      <div className="pt-2 border-t border-[#1C1C1C]/10 flex flex-wrap items-center justify-between gap-3 text-xs font-sans shrink-0">
        {activeSubject === 'physics' && (activeSubView === 'circuit' || activeSubView === 'vi_curve') && (
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="font-mono text-[11px] font-bold text-[#1C1C1C]">Voltage (V): {voltage}V</label>
              <input
                type="range"
                min="1"
                max="24"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-24 accent-[#1C1C1C] cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-mono text-[11px] font-bold text-[#1C1C1C]">Resistance (R): {resistance}Ω</label>
              <input
                type="range"
                min="1"
                max="30"
                value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-24 accent-[#1C1C1C] cursor-pointer"
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Current I = {(voltage / resistance).toFixed(2)} A
            </span>
          </div>
        )}

        {activeSubject === 'physics' && activeSubView === 'potential' && (
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="font-mono text-[11px] font-bold text-[#1C1C1C]">Work Done (W): {workDone} J</label>
              <input
                type="range"
                min="6"
                max="120"
                step="6"
                value={workDone}
                onChange={(e) => setWorkDone(Number(e.target.value))}
                className="w-24 accent-[#1C1C1C] cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-mono text-[11px] font-bold text-[#1C1C1C]">Charge (Q): {charge} C</label>
              <input
                type="range"
                min="1"
                max="10"
                value={charge}
                onChange={(e) => setCharge(Number(e.target.value))}
                className="w-24 accent-[#1C1C1C] cursor-pointer"
              />
            </div>
            <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              V = W / Q = {(workDone / charge).toFixed(2)} V
            </span>
          </div>
        )}

        {activeSubject === 'dbms' && activeSubView === 'sql_join' && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#1C1C1C]">Join Type:</span>
            <button
              onClick={() => setJoinType('INNER')}
              className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold ${
                joinType === 'INNER' ? 'bg-[#1C1C1C] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              INNER
            </button>
            <button
              onClick={() => setJoinType('LEFT')}
              className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold ${
                joinType === 'LEFT' ? 'bg-[#1C1C1C] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              LEFT
            </button>
            <button
              onClick={() => setJoinType('RIGHT')}
              className={`px-2 py-0.5 text-[10px] rounded font-mono font-bold ${
                joinType === 'RIGHT' ? 'bg-[#1C1C1C] text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              RIGHT
            </button>
          </div>
        )}

        {activeSubject === 'mathematics' && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={mathFunction}
              onChange={(e) => setMathFunction(e.target.value as any)}
              className="bg-[#F9F8F6] border border-[#1C1C1C]/20 text-xs rounded-lg px-2 py-1 font-mono"
            >
              <option value="sine">f(x) = Sine Wave</option>
              <option value="parabola">f(x) = Parabola (x²)</option>
              <option value="cubic">f(x) = Polynomial (x³)</option>
              <option value="exponential">f(x) = Exponential (eˣ)</option>
            </select>
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] text-[#666666]">x value:</label>
              <input
                type="range"
                min="-8"
                max="8"
                step="0.2"
                value={xEval}
                onChange={(e) => setXEval(Number(e.target.value))}
                className="w-20 accent-[#1C1C1C] cursor-pointer"
              />
            </div>
          </div>
        )}

        {(activeSubView === 'concept_map' || activeSubView === 'er_schema' || activeSubView === 'respiration') && (
          <p className="text-[11px] text-[#666666] font-serif italic">
            {annotation || 'Interactive node diagram dynamically anchored to the current teaching lesson.'}
          </p>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-1.5 rounded-lg bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-[11px] font-semibold flex items-center gap-1"
          >
            {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAnimating ? 'Pause Dynamics' : 'Play Dynamics'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
