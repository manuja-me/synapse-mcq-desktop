import React from 'react';
import {
  Flag,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  Flame,
  Zap,
  ArrowRight
} from 'lucide-react';
import { McqQuestion, UserAnswerRecord } from '../../types/mcq';
import { RewardResult } from '../../utils/rewardEngine';
import { MathText } from '../common/MathText';

interface QuestionCardProps {
  question: McqQuestion;
  questionNumber: number;
  totalQuestions: number;
  answerRecord?: UserAnswerRecord;
  mode: 'practice' | 'exam';
  direction?: 'forward' | 'backward';
  recentReward?: RewardResult | null;
  onSelectOption: (optionIndex: number) => void;
  onToggleFlag: () => void;
  onNext?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  answerRecord,
  mode,
  direction = 'forward',
  recentReward,
  onSelectOption,
  onToggleFlag,
  onNext,
}) => {
  const selectedIndex = answerRecord?.selectedOption ?? null;
  const isAnswered = selectedIndex !== null;
  const isFlagged = answerRecord?.flaggedForReview ?? false;
  const isCorrect = answerRecord?.isCorrect ?? false;

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  const slideClass =
    direction === 'forward' ? 'animate-slide-right' : 'animate-slide-left';

  return (
    <div className={`space-y-4 ${slideClass}`}>
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
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono transition-colors snappy-press ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400' : ''}`} />
            <span>{isFlagged ? 'FLAGGED' : 'FLAG (F)'}</span>
          </button>
        </div>

        {/* Question Stem Text */}
        <div className="text-base sm:text-lg font-medium text-zinc-100 leading-relaxed">
          <MathText text={question.question} />
        </div>
      </div>

      {/* Floating Reward Banner in Practice Mode */}
      {mode === 'practice' && isAnswered && isCorrect && recentReward && (
        <div className="bg-[#10B981]/10 border border-[#10B981] p-3.5 flex items-center justify-between gap-3 animate-reward-bounce font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-[#10B981] text-[#09090B] font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#10B981] flex items-center gap-2">
                <span>+{recentReward.pointsEarned} PTS</span>
                {recentReward.comboTitle && (
                  <span className="text-[11px] px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-300">
                    {recentReward.comboTitle}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                Precision Hit • {recentReward.streakMultiplier}x Multiplier Applied
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {recentReward.speedBonus > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
                <Zap className="w-3 h-3" />
                <span>SPEED +{recentReward.speedBonus}</span>
              </span>
            )}

            {recentReward.newStreak > 1 && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-500/15 border border-orange-500/40 text-orange-400 font-bold">
                <Flame className="w-3.5 h-3.5 animate-streak-fire" />
                <span>{recentReward.newStreak}x STREAK</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Milestone Celebration Banner */}
      {mode === 'practice' && isAnswered && isCorrect && recentReward?.milestoneReached && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/60 p-2.5 text-center font-mono text-xs font-bold text-amber-300 animate-reward-bounce flex items-center justify-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 animate-streak-fire" />
          <span>🏆 MILESTONE: {recentReward.milestoneReached}</span>
        </div>
      )}

      {/* Options Stack */}
      <div className="space-y-2.5">
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
                'bg-[#10B981]/15 border-[#10B981] animate-glow-pulse text-zinc-100';
              letterBadgeStyle =
                'bg-[#10B981] text-[#09090B] font-bold shadow-[0_0_8px_rgba(16,185,129,0.5)]';
            } else if (isSelected && !isCorrectAnswer) {
              cardStyle =
                'bg-red-500/15 border-red-500 text-zinc-100';
              letterBadgeStyle = 'bg-red-500 text-white font-bold';
            } else {
              cardStyle = 'opacity-35 border-[#27272A] text-zinc-500';
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
              className={`w-full text-left p-4 flex items-start gap-4 snappy-press ${cardStyle} cursor-pointer group`}
            >
              {/* Option Letter Key */}
              <div
                className={`w-7 h-7 flex items-center justify-center text-xs font-mono flex-shrink-0 transition-colors ${letterBadgeStyle}`}
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
                    <CheckCircle2 className="w-5 h-5 text-[#10B981] animate-reward-bounce" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Advance Prompt for Practice Mode */}
      {mode === 'practice' && isAnswered && onNext && questionNumber < totalQuestions && (
        <div className="flex justify-end pt-1">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-bold font-mono transition-colors snappy-press"
          >
            <span>NEXT QUESTION</span>
            <span className="text-[10px] opacity-75 font-normal">[SPACE / ENTER]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Practice Mode: Animated Didactic Explanation Breakdown */}
      {mode === 'practice' && isAnswered && (
        <div className="bg-[#121215] border border-[#27272A] p-5 space-y-4 animate-in fade-in duration-150">
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
