import React from 'react';
import { Flag, CheckCircle2, XCircle, Lightbulb, Info } from 'lucide-react';
import { McqQuestion, UserAnswerRecord } from '../../types/mcq';
import { MathText } from '../common/MathText';

interface QuestionCardProps {
  question: McqQuestion;
  questionNumber: number;
  totalQuestions: number;
  answerRecord?: UserAnswerRecord;
  mode: 'practice' | 'exam';
  onSelectOption: (optionIndex: number) => void;
  onToggleFlag: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  answerRecord,
  mode,
  onSelectOption,
  onToggleFlag,
}) => {
  const selectedIndex = answerRecord?.selectedOption ?? null;
  const isAnswered = selectedIndex !== null;
  const isFlagged = answerRecord?.flaggedForReview ?? false;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Question Header & Stem */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-neon-cyan/15 text-neon-cyan text-xs font-mono font-bold">
              QUESTION {questionNumber} OF {totalQuestions}
            </span>
            {question.topic && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 text-xs font-medium">
                {question.topic}
              </span>
            )}
            {question.difficulty && (
              <span className="text-[10px] font-mono uppercase text-slate-500">
                • {question.difficulty}
              </span>
            )}
          </div>

          {/* Flag for Review button */}
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs transition-all ${
              isFlagged
                ? 'bg-neon-amber/20 text-neon-amber border border-neon-amber/40 shadow-glow-amber'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-neon-amber' : ''}`} />
            <span>{isFlagged ? 'Flagged' : 'Flag for Review'}</span>
          </button>
        </div>

        {/* Question Stem Text */}
        <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
          <MathText text={question.question} />
        </div>
      </div>

      {/* Options Stack */}
      <div className="space-y-3">
        {question.options.map((optionText, optIndex) => {
          const letter = optionLetters[optIndex] || String(optIndex + 1);
          const isSelected = selectedIndex === optIndex;
          const isCorrectAnswer = optIndex === question.correct_answer;

          // Styling logic for Practice vs Exam mode
          let cardStyle =
            'bg-obsidian-900/70 border border-white/10 hover:border-white/20 text-slate-300';
          let letterBadgeStyle =
            'bg-obsidian-800 text-slate-400 border border-white/10';

          if (mode === 'practice' && isAnswered) {
            if (isCorrectAnswer) {
              cardStyle =
                'bg-neon-emerald/15 border-neon-emerald/70 text-slate-100 shadow-glow-emerald';
              letterBadgeStyle =
                'bg-neon-emerald text-obsidian-950 font-bold';
            } else if (isSelected && !isCorrectAnswer) {
              cardStyle =
                'bg-neon-rose/15 border-neon-rose/70 text-slate-100 shadow-glow-rose';
              letterBadgeStyle = 'bg-neon-rose text-white font-bold';
            } else {
              cardStyle = 'opacity-50 border-white/5 text-slate-500';
            }
          } else if (isSelected) {
            // Exam Mode selected
            cardStyle =
              'bg-neon-cyan/15 border-neon-cyan/70 text-slate-100 shadow-glow-cyan';
            letterBadgeStyle = 'bg-neon-cyan text-obsidian-950 font-bold';
          }

          return (
            <button
              key={optIndex}
              onClick={() => onSelectOption(optIndex)}
              disabled={mode === 'practice' && isAnswered}
              className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all duration-150 ${cardStyle} cursor-pointer group`}
            >
              {/* Option Letter Key */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono flex-shrink-0 transition-transform group-hover:scale-105 ${letterBadgeStyle}`}
              >
                {letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base leading-relaxed pt-0.5">
                <MathText text={optionText} />
              </div>

              {/* Practice Status Icon */}
              {mode === 'practice' && isAnswered && (
                <div className="flex-shrink-0 pt-0.5">
                  {isCorrectAnswer ? (
                    <CheckCircle2 className="w-5 h-5 text-neon-emerald" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-neon-rose" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Practice Mode: Animated Didactic Explanation Breakdown */}
      {mode === 'practice' && isAnswered && (
        <div className="glass-panel-glow rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-neon-cyan border-b border-white/[0.08] pb-2.5">
            <Lightbulb className="w-5 h-5 text-neon-amber" />
            <span className="text-sm font-bold tracking-wide font-mono uppercase">
              Didactic Rationale & Distractor Analysis
            </span>
          </div>

          {/* Primary Explanation */}
          {question.explanation && (
            <div className="p-3.5 rounded-xl bg-obsidian-950/80 border border-white/[0.06] text-xs text-slate-200 leading-relaxed">
              <div className="font-semibold text-neon-emerald mb-1 flex items-center gap-1 font-mono text-[11px] uppercase">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Why Option {optionLetters[question.correct_answer]} is Correct:</span>
              </div>
              <MathText text={question.explanation} />
            </div>
          )}

          {/* Dedicated Distractor Breakdowns */}
          {question.distractor_explanations &&
            question.distractor_explanations.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Distractor Breakdown:
                </div>
                <div className="space-y-1.5">
                  {question.distractor_explanations.map((reason, i) => {
                    const isRight = i === question.correct_answer;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
                          isRight
                            ? 'bg-neon-emerald/[0.06] border border-neon-emerald/20 text-slate-300'
                            : 'bg-white/[0.02] border border-white/[0.04] text-slate-400'
                        }`}
                      >
                        <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-white/5 flex-shrink-0">
                          Option {optionLetters[i]}
                        </span>
                        <div className="flex-1 leading-relaxed">
                          <MathText text={reason} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
