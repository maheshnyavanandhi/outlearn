import React, { useState } from 'react';
import { LearningReport } from '../types';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Layers,
  FileText,
  ArrowRight,
  RotateCw,
  Copy,
  Check
} from 'lucide-react';

interface LearningReportViewProps {
  report: LearningReport;
  onContinueLearningPath: () => void;
  onStartNewLesson: () => void;
}

export const LearningReportView: React.FC<LearningReportViewProps> = ({
  report,
  onContinueLearningPath,
  onStartNewLesson
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plan' | 'flashcards' | 'notes'>('overview');
  const [flippedCardIdx, setFlippedCardIdx] = useState<number | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);

  const handleCopyNotes = () => {
    navigator.clipboard.writeText(report.summaryNotesMarkdown);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" id="learning-report-root">
      {/* Top Completion Header */}
      <div className="bg-[#FFFFFF] border border-[#1C1C1C]/15 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15 text-xs font-mono font-semibold mb-3">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Teaching Session & Assessment Complete</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1C1C] tracking-tight">
              Personalized Learning Report
            </h1>
            <p className="text-sm text-[#666666] font-serif italic mt-1">
              Topic: <strong className="text-[#1C1C1C] font-semibold not-italic">{report.topic}</strong>
            </p>
          </div>

          {/* Mastered Score Dial */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F9F8F6] border border-[#1C1C1C]/15 min-w-[130px] shadow-sm">
            <div className="text-3xl sm:text-4xl font-serif font-black text-[#1C1C1C]">
              {report.scorePercentage}%
            </div>
            <div className="text-[11px] text-[#666666] uppercase font-mono font-bold tracking-wider mt-1">
              Mastery Score
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[#1C1C1C]/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'bg-[#F2EFEB] text-[#666666] hover:text-[#1C1C1C] border border-[#1C1C1C]/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Overview & Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'plan'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'bg-[#F2EFEB] text-[#666666] hover:text-[#1C1C1C] border border-[#1C1C1C]/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7-Day Study Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'flashcards'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'bg-[#F2EFEB] text-[#666666] hover:text-[#1C1C1C] border border-[#1C1C1C]/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spaced Flashcards</span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'notes'
                ? 'bg-[#1C1C1C] text-[#F9F8F6] shadow-sm'
                : 'bg-[#F2EFEB] text-[#666666] hover:text-[#1C1C1C] border border-[#1C1C1C]/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Master Notes</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview matching PDF Section 13/19 exact format */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Exact PDF Format Card */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#1C1C1C]/15 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs uppercase font-mono font-bold text-[#1C1C1C] tracking-wider mb-4">
              Pedagogical Assessment Summary
            </h2>

            <div className="space-y-4 text-sm font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1C1C1C]/10 gap-1">
                <span className="text-[#666666] font-serif">Topic:</span>
                <strong className="text-[#1C1C1C] font-serif font-bold">{report.topic}</strong>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1C1C1C]/10 gap-1">
                <span className="text-[#666666] font-serif">Assessment Score:</span>
                <span className="text-[#1C1C1C] font-serif font-black text-base">{report.scorePercentage}%</span>
              </div>

              {/* Strong Areas */}
              <div className="pb-3 border-b border-[#1C1C1C]/10">
                <span className="text-[#666666] font-serif block mb-1.5">Strong Areas:</span>
                <div className="flex flex-wrap gap-2">
                  {report.strongConcepts.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#F2EFEB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs font-mono flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Needs Improvement */}
              <div className="pb-3 border-b border-[#1C1C1C]/10">
                <span className="text-[#666666] font-serif block mb-1.5">Needs Improvement:</span>
                <div className="flex flex-wrap gap-2">
                  {report.needsImprovement.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#FEF3C7] border border-[#F59E0B]/30 text-[#92400E] text-xs font-mono flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendation */}
              <div className="pt-1">
                <span className="text-[#666666] font-serif block mb-1.5">Recommendation:</span>
                <div className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs sm:text-sm font-serif leading-relaxed flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                  <span>{report.actionableRecommendation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Recommended Topic Callout */}
          <div className="bg-[#F4F1EA] rounded-3xl border border-[#1C1C1C]/15 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#666666]">
                Suggested Next Step
              </span>
              <h3 className="text-lg font-serif font-bold text-[#1C1C1C] mt-0.5">
                {report.recommendedNextTopic}
              </h3>
              <p className="text-xs text-[#555555] font-serif italic mt-1">
                Based on your mastery profile, this topic builds directly on what you proved today.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onContinueLearningPath}
                className="px-5 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] text-[#F9F8F6] font-semibold text-xs shadow-sm flex items-center gap-2 transition-all whitespace-nowrap"
              >
                <span>Continue Learning Path</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onStartNewLesson}
                className="px-4 py-2.5 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] text-[#1C1C1C] border border-[#1C1C1C]/15 text-xs font-semibold transition-all"
              >
                New Topic
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 7-Day Study Plan */}
      {activeTab === 'plan' && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#1C1C1C]/15 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-xs uppercase font-mono font-bold text-[#1C1C1C] tracking-wider mb-2">
            AI-Generated 7-Day Spaced Revision Roadmap
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {report.sevenDayStudyPlan.map((day) => (
              <div
                key={day.day}
                className="bg-[#F9F8F6] rounded-2xl border border-[#1C1C1C]/15 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F2EFEB] text-[#1C1C1C] font-mono text-xs font-bold border border-[#1C1C1C]/15">
                    Day {day.day}
                  </span>
                  <span className="text-xs font-serif font-bold text-[#1C1C1C]">{day.title}</span>
                </div>
                <p className="text-xs text-[#666666] font-serif italic mb-3">{day.focus}</p>
                <ul className="space-y-1.5 text-xs text-[#333333]">
                  {day.tasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1C1C]" />
                      <span className="font-sans">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Spaced Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#1C1C1C]/15 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-mono font-bold text-[#1C1C1C] tracking-wider">
              Concept Mastery Flashcards (Click to Flip)
            </h2>
            <span className="text-xs font-mono text-[#666666]">{report.flashcards.length} cards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {report.flashcards.map((card, idx) => {
              const isFlipped = flippedCardIdx === idx;

              return (
                <div
                  key={idx}
                  onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                  className="cursor-pointer h-48 bg-[#F9F8F6] rounded-2xl border border-[#1C1C1C]/15 hover:border-[#1C1C1C]/40 p-5 flex flex-col justify-between transition-all duration-300 transform hover:scale-[1.01] select-none shadow-sm"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#666666] uppercase font-mono">
                    <span>{card.category}</span>
                    <span className="flex items-center gap-1 text-[#1C1C1C] font-semibold">
                      <RotateCw className="w-3 h-3" />
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>
                  </div>

                  <div className="my-auto text-center">
                    {isFlipped ? (
                      <p className="text-xs font-serif text-[#1C1C1C] font-medium leading-relaxed italic">
                        {card.back}
                      </p>
                    ) : (
                      <p className="text-sm font-serif font-bold text-[#1C1C1C]">
                        {card.front}
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] text-[#888888] text-center font-sans">
                    {isFlipped ? 'Click to flip back' : 'Click to reveal explanation'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Master Notes */}
      {activeTab === 'notes' && (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#1C1C1C]/15 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs uppercase font-mono font-bold text-[#1C1C1C] tracking-wider">
              Structured Lesson Notes (Markdown)
            </h2>
            <button
              onClick={handleCopyNotes}
              className="px-3.5 py-1.5 rounded-xl bg-[#F2EFEB] hover:bg-[#E6E3DB] border border-[#1C1C1C]/15 text-[#1C1C1C] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copiedNotes ? <Check className="w-3.5 h-3.5 text-[#059669]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedNotes ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-[#F9F8F6] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {report.summaryNotesMarkdown}
          </pre>
        </div>
      )}
    </div>
  );
};
