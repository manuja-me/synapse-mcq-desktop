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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/25 text-neon-cyan text-xs font-mono">
              <Award className="w-3.5 h-3.5" />
              <span>COGNITIVE DIAGNOSTIC REPORT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              {deck.title}
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Completed in {Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s • Mode: {mode.toUpperCase()}
            </p>
          </div>

          {/* Large Score Indicator */}
          <div className="flex flex-col items-center">
            <div
              className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl ${
                scorePercentage >= 80
                  ? 'border-neon-emerald bg-neon-emerald/10 shadow-glow-emerald text-neon-emerald'
                  : scorePercentage >= 60
                  ? 'border-neon-cyan bg-neon-cyan/10 shadow-glow-cyan text-neon-cyan'
                  : 'border-neon-amber bg-neon-amber/10 shadow-glow-amber text-neon-amber'
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/[0.05] text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Correct</div>
            <div className="text-xl font-bold text-neon-emerald font-mono mt-0.5">
              {correctCount} / {totalQuestions}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/[0.05] text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Missed</div>
            <div className="text-xl font-bold text-neon-rose font-mono mt-0.5">
              {missedIndices.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/[0.05] text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Avg Time / Q</div>
            <div className="text-xl font-bold text-neon-cyan font-mono mt-0.5">
              {avgSeconds}s
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-obsidian-950/70 border border-white/[0.05] text-center">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Flagged</div>
            <div className="text-xl font-bold text-neon-amber font-mono mt-0.5">
              {flaggedIndices.length}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-obsidian-900 hover:bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deck Library</span>
        </button>

        <button
          onClick={() => onRetakeQuiz(mode)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-cyan text-xs font-semibold"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retake Full Test ({mode})</span>
        </button>

        {missedIndices.length > 0 && (
          <button
            onClick={() => onRetakeMissedOnly(missedIndices)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-violet text-xs font-semibold"
          >
            <Layers className="w-4 h-4" />
            <span>Drill {missedIndices.length} Missed Questions</span>
          </button>
        )}
      </div>

      {/* Topic Breakdown Card */}
      {Object.keys(topicStats).length > 0 && (
        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200 border-b border-white/[0.08] pb-2.5">
            <BarChart3 className="w-4 h-4 text-neon-cyan" />
            <span>Mastery by Topic</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {Object.entries(topicStats).map(([topic, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{topic}</span>
                    <span className="font-mono text-slate-400">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-obsidian-950 overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 80 ? 'bg-neon-emerald' : pct >= 50 ? 'bg-neon-cyan' : 'bg-neon-amber'
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="text-sm font-bold font-mono tracking-wider text-slate-200 uppercase">
            Question-by-Question Review ({displayedIndices.length})
          </div>

          {/* Review Filter Pills */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterMode === 'all'
                  ? 'bg-white/15 text-white font-bold'
                  : 'bg-obsidian-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('missed')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterMode === 'missed'
                  ? 'bg-neon-rose/25 text-neon-rose border border-neon-rose/40 font-bold'
                  : 'bg-obsidian-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              Missed ({missedIndices.length})
            </button>
            <button
              onClick={() => setFilterMode('flagged')}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                filterMode === 'flagged'
                  ? 'bg-neon-amber/25 text-neon-amber border border-neon-amber/40 font-bold'
                  : 'bg-obsidian-900 text-slate-400 hover:text-slate-200'
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
                className="glass-card rounded-2xl p-4 space-y-3 transition-all cursor-pointer"
                onClick={() => toggleExpand(qIdx)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-neon-emerald flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-neon-rose flex-shrink-0" />
                    )}
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Q{qIdx + 1}
                    </span>
                    {q.topic && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                        {q.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ans?.flaggedForReview && (
                      <Flag className="w-3.5 h-3.5 text-neon-amber fill-neon-amber" />
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-sm font-medium text-slate-200">
                  <MathText text={q.question} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div
                    className="pt-3 border-t border-white/[0.06] space-y-3 animate-in fade-in duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Options List */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = ans?.selectedOption === optIdx;
                        const isRight = optIdx === q.correct_answer;

                        let optStyle = 'bg-obsidian-950/60 border-white/5 text-slate-400';
                        if (isRight) {
                          optStyle = 'bg-neon-emerald/15 border-neon-emerald/50 text-slate-100 font-medium';
                        } else if (isChosen && !isRight) {
                          optStyle = 'bg-neon-rose/15 border-neon-rose/50 text-slate-200';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-white/5">
                                {optionLetters[optIdx]}
                              </span>
                              <span><MathText text={opt} /></span>
                            </div>
                            {isRight && (
                              <span className="text-[10px] font-mono text-neon-emerald font-bold">
                                Correct Answer
                              </span>
                            )}
                            {isChosen && !isRight && (
                              <span className="text-[10px] font-mono text-neon-rose font-bold">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanations */}
                    {q.explanation && (
                      <div className="p-3 rounded-xl bg-obsidian-950 border border-white/[0.08] text-xs text-slate-300 leading-relaxed">
                        <div className="font-semibold text-neon-cyan font-mono text-[11px] mb-1">
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
