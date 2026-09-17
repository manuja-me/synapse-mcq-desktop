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
      <div className="bg-[#121215] border border-[#27272A] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[#10B981] text-xs font-mono font-bold">
              QUESTION {questionNumber} OF {totalQuestions}
            </span>
            {question.topic && (
              <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 text-xs font-mono">
                {question.topic}
              </span>
            )}
            {question.difficulty && (
              <span className="text-[10px] font-mono uppercase text-zinc-500">
                • {question.difficulty}
              </span>
            )}
          </div>

          {/* Flag for Review button */}
          <button
            onClick={onToggleFlag}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono transition-colors ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
            <span>{isFlagged ? 'FLAGGED' : 'FLAG'}</span>
          </button>
        </div>

        {/* Question Stem Text */}
        <div className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
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
            'bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] text-zinc-300';
          let letterBadgeStyle =
            'bg-[#18181B] text-zinc-400 border border-[#27272A]';

          if (mode === 'practice' && isAnswered) {
            if (isCorrectAnswer) {
              cardStyle =
                'bg-[#10B981]/10 border-[#10B981] text-zinc-100';
              letterBadgeStyle =
                'bg-[#10B981] text-[#09090B] font-bold';
            } else if (isSelected && !isCorrectAnswer) {
              cardStyle =
                'bg-red-500/10 border-red-500 text-zinc-100';
              letterBadgeStyle = 'bg-red-500 text-white font-bold';
            } else {
              cardStyle = 'opacity-40 border-[#27272A] text-zinc-500';
            }
          } else if (isSelected) {
            // Exam Mode selected
            cardStyle =
              'bg-[#10B981]/15 border-[#10B981] text-zinc-100';
            letterBadgeStyle = 'bg-[#10B981] text-[#09090B] font-bold';
          }

          return (
            <button
              key={optIndex}
              onClick={() => onSelectOption(optIndex)}
              disabled={mode === 'practice' && isAnswered}
              className={`w-full text-left p-4 flex items-start gap-4 transition-colors ${cardStyle} cursor-pointer group`}
            >
              {/* Option Letter Key */}
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-mono flex-shrink-0 ${letterBadgeStyle}`}
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
                    <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Practice Mode: Animated Didactic Explanation Breakdown */}
      {mode === 'practice' && isAnswered && (
        <div className="bg-[#121215] border border-[#10B981] p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-[#10B981] border-b border-[#27272A] pb-2.5">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold tracking-wide font-mono uppercase">
              Didactic Rationale & Distractor Analysis
            </span>
          </div>

          {/* Primary Explanation */}
          {question.explanation && (
            <div className="p-3.5 bg-[#09090B] border border-[#27272A] text-xs text-zinc-200 leading-relaxed">
              <div className="font-semibold text-[#10B981] mb-1 flex items-center gap-1 font-mono text-[11px] uppercase">
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
                <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Distractor Breakdown:
                </div>
                <div className="space-y-1.5">
                  {question.distractor_explanations.map((reason, i) => {
                    const isRight = i === question.correct_answer;
                    return (
                      <div
                        key={i}
                        className={`p-2.5 text-xs flex items-start gap-2 ${
                          isRight
                            ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-zinc-200'
                            : 'bg-[#18181B] border border-[#27272A] text-zinc-400'
                        }`}
                      >
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 bg-[#09090B] border border-[#27272A] flex-shrink-0">
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
