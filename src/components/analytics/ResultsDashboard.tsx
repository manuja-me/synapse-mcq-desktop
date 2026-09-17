import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Clock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flag,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Filter,
  BarChart3,
  Layers
} from 'lucide-react';
import { McqDeck, UserAnswerRecord } from '../../types/mcq';
import { MathText } from '../common/MathText';

interface ResultsDashboardProps {
  deck: McqDeck;
  answers: Record<number, UserAnswerRecord>;
  elapsedSeconds: number;
  mode: 'practice' | 'exam';
  onRetakeQuiz: (mode: 'practice' | 'exam') => void;
  onRetakeMissedOnly: (missedQuestions: number[]) => void;
  onBackToLibrary: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  deck,
  answers,
  elapsedSeconds,
  mode,
  onRetakeQuiz,
  onRetakeMissedOnly,
  onBackToLibrary,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'missed' | 'flagged'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const totalQuestions = deck.questions.length;
  let correctCount = 0;
  const missedIndices: number[] = [];
  const flaggedIndices: number[] = [];

  for (let i = 0; i < totalQuestions; i++) {
    const rec = answers[i];
    if (rec?.isCorrect) {
      correctCount++;
    } else {
      missedIndices.push(i);
    }
    if (rec?.flaggedForReview) {
      flaggedIndices.push(i);
    }
  }

  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  const avgSeconds = totalQuestions > 0 ? Math.round(elapsedSeconds / totalQuestions) : 0;

  // Trigger celebration confetti on high score
  useEffect(() => {
    if (scorePercentage >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00F0FF', '#8B5CF6', '#10B981'],
      });
    }
  }, [scorePercentage]);

  // Performance by Topic breakdown
  const topicStats: Record<string, { total: number; correct: number }> = {};
  deck.questions.forEach((q, idx) => {
    const topic = q.topic || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0 };
    }
    topicStats[topic].total++;
    if (answers[idx]?.isCorrect) {
      topicStats[topic].correct++;
    }
  });

  const toggleExpand = (index: number) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const displayedIndices = Array.from({ length: totalQuestions })
    .map((_, i) => i)
    .filter((idx) => {
      if (filterMode === 'missed') return missedIndices.includes(idx);
      if (filterMode === 'flagged') return flaggedIndices.includes(idx);
      return true;
    });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Score Gauge */}
      <div className="bg-[#121215] border border-[#27272A] p-6 sm:p-8 relative">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[#10B981] text-xs font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>COGNITIVE DIAGNOSTIC REPORT</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 font-mono">
              {deck.title}
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              Completed in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s • MODE: {mode.toUpperCase()}
            </p>
          </div>

          {/* Large Score Indicator (Square Pointed) */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-28 border-2 flex flex-col items-center justify-center ${
                scorePercentage >= 80
                  ? 'border-[#10B981] bg-[#10B981]/10 text-[#10B981]'
                  : scorePercentage >= 60
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : 'border-amber-500 bg-amber-500/10 text-amber-400'
              }`}
            >
              <span className="text-3xl font-extrabold font-mono">{scorePercentage}%</span>
              <span className="text-[10px] font-mono tracking-widest uppercase opacity-80">
                {scorePercentage >= 80 ? 'Mastery' : scorePercentage >= 60 ? 'Proficient' : 'Needs Review'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#27272A]">
          <div className="p-3 bg-[#18181B] border border-[#27272A] text-center">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Correct</div>
            <div className="text-xl font-bold text-[#10B981] font-mono mt-0.5">
              {correctCount} / {totalQuestions}
            </div>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#27272A] text-center">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Missed</div>
            <div className="text-xl font-bold text-red-400 font-mono mt-0.5">
              {missedIndices.length}
            </div>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#27272A] text-center">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Avg Time / Q</div>
            <div className="text-xl font-bold text-zinc-200 font-mono mt-0.5">
              {avgSeconds}s
            </div>
          </div>

          <div className="p-3 bg-[#18181B] border border-[#27272A] text-center">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Flagged</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {flaggedIndices.length}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold font-mono text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO LIBRARY</span>
        </button>

        <button
          onClick={() => onRetakeQuiz(mode)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETAKE TEST ({mode.toUpperCase()})</span>
        </button>

        {missedIndices.length > 0 && (
          <button
            onClick={() => onRetakeMissedOnly(missedIndices)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 text-xs font-semibold font-mono transition-colors"
          >
            <Layers className="w-4 h-4 text-[#10B981]" />
            <span>DRILL {missedIndices.length} MISSED QUESTIONS</span>
          </button>
        )}
      </div>

      {/* Topic Breakdown Card */}
      {Object.keys(topicStats).length > 0 && (
        <div className="bg-[#121215] border border-[#27272A] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 border-b border-[#27272A] pb-2.5 font-mono uppercase">
            <BarChart3 className="w-4 h-4 text-[#10B981]" />
            <span>Mastery by Topic</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(topicStats).map(([topic, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 font-mono">{topic}</span>
                    <span className="font-mono text-zinc-400">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#18181B] border border-[#27272A]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        pct >= 80 ? 'bg-[#10B981]' : pct >= 50 ? 'bg-cyan-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Questions Review Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3">
          <div className="text-xs font-bold font-mono tracking-wider text-zinc-200 uppercase">
            Question-by-Question Review ({displayedIndices.length})
          </div>

          {/* Review Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                filterMode === 'all'
                  ? 'bg-zinc-200 text-zinc-900 font-bold'
                  : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('missed')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                filterMode === 'missed'
                  ? 'bg-red-500 text-white font-bold'
                  : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
              }`}
            >
              Missed ({missedIndices.length})
            </button>
            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                filterMode === 'flagged'
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
              }`}
            >
              Flagged ({flaggedIndices.length})
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-3">
          {displayedIndices.map((qIdx) => {
            const q = deck.questions[qIdx];
            const ans = answers[qIdx];
            const isCorrect = ans?.isCorrect ?? false;
            const isExpanded = expandedQuestions[qIdx] ?? false;

            return (
              <div
                key={qIdx}
                className="bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] p-4 space-y-3 transition-colors cursor-pointer"
                onClick={() => toggleExpand(qIdx)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      Q{qIdx + 1}
                    </span>
                    {q.topic && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 font-mono">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ans?.flaggedForReview && (
                      <Flag className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-sm font-medium text-zinc-200">
                  <MathText text={q.question} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="pt-3 border-t border-[#27272A] space-y-3 animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Options List */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = ans?.selectedOption === optIdx;
                        const isRight = optIdx === q.correct_answer;

                        let optStyle = 'bg-[#18181B] border border-[#27272A] text-zinc-400';
                        if (isRight) {
                          optStyle = 'bg-[#10B981]/15 border border-[#10B981] text-zinc-100 font-medium';
                        } else if (isChosen && !isRight) {
                          optStyle = 'bg-red-500/15 border border-red-500 text-zinc-200';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold px-1.5 py-0.5 bg-[#09090B] border border-[#27272A]">
                                {optionLetters[optIdx]}
                              </span>
                              <span><MathText text={opt} /></span>
                            </div>
                            {isRight && (
                              <span className="text-[10px] font-mono text-[#10B981] font-bold">
                                Correct Answer
                              </span>
                            )}
                            {isChosen && !isRight && (
                              <span className="text-[10px] font-mono text-red-400 font-bold">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanations */}
                    {q.explanation && (
                      <div className="p-3 bg-[#09090B] border border-[#27272A] text-xs text-zinc-300 leading-relaxed font-mono">
                        <div className="font-semibold text-[#10B981] text-[11px] mb-1">
                          Rationale:
                        </div>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
