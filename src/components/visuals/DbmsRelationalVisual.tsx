import React, { useState, useEffect } from 'react';
import { Database, Filter, Columns, Check, AlertTriangle, ArrowRight } from 'lucide-react';

interface DbmsRelationalVisualProps {
  initialOp?: 'base' | 'selection' | 'projection';
  highlightTarget?: string;
  annotation?: string;
}

interface StudentRow {
  id: number;
  name: string;
  dept: string;
  gpa: number;
  city: string;
}

const SAMPLE_STUDENTS: StudentRow[] = [
  { id: 101, name: 'Aarav Sharma', dept: 'CS', gpa: 3.9, city: 'Delhi' },
  { id: 102, name: 'Diya Patel', dept: 'EE', gpa: 3.4, city: 'Mumbai' },
  { id: 103, name: 'Rohan Gupta', dept: 'CS', gpa: 3.8, city: 'Bengaluru' },
  { id: 104, name: 'Ananya Verma', dept: 'ME', gpa: 3.2, city: 'Pune' },
  { id: 105, name: 'Priya Nair', dept: 'CS', gpa: 4.0, city: 'Chennai' }
];

export const DbmsRelationalVisual: React.FC<DbmsRelationalVisualProps> = ({
  initialOp = 'selection',
  highlightTarget,
  annotation
}) => {
  const [operator, setOperator] = useState<'base' | 'selection' | 'projection'>(initialOp);
  const [filterDept, setFilterDept] = useState<'CS' | 'EE' | 'ALL'>('CS');

  useEffect(() => {
    if (initialOp) {
      setOperator(initialOp);
    }
  }, [initialOp]);

  const filteredRows = SAMPLE_STUDENTS.filter((s) => {
    if (operator !== 'selection') return true;
    return filterDept === 'ALL' || s.dept === filterDept;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[#FFFFFF] rounded-2xl p-4 overflow-hidden text-[#1C1C1C]" id="dbms-relational-visual">
      {/* Top Header & Operator Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1C1C1C]/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#1C1C1C] flex items-center gap-2">
              <span>Relational Algebra Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/15">
                σ vs π
              </span>
            </h3>
            <p className="text-[11px] text-[#666666] font-sans">
              Interactive Horizontal Rows (Selection) vs Vertical Columns (Projection)
            </p>
          </div>
        </div>

        {/* Operator Selectors */}
        <div className="flex items-center gap-1 bg-[#F2EFEB] p-1 rounded-xl border border-[#1C1C1C]/15">
          <button
            onClick={() => setOperator('base')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              operator === 'base'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            Base Table
          </button>
          <button
            onClick={() => setOperator('selection')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              operator === 'selection'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Selection σ</span>
          </button>
          <button
            onClick={() => setOperator('projection')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
              operator === 'projection'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'text-[#666666] hover:text-[#1C1C1C]'
            }`}
          >
            <Columns className="w-3 h-3" />
            <span>Projection π</span>
          </button>
        </div>
      </div>

      {/* Operator Equation Formula Banner */}
      <div className="my-2 px-3 py-1.5 rounded-xl bg-[#F9F8F6] border border-[#1C1C1C]/15 flex items-center justify-between text-xs font-mono">
        <div className="text-[#1C1C1C]">
          {operator === 'base' && <span className="text-[#666666]">Relation Schema: STUDENTS(id, name, dept, gpa, city)</span>}
          {operator === 'selection' && (
            <span>
              Query: <strong className="text-[#1C1C1C]">σ_(dept = "{filterDept}")(STUDENTS)</strong> → Horizontal Row Slicing
            </span>
          )}
          {operator === 'projection' && (
            <span>
              Query: <strong className="text-[#1C1C1C]">π_(name, gpa)(STUDENTS)</strong> → Vertical Column Extraction
            </span>
          )}
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#F2EFEB] text-[#666666] font-mono border border-[#1C1C1C]/10">
          {operator === 'selection' ? 'Filters Rows' : operator === 'projection' ? 'Filters Columns' : '5 Tuples'}
        </span>
      </div>

      {/* Axis Clarification Alert (Prevents Common Exam Misconception!) */}
      <div className="mb-2.5 grid grid-cols-2 gap-2 text-[11px]">
        <div className={`p-2.5 rounded-xl border transition-all ${operator === 'selection' ? 'bg-[#F2EFEB] border-[#1C1C1C] text-[#1C1C1C]' : 'bg-[#F9F8F6] border-[#1C1C1C]/10 text-[#666666]'}`}>
          <div className="font-bold flex items-center gap-1.5 mb-0.5 font-serif">
            <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
            Selection (σ) = Horizontal Rows
          </div>
          <div>Filters tuples based on condition. All attributes kept.</div>
        </div>
        <div className={`p-2.5 rounded-xl border transition-all ${operator === 'projection' ? 'bg-[#F2EFEB] border-[#1C1C1C] text-[#1C1C1C]' : 'bg-[#F9F8F6] border-[#1C1C1C]/10 text-[#666666]'}`}>
          <div className="font-bold flex items-center gap-1.5 mb-0.5 font-serif">
            <span className="w-2 h-2 rounded-full bg-[#1C1C1C]" />
            Projection (π) = Vertical Columns
          </div>
          <div>Selects specific columns. Automatic duplicate removal.</div>
        </div>
      </div>

      {/* Interactive Relational Table */}
      <div className="flex-1 overflow-x-auto rounded-xl border border-[#1C1C1C]/15 bg-[#FFFFFF] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#1C1C1C]/15 bg-[#F2EFEB] text-[#1C1C1C] font-serif">
              {operator !== 'projection' && <th className="py-2.5 px-3 font-bold">id</th>}
              <th className={`py-2.5 px-3 font-bold ${operator === 'projection' ? 'bg-[#E2DED6] text-[#1C1C1C]' : ''}`}>
                name
              </th>
              {operator !== 'projection' && <th className="py-2.5 px-3 font-bold">dept</th>}
              <th className={`py-2.5 px-3 font-bold ${operator === 'projection' ? 'bg-[#E2DED6] text-[#1C1C1C]' : ''}`}>
                gpa
              </th>
              {operator !== 'projection' && <th className="py-2.5 px-3 font-bold">city</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1C1C1C]/10">
            {SAMPLE_STUDENTS.map((student) => {
              const isMatch = operator === 'selection' ? student.dept === filterDept : true;

              return (
                <tr
                  key={student.id}
                  className={`transition-colors duration-200 ${
                    operator === 'selection' && isMatch
                      ? 'bg-[#FEF3C7] text-[#1C1C1C] font-medium'
                      : operator === 'selection' && !isMatch
                      ? 'opacity-30 bg-[#F9F8F6] text-[#888888]'
                      : 'hover:bg-[#F9F8F6] text-[#1C1C1C]'
                  }`}
                >
                  {operator !== 'projection' && <td className="py-2 px-3 font-mono text-[#666666]">{student.id}</td>}
                  <td className={`py-2 px-3 font-medium ${operator === 'projection' ? 'bg-[#F2EFEB] font-bold text-[#1C1C1C]' : ''}`}>
                    {student.name}
                  </td>
                  {operator !== 'projection' && (
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${student.dept === 'CS' ? 'bg-[#F2EFEB] text-[#1C1C1C] border-[#1C1C1C]/20' : 'bg-[#F9F8F6] text-[#666666] border-[#1C1C1C]/10'}`}>
                        {student.dept}
                      </span>
                    </td>
                  )}
                  <td className={`py-2 px-3 font-mono ${operator === 'projection' ? 'bg-[#F2EFEB] font-bold text-[#1C1C1C]' : ''}`}>
                    {student.gpa.toFixed(1)}
                  </td>
                  {operator !== 'projection' && <td className="py-2 px-3 text-[#666666]">{student.city}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dynamic Sub-Controls */}
      {operator === 'selection' && (
        <div className="mt-3 flex items-center justify-between bg-[#F9F8F6] p-2.5 rounded-xl border border-[#1C1C1C]/15 text-xs">
          <span className="text-[#1C1C1C] font-semibold font-serif">Filter Predicate (dept = ?):</span>
          <div className="flex gap-1.5">
            {(['CS', 'EE', 'ALL'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDept(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  filterDept === d
                    ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                    : 'bg-[#F2EFEB] text-[#1C1C1C] hover:bg-[#E6E3DB] border border-[#1C1C1C]/10'
                }`}
              >
                dept = '{d}'
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Visual Annotation */}
      {annotation && (
        <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-serif italic flex items-center gap-2">
          <Check className="w-4 h-4 text-[#1C1C1C] shrink-0" />
          <span>{annotation}</span>
        </div>
      )}
    </div>
  );
};
