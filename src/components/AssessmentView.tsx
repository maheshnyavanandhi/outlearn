import React, { useState } from 'react';
import { LessonPlan, LearnerProfile, AssessmentItem, LearningReport } from '../types';
import { Award, CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AssessmentViewProps {
  lessonPlan: LessonPlan;
  learnerProfile: LearnerProfile;
  onCompleteAssessment: (report: LearningReport) => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  lessonPlan,
  learnerProfile,
  onCompleteAssessment
}) => {
  // Synthesize realistic assessment items for the lesson's subject
  const assessmentItems: AssessmentItem[] = lessonPlan.subject === 'physics'
    ? [
        {
          id: 'q1',
          conceptId: 'c-voltage',
          conceptName: 'Electric Potential Difference',
          type: 'mcq',
          question: 'What unit is used to measure electrical potential difference or voltage?',
          options: ['Amperes (A)', 'Volts (V)', 'Ohms (Ω)', 'Watts (W)'],
          correctAnswer: 'Volts (V)',
          explanation: 'Potential difference is measured in Volts, defined as Joules of work per Coulomb of charge (1 V = 1 J/C).'
        },
        {
          id: 'q2',
          conceptId: 'c-resistance-ohms-law',
          conceptName: 'Ohm\'s Law & Resistance',
          type: 'calculation',
          question: 'If a 12V battery is connected across a 4Ω resistor, what is the current flowing through the circuit?',
          options: ['48 Amperes', '3 Amperes', '16 Amperes', '0.33 Amperes'],
          correctAnswer: '3 Amperes',
          explanation: 'Using Ohm\'s Law: I = V / R = 12V / 4Ω = 3 Amperes.'
        },
        {
          id: 'q3',
          conceptId: 'c-resistance-ohms-law',
          conceptName: 'Inverse Proportionality',
          type: 'conceptual',
          question: 'When voltage is held constant, what happens to the current if the circuit resistance is tripled?',
          options: [
            'Current is reduced to one-third of its original value',
            'Current triples',
            'Current remains unchanged',
            'Voltage triples'
          ],
          correctAnswer: 'Current is reduced to one-third of its original value',
          explanation: 'Since Current is inversely proportional to Resistance (I = V/R), multiplying R by 3 divides I by 3.'
        }
      ]
    : lessonPlan.subject === 'dbms'
    ? [
        {
          id: 'q1',
          conceptId: 'c-dbms-selection',
          conceptName: 'Selection Operator (σ)',
          type: 'conceptual',
          question: 'Which dimension of a relation does the Selection operator (σ) filter?',
          options: ['Vertical Columns', 'Horizontal Rows (Tuples)', 'Both Rows and Columns', 'Database Indices'],
          correctAnswer: 'Horizontal Rows (Tuples)',
          explanation: 'Selection (σ) is a horizontal operator that evaluates each row against a predicate condition.'
        },
        {
          id: 'q2',
          conceptId: 'c-dbms-projection',
          conceptName: 'Projection Operator (π)',
          type: 'mcq',
          question: 'What happens to duplicate tuples when the Projection operator (π) is executed in pure Relational Algebra?',
          options: [
            'Duplicates are retained as a multiset',
            'Duplicates are automatically eliminated because relations are sets',
            'An SQL error is thrown',
            'All rows are cleared'
          ],
          correctAnswer: 'Duplicates are automatically eliminated because relations are sets',
          explanation: 'By definition in relational algebra, relations are mathematical sets, so Projection automatically eliminates duplicates.'
        }
      ]
    : [
        {
          id: 'q1',
          conceptId: 'c-general-1',
          conceptName: 'Core Principles',
          type: 'conceptual',
          question: `Which statement best describes the fundamental principle of ${lessonPlan.topic}?`,
          options: [
            'It establishes mathematical conservation and equilibrium',
            'It eliminates all external factors permanently',
            'It only applies in laboratory vacuums',
            'It operates independently of physical laws'
          ],
          correctAnswer: 'It establishes mathematical conservation and equilibrium',
          explanation: 'Foundational laws preserve balance between opposing and driving forces.'
        }
      ];

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectOption = (qId: string, option: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleSubmitAssessment = () => {
    setIsSubmitted(true);

    let correctCount = 0;
    const weakConcepts: string[] = [];
    const strongConcepts: string[] = [];

    assessmentItems.forEach((item) => {
      const isCorrect = answers[item.id] === item.correctAnswer;
      if (isCorrect) {
        correctCount++;
        strongConcepts.push(item.conceptName);
      } else {
        weakConcepts.push(item.conceptName);
      }
    });

    const scorePct = Math.round((correctCount / assessmentItems.length) * 100);

    if (scorePct >= 70) {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }

    // Build comprehensive learning report matching PDF format
    const report: LearningReport = {
      lessonId: lessonPlan.id,
      topic: lessonPlan.topic,
      scorePercentage: scorePct,
      timeSpentMinutes: lessonPlan.totalMinutes,
      strongConcepts: strongConcepts.length > 0 ? strongConcepts : ['Foundational Recall'],
      needsImprovement: weakConcepts.length > 0 ? weakConcepts : ['None — Mastery Achieved!'],
      identifiedMisconceptions: weakConcepts.length > 0
        ? ['Inverse relationship intuition', 'Axis definition confusion']
        : [],
      actionableRecommendation: weakConcepts.length > 0
        ? `Revise ${weakConcepts.join(' and ')} and complete two additional visual simulation experiments.`
        : 'Outstanding grasp! You are ready to advance to the next module in this track.',
      recommendedNextTopic: lessonPlan.subject === 'physics'
        ? 'Electric Power, Heating Effect of Current & Joule\'s Law'
        : lessonPlan.subject === 'dbms'
        ? 'Cartesian Product, Joins, and Relational Calculus'
        : 'Advanced Practical Implementation',
      sevenDayStudyPlan: [
        { day: 1, title: 'Day 1: Concept Solidification', focus: 'Review key formulas and core definitions', tasks: ['Review lesson summary notes', 'Recalculate example problems'] },
        { day: 2, title: 'Day 2: Active Recall Quiz', focus: 'Spaced retrieval practice', tasks: ['Complete 5 practice flashcards', 'Teach the concept aloud for 2 minutes'] },
        { day: 4, title: 'Day 4: Boundary Cases & Traps', focus: 'Deepening edge case intuition', tasks: ['Analyze common exam trap questions'] },
        { day: 7, title: 'Day 7: Final Synthesis', focus: 'Long-term memory retention check', tasks: ['Take cumulative 10-minute quiz'] }
      ],
      flashcards: [
        { front: 'Ohm\'s Law Formula', back: 'V = I × R (Voltage = Current × Resistance)', category: 'Formula' },
        { front: 'What happens to Current if Resistance increases?', back: 'Current decreases inversely (I = V/R), like a constricted water pipe.', category: 'Concept' },
        { front: 'Selection (σ) vs Projection (π)', back: 'Selection filters horizontal rows; Projection extracts vertical columns.', category: 'Database' }
      ],
      summaryNotesMarkdown: `# Master Notes: ${lessonPlan.topic}\n\n## 1. Core Principles\n- **Foundations**: Direct vs inverse relationships govern real-world dynamical systems.\n- **Key Equation**: $V = I \\times R$\n\n## 2. Common Misconceptions to Avoid\n- Never confuse increasing resistance with increasing flow. Resistance is opposition!\n- In Relational Algebra, Selection filters tuples (rows), while Projection filters attributes (columns).`
    };

    onCompleteAssessment(report);
  };

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === assessmentItems.length;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4" id="assessment-view-root">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 p-2 rounded-2xl bg-[#F2EFEB] text-[#1C1C1C] border border-[#1C1C1C]/15 mb-3 shadow-sm">
          <Award className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-serif font-black text-[#1C1C1C] tracking-tight">
          Knowledge Evaluation & Concept Checkpoint
        </h1>
        <p className="text-xs sm:text-sm text-[#555555] font-serif italic mt-1.5">
          Evaluating your comprehension of: <strong className="text-[#1C1C1C] font-semibold not-italic">{lessonPlan.topic}</strong>
        </p>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {assessmentItems.map((item, idx) => {
          const selected = answers[item.id];
          const isCorrect = selected === item.correctAnswer;

          return (
            <div
              key={item.id}
              className="bg-[#FFFFFF] rounded-2xl border border-[#1C1C1C]/15 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-[#1C1C1C]">
                  QUESTION {idx + 1} OF {assessmentItems.length}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-[#F2EFEB] text-[#1C1C1C] font-mono border border-[#1C1C1C]/10">
                  {item.conceptName}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C1C1C] mb-4">
                {item.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {item.options?.map((opt, oIdx) => {
                  const isThisSelected = selected === opt;

                  let optClass = 'bg-[#F9F8F6] border-[#1C1C1C]/15 text-[#1C1C1C] hover:bg-[#F2EFEB]';
                  if (isSubmitted) {
                    if (opt === item.correctAnswer) {
                      optClass = 'bg-[#D1FAE5] border-[#10B981] text-[#065F46] font-bold';
                    } else if (isThisSelected && !isCorrect) {
                      optClass = 'bg-[#FEE2E2] border-[#EF4444] text-[#991B1B]';
                    }
                  } else if (isThisSelected) {
                    optClass = 'bg-[#1C1C1C] border-[#1C1C1C] text-[#F9F8F6] font-semibold shadow-sm';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(item.id, opt)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between font-sans ${optClass}`}
                    >
                      <span>{opt}</span>
                      {isSubmitted && opt === item.correctAnswer && (
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                      )}
                      {isSubmitted && isThisSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Post-submission explanation */}
              {isSubmitted && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#F4F1EA] border border-[#1C1C1C]/15 text-xs text-[#1C1C1C] font-serif">
                  <strong className="text-[#1C1C1C] font-sans font-bold">Pedagogical Explanation: </strong>
                  {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSubmitAssessment}
          disabled={!isComplete || isSubmitted}
          className="px-6 py-3 rounded-xl bg-[#1C1C1C] hover:bg-[#2C2C2C] disabled:opacity-40 text-[#F9F8F6] font-semibold text-sm shadow-md flex items-center gap-2 transition-all font-sans"
        >
          <span>Calculate Results & Generate Learning Report</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
