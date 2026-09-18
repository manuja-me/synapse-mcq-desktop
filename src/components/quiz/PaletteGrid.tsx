import React from 'react';
import { UserAnswerRecord } from '../../types/mcq';

interface PaletteGridProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<number, UserAnswerRecord>;
  mode: 'practice' | 'exam';
  onJumpToQuestion: (index: number) => void;
}

export const PaletteGrid: React.FC<PaletteGridProps> = ({
  totalQuestions,
  currentIndex,
  answers,
  mode,
  onJumpToQuestion,
}) => {
  return (
    <div className="bg-[#121215] border border-[#27272A] p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
        <span className="text-xs font-bold font-mono tracking-wider text-zinc-300 uppercase">
          QUESTION MATRIX
        </span>
        <span className="text-[10px] font-mono text-[#10B981]">
          {Object.keys(answers).length} / {totalQuestions} Answered
        </span>
      </div>

      {/* Grid Palette */}
      <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto p-1">
        {Array.from({ length: totalQuestions }).map((_, i) => {
          const rec = answers[i];
          const isCurrent = i === currentIndex;
          const isAnswered = rec && rec.selectedOption !== null;
          const isFlagged = rec?.flaggedForReview;

          let btnStyle = 'bg-[#18181B] text-zinc-400 border border-[#27272A] hover:border-zinc-500';

          if (isCurrent) {
            btnStyle = 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]';
          } else if (isFlagged) {
            btnStyle = 'bg-amber-500/20 text-amber-400 border border-amber-500/50';
          } else if (isAnswered) {
            if (mode === 'practice') {
              btnStyle = rec.isCorrect
                ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50'
                : 'bg-red-500/20 text-red-400 border border-red-500/50';
            } else {
              btnStyle = 'bg-zinc-800 text-zinc-200 border border-zinc-600';
            }
          }

          return (
            <button
              key={i}
              onClick={() => onJumpToQuestion(i)}
              className={`h-8 text-xs font-mono font-medium flex items-center justify-center relative transition-colors snappy-press ${btnStyle}`}
            >
              <span>{i + 1}</span>
              {isFlagged && !isCurrent && (
                <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-[#27272A] grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#10B981]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-zinc-700" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-400" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#18181B] border border-[#27272A]" />
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
};
