import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Send,
  Flag,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Volume2,
  VolumeX,
  Flame,
  Zap
} from 'lucide-react';
import { McqDeck, UserAnswerRecord } from '../../types/mcq';
import { QuestionCard } from './QuestionCard';
import { PaletteGrid } from './PaletteGrid';
import { ResultsDashboard } from '../analytics/ResultsDashboard';
import { recordDeckAttempt } from '../../utils/storage';
import { invokeTrimMemory } from '../../utils/tauriBridge';
import { ConfirmModal } from '../common/ConfirmModal';
import { audioFx } from '../../utils/audioFx';
import {
  calculateReward,
  getStreakBadgeConfig,
  RewardResult
} from '../../utils/rewardEngine';

interface QuizContainerProps {
  deck: McqDeck;
  initialMode: 'practice' | 'exam';
  onExitQuiz: () => void;
}

export const QuizContainer: React.FC<QuizContainerProps> = ({
  deck,
  initialMode,
  onExitQuiz,
}) => {
  const [mode, setMode] = useState<'practice' | 'exam'>(initialMode);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [answers, setAnswers] = useState<Record<number, UserAnswerRecord>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    // 90 seconds per question for exam mode
    return deck.questions.length * 90;
  });
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Gamification & Reward State
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [recentReward, setRecentReward] = useState<RewardResult | null>(null);
  const [isMuted, setIsMuted] = useState(() => audioFx.isMuted());
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Track start time for speed bonuses per question
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleToggleSound = useCallback(() => {
    const nextMuted = audioFx.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      audioFx.playTick();
    }
  }, []);

  const handleExitClick = () => {
    if (!isSubmitted && Object.keys(answers).length > 0) {
      setShowExitModal(true);
    } else {
      onExitQuiz();
    }
  };

  // Timer effect
  useEffect(() => {
    if (isSubmitted) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);

      if (mode === 'exam') {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSubmitted, mode]);

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (isSubmitted) return;

      const currentQ = deck.questions[currentIndex];
      const isCorrect = optionIndex === currentQ.correct_answer;
      const timeSpentSeconds = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

      if (mode === 'practice') {
        const reward = calculateReward(isCorrect, streak, timeSpentSeconds);
        setRecentReward(reward);

        if (isCorrect) {
          const nextStreak = reward.newStreak;
          setStreak(nextStreak);
          setMaxStreak((prev) => Math.max(prev, nextStreak));
          setTotalScore((prev) => prev + reward.pointsEarned);

          if (reward.milestoneReached) {
            audioFx.playStreakMilestone();
          } else {
            audioFx.playCorrect(nextStreak);
          }
        } else {
          setStreak(0);
          audioFx.playWrong();
        }
      } else {
        // In exam mode, selection is recorded and tick feedback given
        audioFx.playTick();
      }

      setAnswers((prev) => ({
        ...prev,
        [currentIndex]: {
          questionIndex: currentIndex,
          selectedOption: optionIndex,
          isCorrect,
          timeSpentSeconds,
          flaggedForReview: prev[currentIndex]?.flaggedForReview ?? false,
        },
      }));
    },
    [currentIndex, deck.questions, isSubmitted, mode, questionStartTime, streak]
  );

  const handleToggleFlag = useCallback(() => {
    audioFx.playTick();
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        questionIndex: currentIndex,
        selectedOption: prev[currentIndex]?.selectedOption ?? null,
        isCorrect: prev[currentIndex]?.isCorrect ?? false,
        timeSpentSeconds: 0,
        flaggedForReview: !prev[currentIndex]?.flaggedForReview,
      },
    }));
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < deck.questions.length - 1) {
      setDirection('forward');
      audioFx.playTick();
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, deck.questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      audioFx.playTick();
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleJumpToQuestion = useCallback(
    (targetIndex: number) => {
      if (targetIndex !== currentIndex) {
        setDirection(targetIndex > currentIndex ? 'forward' : 'backward');
        audioFx.playTick();
        setCurrentIndex(targetIndex);
      }
    },
    [currentIndex]
  );

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSubmitted || showSubmitModal || showExitModal) return;

      // Ignore inside text inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();

      // Option selection keys
      if (key === '1' || key === 'a') handleSelectOption(0);
      else if (key === '2' || key === 'b') handleSelectOption(1);
      else if (key === '3' || key === 'c') handleSelectOption(2);
      else if (key === '4' || key === 'd') handleSelectOption(3);
      // Navigation keys
      else if (key === 'arrowright' || key === 'j') handleNext();
      else if (key === 'arrowleft' || key === 'k') handlePrev();
      // Space / Enter quick advance
      else if (key === ' ' || key === 'enter') {
        if (answers[currentIndex]?.selectedOption !== null && currentIndex < deck.questions.length - 1) {
          e.preventDefault();
          handleNext();
        }
      }
      // Flag key
      else if (key === 'f') handleToggleFlag();
      // Audio mute toggle
      else if (key === 'm') handleToggleSound();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleSelectOption,
    handleNext,
    handlePrev,
    handleToggleFlag,
    handleToggleSound,
    isSubmitted,
    showSubmitModal,
    showExitModal,
    answers,
    currentIndex,
    deck.questions.length
  ]);

  const handleSubmitQuiz = () => {
    setShowSubmitModal(false);
    setIsSubmitted(true);

    let correct = 0;
    let computedStreak = 0;
    let computedMaxStreak = 0;
    let computedScore = 0;

    deck.questions.forEach((q, idx) => {
      const ans = answers[idx];
      if (ans?.selectedOption === q.correct_answer) {
        correct++;
        computedStreak++;
        computedMaxStreak = Math.max(computedMaxStreak, computedStreak);
        const reward = calculateReward(true, computedStreak - 1, ans.timeSpentSeconds);
        computedScore += reward.pointsEarned;
      } else {
        computedStreak = 0;
      }
    });

    if (mode === 'exam') {
      setTotalScore(computedScore);
      setMaxStreak(computedMaxStreak);
    }

    recordDeckAttempt(deck.id, correct, deck.questions.length, mode);
    invokeTrimMemory(); // Flush working set after quiz
  };

  const handleRetakeQuiz = (newMode: 'practice' | 'exam') => {
    setMode(newMode);
    setCurrentIndex(0);
    setAnswers({});
    setStreak(0);
    setMaxStreak(0);
    setTotalScore(0);
    setRecentReward(null);
    setIsSubmitted(false);
    setElapsedSeconds(0);
    setTimeRemaining(deck.questions.length * 90);
  };

  const handleRetakeMissedOnly = (missedIndices: number[]) => {
    if (missedIndices.length > 0) {
      setCurrentIndex(missedIndices[0]);
      setIsSubmitted(false);
      setStreak(0);
      setRecentReward(null);
      // Retain correct answers, clear missed answers
      setAnswers((prev) => {
        const next = { ...prev };
        missedIndices.forEach((idx) => {
          delete next[idx];
        });
        return next;
      });
    }
  };

  if (isSubmitted) {
    return (
      <ResultsDashboard
        deck={deck}
        answers={answers}
        elapsedSeconds={elapsedSeconds}
        mode={mode}
        totalScore={totalScore}
        maxStreak={maxStreak}
        onRetakeQuiz={handleRetakeQuiz}
        onRetakeMissedOnly={handleRetakeMissedOnly}
        onBackToLibrary={onExitQuiz}
      />
    );
  }

  const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
  const progressPercent = Math.round((answeredCount / deck.questions.length) * 100);
  const streakConfig = getStreakBadgeConfig(streak);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top HUD Controls Bar */}
      <div className="bg-[#121215] border border-[#27272A] p-4 flex items-center justify-between gap-4">
        {/* Left: Exit, Title & Mode info */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExitClick}
            className="p-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-zinc-200 transition-colors snappy-press"
            title="Exit to Library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-zinc-200 truncate max-w-xs sm:max-w-sm font-mono">
              {deck.title}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span
                className={`uppercase font-bold px-1.5 py-0.5 ${
                  mode === 'exam'
                    ? 'text-zinc-300 bg-zinc-800'
                    : 'text-[#10B981] bg-[#18181B] border border-[#27272A]'
                }`}
              >
                {mode} MODE
              </span>
              <span>•</span>
              <span>{progressPercent}% Complete</span>
            </div>
          </div>
        </div>

        {/* Center: Reward & Timer Metrics */}
        <div className="flex items-center gap-3">
          {/* Live Score Counter */}
          {mode === 'practice' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#18181B] border border-[#27272A] font-mono text-xs text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="font-bold text-[#10B981]">{totalScore}</span>
              <span className="text-[10px] text-zinc-500">PTS</span>
            </div>
          )}

          {/* Dynamic Streak Badge */}
          {mode === 'practice' && streak > 0 && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 border font-mono text-xs animate-reward-bounce ${streakConfig.borderClass} ${streakConfig.bgClass} ${streakConfig.colorClass}`}
            >
              <Flame className="w-3.5 h-3.5 animate-streak-fire" />
              <span className="font-bold">{streak}x</span>
              <span className="hidden md:inline text-[10px] opacity-80 uppercase">
                {streakConfig.label}
              </span>
            </div>
          )}

          {/* Exam Countdown Timer or Elapsed */}
          <div className="flex items-center gap-2 font-mono bg-[#18181B] border border-[#27272A] px-2.5 py-1">
            <Clock
              className={`w-3.5 h-3.5 ${
                timeRemaining < 120 && mode === 'exam'
                  ? 'text-red-500 animate-pulse'
                  : 'text-[#10B981]'
              }`}
            />
            <span
              className={`text-xs font-bold ${
                timeRemaining < 120 && mode === 'exam'
                  ? 'text-red-500 font-extrabold'
                  : 'text-zinc-200'
              }`}
            >
              {mode === 'exam' ? formatTimer(timeRemaining) : formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* Right: Sound & Submit Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle Button */}
          <button
            onClick={handleToggleSound}
            className="p-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-400 hover:text-zinc-200 transition-colors snappy-press"
            title={isMuted ? 'Unmute sound effects (M)' : 'Mute sound effects (M)'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#10B981]" />
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors snappy-press"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FINISH & SUBMIT</span>
            <span className="sm:hidden">SUBMIT</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-[#18181B] border-y border-[#27272A]">
        <div
          className="h-full bg-[#10B981] transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / deck.questions.length) * 100}%` }}
        />
      </div>

      {/* Main Layout: Question Card on Left, Palette Grid on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Question Card & Bottom Prev/Next Controls */}
        <div className="lg:col-span-8 space-y-4">
          <QuestionCard
            key={currentIndex}
            question={deck.questions[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={deck.questions.length}
            answerRecord={answers[currentIndex]}
            mode={mode}
            direction={direction}
            recentReward={recentReward}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            onNext={currentIndex < deck.questions.length - 1 ? handleNext : undefined}
          />

          {/* Navigation Controls Bar */}
          <div className="bg-[#121215] border border-[#27272A] p-4 flex items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] disabled:opacity-30 disabled:hover:bg-[#18181B] text-xs font-semibold font-mono text-zinc-300 border border-[#27272A] transition-colors snappy-press"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>

            {/* Keyboard shortcut tips */}
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <span>
                <kbd className="px-1 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400">1-4</kbd> SELECT
              </span>
              <span>•</span>
              <span>
                <kbd className="px-1 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400">SPACE</kbd> NEXT
              </span>
              <span>•</span>
              <span>
                <kbd className="px-1 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400">J/K</kbd> ARROWS
              </span>
              <span>•</span>
              <span>
                <kbd className="px-1 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400">M</kbd> MUTE
              </span>
            </div>

            {currentIndex === deck.questions.length - 1 ? (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors snappy-press"
              >
                <span>SUBMIT EXAM</span>
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors snappy-press"
              >
                <span>NEXT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Matrix Palette Grid */}
        <div className="lg:col-span-4 space-y-4">
          <PaletteGrid
            totalQuestions={deck.questions.length}
            currentIndex={currentIndex}
            answers={answers}
            mode={mode}
            onJumpToQuestion={handleJumpToQuestion}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#121215] border border-[#27272A] p-6 shadow-2xl space-y-4 text-zinc-200">
            <div className="flex items-center gap-3 text-[#10B981]">
              <div className="p-2 bg-[#18181B] border border-[#27272A]">
                <AlertCircle className="w-6 h-6 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-mono">
                  Ready to Submit?
                </h3>
                <p className="text-xs text-zinc-400">
                  {deck.questions.length - answeredCount > 0
                    ? `You have ${deck.questions.length - answeredCount} unanswered question(s).`
                    : 'All questions have been answered.'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#09090B] border border-[#27272A] space-y-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Questions:</span>
                <span className="text-zinc-200">{deck.questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Answered:</span>
                <span className="text-[#10B981] font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Unanswered:</span>
                <span className="text-red-400 font-bold">{deck.questions.length - answeredCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-xs font-semibold font-mono text-zinc-300 border border-[#27272A] transition-colors snappy-press"
              >
                Keep Reviewing
              </button>
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors snappy-press"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Session Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={showExitModal}
        title="Exit Active Session?"
        subtitle="Unsaved Test Progress"
        icon="logout"
        variant="warning"
        confirmLabel="Exit to Library"
        cancelLabel="Continue Quiz"
        onCancel={() => setShowExitModal(false)}
        onConfirm={onExitQuiz}
        message="You have an active quiz session in progress. Exiting now will discard your answered questions and timer progress."
        details={
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Answered:</span>
              <span className="text-[#10B981] font-bold">
                {Object.keys(answers).length} / {deck.questions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Time Elapsed:</span>
              <span className="text-zinc-300 font-bold">{formatTimer(elapsedSeconds)}</span>
            </div>
          </div>
        }
      />
    </div>
  );
};
