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
    <div className="glass-panel rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
        <span className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">
          Question Matrix
        </span>
        <span className="text-[10px] font-mono text-neon-cyan">
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

          let btnStyle = 'bg-obsidian-900/80 text-slate-400 border border-white/5 hover:border-white/20';

          if (isCurrent) {
            btnStyle = 'bg-neon-cyan text-obsidian-950 font-bold border-neon-cyan shadow-glow-cyan';
          } else if (isFlagged) {
            btnStyle = 'bg-neon-amber/20 text-neon-amber border-neon-amber/40 shadow-glow-amber';
          } else if (isAnswered) {
            if (mode === 'practice') {
              btnStyle = rec.isCorrect
                ? 'bg-neon-emerald/20 text-neon-emerald border-neon-emerald/40'
                : 'bg-neon-rose/20 text-neon-rose border-neon-rose/40';
            } else {
              btnStyle = 'bg-neon-violet/20 text-neon-violet border-neon-violet/40';
            }
          }

          return (
            <button
              key={i}
              onClick={() => onJumpToQuestion(i)}
              className={`h-8 rounded-lg text-xs font-mono font-medium flex items-center justify-center relative transition-all ${btnStyle}`}
            >
              <span>{i + 1}</span>
              {isFlagged && !isCurrent && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-amber" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-white/[0.06] grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-neon-cyan" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-neon-violet/40" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-neon-amber/50" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-obsidian-900 border border-white/10" />
          <span>Unvisited</span>
        </div>
      </div>
    </div>
  );
};
