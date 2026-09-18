import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  HelpCircle,
  LogOut,
  Flame,
  Check,
  Zap
} from 'lucide-react';
import { McqDeck, FlashcardItem } from '../../types/mcq';
import { FlashcardCard, FlashcardRating } from './FlashcardCard';
import { recordFlashcardStudySession } from '../../utils/storage';
import { invokeTrimMemory } from '../../utils/tauriBridge';
import { ConfirmModal } from '../common/ConfirmModal';

interface FlashcardContainerProps {
  deck: McqDeck;
  onExitStudy: () => void;
}

export const FlashcardContainer: React.FC<FlashcardContainerProps> = ({
  deck,
  onExitStudy,
}) => {
  const originalCards: FlashcardItem[] = useMemo(() => deck.cards || [], [deck.cards]);

  // Session state
  const [activeIndices, setActiveIndices] = useState<number[]>(() =>
    originalCards.map((_, i) => i)
  );
  const [orderPointer, setOrderPointer] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [ratings, setRatings] = useState<Record<number, FlashcardRating>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Current active card
  const currentCardIndex = activeIndices[orderPointer] ?? 0;
  const currentCard: FlashcardItem | undefined = originalCards[currentCardIndex];

  // Calculated session stats
  const ratedCount = Object.keys(ratings).length;
  const masteredCount = Object.values(ratings).filter((r) => r === 'mastered').length;
  const goodCount = Object.values(ratings).filter((r) => r === 'good').length;
  const reviewCount = Object.values(ratings).filter((r) => r === 'again').length;
  const progressPercent =
    activeIndices.length > 0 ? Math.round((orderPointer / activeIndices.length) * 100) : 0;

  // Persist study session stats on completion
  useEffect(() => {
    if (isCompleted && originalCards.length > 0) {
      recordFlashcardStudySession(
        deck.id,
        masteredCount,
        reviewCount + goodCount,
        originalCards.length
      );
      invokeTrimMemory();
    }
  }, [isCompleted, deck.id, masteredCount, reviewCount, goodCount, originalCards.length]);

  // Toggle card flip
  const handleToggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Navigate to next card
  const handleNextCard = useCallback(() => {
    setDirection('forward');
    setIsFlipped(false);
    if (orderPointer + 1 < activeIndices.length) {
      setOrderPointer((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  }, [orderPointer, activeIndices.length]);

  // Navigate to previous card
  const handlePrevCard = useCallback(() => {
    if (orderPointer > 0) {
      setDirection('backward');
      setIsFlipped(false);
      setOrderPointer((prev) => prev - 1);
    }
  }, [orderPointer]);

  // Rate card and advance
  const handleRateCard = useCallback(
    (rating: FlashcardRating) => {
      setRatings((prev) => ({
        ...prev,
        [currentCardIndex]: rating,
      }));

      // Snappy advance to next card
      handleNextCard();
    },
    [currentCardIndex, handleNextCard]
  );

  // Toggle Shuffle
  const handleToggleShuffle = useCallback(() => {
    setIsFlipped(false);
    setActiveIndices((prev) => {
      const copy = [...prev];
      if (!isShuffled) {
        // Fisher-Yates shuffle
        for (let i = copy.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        setIsShuffled(true);
      } else {
        copy.sort((a, b) => a - b);
        setIsShuffled(false);
      }
      return copy;
    });
    setOrderPointer(0);
  }, [isShuffled]);

  // Restart complete deck
  const handleRestartAll = useCallback(() => {
    setActiveIndices(originalCards.map((_, i) => i));
    setOrderPointer(0);
    setIsFlipped(false);
    setRatings({});
    setIsCompleted(false);
    invokeTrimMemory();
  }, [originalCards]);

  // Study only unmastered cards
  const handleStudyUnmasteredOnly = useCallback(() => {
    const unmastered = originalCards
      .map((_, i) => i)
      .filter((i) => ratings[i] !== 'mastered');

    if (unmastered.length > 0) {
      setActiveIndices(unmastered);
      setOrderPointer(0);
      setIsFlipped(false);
      setIsCompleted(false);
      invokeTrimMemory();
    }
  }, [originalCards, ratings]);

  // Keyboard navigation & controls
  useEffect(() => {
    if (isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleToggleFlip();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleToggleFlip();
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleRateCard('again');
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleRateCard('good');
      } else if (e.key === '3' && isFlipped) {
        e.preventDefault();
        handleRateCard('mastered');
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleToggleShuffle();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (ratedCount > 0) {
          setShowExitModal(true);
        } else {
          onExitStudy();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCompleted,
    isFlipped,
    handleToggleFlip,
    handleRateCard,
    handleNextCard,
    handlePrevCard,
    handleToggleShuffle,
    ratedCount,
    onExitStudy,
  ]);

  if (!currentCard || originalCards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-12 bg-[#121215] border border-[#27272A] text-center space-y-4">
        <Layers className="w-10 h-10 text-zinc-600 mx-auto" />
        <h3 className="text-base font-bold text-zinc-200 font-mono">No Flashcards Available</h3>
        <p className="text-xs text-zinc-400">
          This deck does not contain theory flashcards. Generate or import cards in the Ingestion Shield.
        </p>
        <button
          onClick={onExitStudy}
          className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 text-xs font-mono"
        >
          Return to Library
        </button>
      </div>
    );
  }

  // ==================== SESSION COMPLETION SUMMARY ====================
  if (isCompleted) {
    const totalStudied = activeIndices.length;
    const masteryPercentage =
      totalStudied > 0 ? Math.round((masteredCount / totalStudied) * 100) : 0;
    const hasUnmastered = totalStudied - masteredCount > 0;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 py-6">
        <div className="bg-[#121215] border border-[#27272A] p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981]">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-zinc-100 font-mono">
                  Study Session Complete
                </h2>
                <div className="text-xs text-zinc-400 font-mono">{deck.title}</div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-2xl font-black text-[#10B981]">{masteryPercentage}%</div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                RETENTION RATE
              </div>
            </div>
          </div>

          {/* Breakdown Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#18181B] border border-emerald-500/40 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mastered</span>
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-100">{masteredCount}</div>
              <div className="text-[11px] text-zinc-400">Cards with high confidence</div>
            </div>

            <div className="p-4 bg-[#18181B] border border-cyan-500/40 space-y-1">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Good Recall</span>
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-100">{goodCount}</div>
              <div className="text-[11px] text-zinc-400">Understood with minor effort</div>
            </div>

            <div className="p-4 bg-[#18181B] border border-amber-500/40 space-y-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Needs Review</span>
              </div>
              <div className="text-2xl font-bold font-mono text-zinc-100">{reviewCount}</div>
              <div className="text-[11px] text-zinc-400">Requires active reinforcement</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-[#27272A]">
            {hasUnmastered && (
              <button
                onClick={handleStudyUnmasteredOnly}
                className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-[#09090B] font-mono font-bold text-xs flex items-center justify-center gap-2 transition-colors snappy-press"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  STUDY UNMASTERED CARDS ONLY ({totalStudied - masteredCount} REMAINING)
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleRestartAll}
                className="py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 font-mono text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart All ({originalCards.length})</span>
              </button>

              <button
                onClick={onExitStudy}
                className="py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Back to Library</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ACTIVE STUDY HUD & CARD ====================
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top HUD Header */}
      <div className="bg-[#121215] border border-[#27272A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
        {/* Left: Exit & Deck Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (ratedCount > 0) {
                setShowExitModal(true);
              } else {
                onExitStudy();
              }
            }}
            className="p-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-zinc-100 transition-colors"
            title="Exit Flashcard Study (Esc)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-[#18181B] border border-[#10B981]/50 text-[#10B981] text-[10px] font-mono font-bold">
                THEORY FLASHCARDS
              </span>
              <span className="text-xs text-zinc-400 font-mono truncate max-w-xs sm:max-w-md">
                {deck.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Controls & HUD indicators */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Shuffle Toggle */}
          <button
            onClick={handleToggleShuffle}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono border transition-colors ${
              isShuffled
                ? 'bg-[#10B981]/20 border-[#10B981] text-[#10B981] font-bold'
                : 'bg-[#18181B] border-[#27272A] text-zinc-400 hover:text-zinc-200'
            }`}
            title="Shuffle Card Order (S)"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{isShuffled ? 'SHUFFLED' : 'SHUFFLE (S)'}</span>
          </button>

          {/* Quick Stats pill */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#18181B] border border-[#27272A] text-xs font-mono">
            <span className="text-[#10B981] font-bold">{masteredCount}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-amber-400">{reviewCount}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">{activeIndices.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Strip */}
      <div className="w-full bg-[#18181B] border border-[#27272A] h-1.5 relative overflow-hidden">
        <div
          className="h-full bg-[#10B981] transition-all duration-200 ease-out"
          style={{ width: `${Math.max(progressPercent, 4)}%` }}
        />
      </div>

      {/* Active Flashcard 3D Card */}
      <div className="py-2">
        <FlashcardCard
          card={currentCard}
          cardNumber={orderPointer + 1}
          totalCards={activeIndices.length}
          isFlipped={isFlipped}
          rating={ratings[currentCardIndex] || null}
          onFlip={handleToggleFlip}
          onRate={handleRateCard}
          direction={direction}
        />
      </div>

      {/* Navigation Arrows & Shortcuts Footnote */}
      <div className="max-w-3xl mx-auto flex items-center justify-between text-xs font-mono text-zinc-500 px-1 pt-1">
        <button
          onClick={handlePrevCard}
          disabled={orderPointer === 0}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
            orderPointer === 0
              ? 'opacity-30 border-[#27272A] text-zinc-600 cursor-not-allowed'
              : 'bg-[#121215] border-[#27272A] text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B]'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous (<kbd className="text-[10px] text-zinc-400">←</kbd>)</span>
        </button>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500">
          <span>
            <kbd className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400">Space</kbd> Flip
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400">1-3</kbd> Rate
          </span>
          <span>•</span>
          <span>
            <kbd className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400">→</kbd> Next
          </span>
        </div>

        <button
          onClick={handleNextCard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#121215] border border-[#27272A] text-zinc-400 hover:text-zinc-200 hover:bg-[#18181B] transition-colors"
        >
          <span>
            {orderPointer + 1 === activeIndices.length ? 'Finish Session' : 'Next'} (<kbd className="text-[10px] text-zinc-400">→</kbd>)
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="Exit Study Session?"
        message="Your progress for this study session will be preserved. Are you sure you want to exit back to the Question Bank?"
        confirmLabel="Exit to Library"
        cancelLabel="Continue Studying"
        onConfirm={() => {
          setShowExitModal(false);
          onExitStudy();
        }}
        onCancel={() => setShowExitModal(false)}
      />
    </div>
  );
};
