import React from 'react';
import { Sparkles, Layers, RotateCw, CheckCircle2 } from 'lucide-react';
import { FlashcardItem } from '../../types/mcq';
import { MathText } from '../common/MathText';

export type FlashcardRating = 'again' | 'good' | 'mastered';

interface FlashcardCardProps {
  card: FlashcardItem;
  cardNumber: number;
  totalCards: number;
  isFlipped: boolean;
  rating?: FlashcardRating | null;
  onFlip: () => void;
  onRate: (rating: FlashcardRating) => void;
  direction?: 'forward' | 'backward';
}

/**
 * Extracts distinct modular items from a card's back content.
 * Supports string arrays, newline-separated markdown/bullets (-, *, 1., •),
 * and semicolon-delimited lists.
 */
export function parseBackContent(back: string | string[]): string[] {
  if (Array.isArray(back)) {
    return back
      .map((item) => (typeof item === 'string' ? item.trim() : String(item).trim()))
      .filter((item) => item.length > 0);
  }

  if (!back || typeof back !== 'string') return [];

  const raw = back.trim();

  // Check for newline separated lists with bullet patterns
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1 && lines.some((l) => /^(\d+[\.\)]|[\-\*\•])\s+/.test(l))) {
    return lines.map((l) => l.replace(/^(\d+[\.\)]|[\-\*\•])\s+/, '').trim()).filter(Boolean);
  }

  // If there are multiple newline-separated non-empty paragraphs
  if (lines.length > 1 && lines.every((l) => l.length > 0 && l.length < 240)) {
    return lines;
  }

  // Check for semicolon-separated items (at least 3 items)
  if (raw.includes(';')) {
    const semiItems = raw.split(';').map((s) => s.trim()).filter(Boolean);
    if (semiItems.length >= 3 && semiItems.every((s) => s.length > 3)) {
      return semiItems;
    }
  }

  return [raw];
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  cardNumber,
  totalCards,
  isFlipped,
  rating,
  onFlip,
  onRate,
  direction = 'forward',
}) => {
  const parsedItems = parseBackContent(card.back);
  const slideClass = direction === 'forward' ? 'animate-slide-right' : 'animate-slide-left';

  return (
    <div className={`w-full max-w-3xl mx-auto perspective-1000 ${slideClass}`}>
      <div
        className={`relative w-full transition-transform duration-300 transform-style-3d min-h-[460px] ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ==================== FRONT OF CARD ==================== */}
        <div
          onClick={onFlip}
          className={`absolute inset-0 w-full min-h-[460px] bg-[#121215] border ${
            isFlipped ? 'pointer-events-none' : 'cursor-pointer hover:border-[#3F3F46]'
          } border-[#27272A] p-6 sm:p-8 flex flex-col justify-between backface-hidden select-none transition-colors shadow-2xl`}
        >
          {/* Top metadata strip */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[#10B981] text-xs font-mono font-bold">
                CARD {cardNumber} OF {totalCards}
              </span>
              {card.topic && (
                <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 text-xs font-mono">
                  {card.topic}
                </span>
              )}
              {card.difficulty && (
                <span className="text-[10px] font-mono uppercase text-zinc-500">
                  • {card.difficulty}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>THEORY PROMPT</span>
            </div>
          </div>

          {/* Front Prompt / Question Stem */}
          <div className="my-auto py-8 text-center space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-[#10B981] font-semibold">
              QUESTION / CONCEPT
            </div>
            <div className="text-xl sm:text-2xl font-bold text-zinc-100 leading-relaxed font-mono px-4">
              <MathText text={card.front} />
            </div>
          </div>

          {/* Bottom Flip Trigger Hint */}
          <div className="border-t border-[#27272A] pt-4 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span className="hidden sm:inline">Active Recall Session</span>
            <div className="flex items-center gap-2 text-zinc-400 mx-auto sm:mx-0">
              <RotateCw className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[11px] font-semibold tracking-wider text-zinc-300">
                CLICK OR PRESS <kbd className="px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] text-[#10B981]">SPACE</kbd> TO REVEAL
              </span>
            </div>
          </div>
        </div>

        {/* ==================== BACK OF CARD ==================== */}
        <div
          className={`w-full min-h-[460px] bg-[#121215] border border-[#10B981]/50 p-6 sm:p-8 flex flex-col justify-between backface-hidden rotate-y-180 select-none shadow-2xl ${
            isFlipped ? '' : 'pointer-events-none'
          }`}
        >
          {/* Top Header */}
          <div className="space-y-3 border-b border-[#27272A] pb-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-[#10B981] text-xs font-mono font-bold">
                  CARD {cardNumber} OF {totalCards}
                </span>
                {card.topic && (
                  <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 text-xs font-mono">
                    {card.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] text-[11px] font-mono font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ANSWER REVEALED</span>
              </div>
            </div>

            {/* Subtle Question reminder */}
            <div className="text-xs text-zinc-400 font-mono flex items-start gap-2 bg-[#18181B]/80 px-3 py-2 border border-[#27272A]">
              <span className="text-zinc-500 font-bold flex-shrink-0">Q:</span>
              <span className="line-clamp-2 text-zinc-300 font-medium">
                <MathText text={card.front} />
              </span>
            </div>
          </div>

          {/* Middle Body: Multi-Answer Beautiful Formatting */}
          <div className="py-4 space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {parsedItems.length > 1 ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
                  <span className="text-[#10B981] font-bold">
                    Key Points & Components ({parsedItems.length})
                  </span>
                  <span className="text-[10px] text-zinc-500">Structured Breakdown</span>
                </div>

                <div className="space-y-2">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-[#18181B] border border-[#27272A] hover:border-[#10B981]/40 transition-colors group"
                    >
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-[#121215] border border-[#27272A] group-hover:border-[#10B981]/60 text-[#10B981] font-mono text-xs font-bold">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans pt-0.5">
                        <MathText text={item} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#18181B] border border-[#27272A] text-sm text-zinc-200 leading-relaxed font-sans">
                <MathText text={parsedItems[0] || ''} />
              </div>
            )}

            {/* Optional Didactic Explanation / Practical Insight */}
            {card.explanation && (
              <div className="p-3 bg-[#18181B]/60 border border-[#27272A] text-xs text-zinc-400 italic flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0 mt-0.5 not-italic" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-zinc-300 not-italic font-mono text-[11px] block mb-0.5">
                    Didactic Rationale:
                  </span>
                  <MathText text={card.explanation} />
                </div>
              </div>
            )}
          </div>

          {/* Bottom: Self-Assessment Rating Bar */}
          <div className="border-t border-[#27272A] pt-4 space-y-3">
            <div className="text-center text-[10px] font-mono uppercase tracking-widest text-zinc-500">
              RATE YOUR RECALL ACCURACY (ADVANCES TO NEXT CARD)
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('again');
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 border transition-colors font-mono text-xs snappy-press ${
                  rating === 'again'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#18181B] border-[#27272A] hover:border-amber-500/60 hover:bg-amber-950/20 text-zinc-300 hover:text-amber-300'
                }`}
              >
                <span className="px-1 py-0.2 bg-[#121215] border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                  [1]
                </span>
                <span>Needs Review</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('good');
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 border transition-colors font-mono text-xs snappy-press ${
                  rating === 'good'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-[#18181B] border-[#27272A] hover:border-cyan-500/60 hover:bg-cyan-950/20 text-zinc-300 hover:text-cyan-300'
                }`}
              >
                <span className="px-1 py-0.2 bg-[#121215] border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                  [2]
                </span>
                <span>Good</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('mastered');
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 border transition-colors font-mono text-xs snappy-press ${
                  rating === 'mastered'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-[#18181B] border-[#27272A] hover:border-emerald-500/60 hover:bg-emerald-950/20 text-zinc-300 hover:text-emerald-300'
                }`}
              >
                <span className="px-1 py-0.2 bg-[#121215] border border-emerald-500/40 text-[#10B981] text-[10px] font-bold">
                  [3]
                </span>
                <span>Mastered</span>
              </button>
            </div>

            {/* Flip back button */}
            <div className="flex justify-center pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip();
                }}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                <span>Flip back to question (<kbd className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400">R</kbd> or <kbd className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400">Space</kbd>)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
