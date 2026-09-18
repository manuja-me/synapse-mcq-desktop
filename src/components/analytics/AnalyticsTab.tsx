import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Award,
  Clock,
  Layers,
  HelpCircle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Calendar,
  Download,
  Trash2,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { McqDeck, StudyHistoryEntry } from '../../types/mcq';
import { loadStudyHistory, clearStudyHistory } from '../../utils/storage';
import { ConfirmModal } from '../common/ConfirmModal';

interface AnalyticsTabProps {
  decks: McqDeck[];
  onSelectDeck: (deck: McqDeck, mode: 'practice' | 'exam' | 'flashcard') => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  decks,
  onSelectDeck,
}) => {
  const [history, setHistory] = useState<StudyHistoryEntry[]>(() => loadStudyHistory());
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'mcq' | 'flashcard'>('all');

  // Decks summary
  const mcqDecks = useMemo(
    () => decks.filter((d) => d.deck_type !== 'flashcard' && (!d.cards || d.cards.length === 0 || d.questions.length > 0)),
    [decks]
  );
  const flashcardDecks = useMemo(
    () => decks.filter((d) => d.deck_type === 'flashcard' || (Boolean(d.cards && d.cards.length > 0) && (!d.questions || d.questions.length === 0))),
    [decks]
  );

  const totalQuestions = useMemo(
    () => mcqDecks.reduce((sum, d) => sum + (d.questions?.length || 0), 0),
    [mcqDecks]
  );
  const totalCards = useMemo(
    () => flashcardDecks.reduce((sum, d) => sum + (d.cards?.length || 0), 0),
    [flashcardDecks]
  );

  // History stats
  const mcqHistory = useMemo(() => history.filter((h) => h.type === 'mcq'), [history]);
  const flashcardHistory = useMemo(() => history.filter((h) => h.type === 'flashcard'), [history]);

  const mcqOverallAccuracy = useMemo(() => {
    if (mcqHistory.length === 0) {
      // Fallback to deck last_attempt if history is fresh
      const attempted = mcqDecks.filter((d) => d.last_attempt);
      if (attempted.length === 0) return 0;
      const totalScore = attempted.reduce((sum, d) => sum + (d.last_attempt?.score || 0), 0);
      const totalQuestionsAttempted = attempted.reduce((sum, d) => sum + (d.last_attempt?.total || 0), 0);
      return totalQuestionsAttempted > 0 ? Math.round((totalScore / totalQuestionsAttempted) * 100) : 0;
    }
    const totalScore = mcqHistory.reduce((sum, h) => sum + h.score, 0);
    const totalQ = mcqHistory.reduce((sum, h) => sum + h.total, 0);
    return totalQ > 0 ? Math.round((totalScore / totalQ) * 100) : 0;
  }, [mcqHistory, mcqDecks]);

  const flashcardOverallMastery = useMemo(() => {
    if (flashcardHistory.length === 0) {
      const studied = flashcardDecks.filter((d) => d.flashcard_stats);
      if (studied.length === 0) return 0;
      const totalMastered = studied.reduce((sum, d) => sum + (d.flashcard_stats?.mastered_count || 0), 0);
      const totalC = studied.reduce((sum, d) => sum + (d.flashcard_stats?.total_cards || 0), 0);
      return totalC > 0 ? Math.round((totalMastered / totalC) * 100) : 0;
    }
    const totalMastered = flashcardHistory.reduce((sum, h) => sum + h.score, 0);
    const totalC = flashcardHistory.reduce((sum, h) => sum + h.total, 0);
    return totalC > 0 ? Math.round((totalMastered / totalC) * 100) : 0;
  }, [flashcardHistory, flashcardDecks]);

  // Topic mastery breakdown
  const topicStats = useMemo(() => {
    const map = new Map<string, { total: number; score: number; attempts: number }>();

    // Accumulate from history
    for (const h of history) {
      if (h.topics && h.topics.length > 0) {
        for (const t of h.topics) {
          const entry = map.get(t) || { total: 0, score: 0, attempts: 0 };
          entry.total += h.total;
          entry.score += h.score;
          entry.attempts += 1;
          map.set(t, entry);
        }
      }
    }

    // Fallback if no history yet: scan decks
    if (map.size === 0) {
      for (const d of decks) {
        if (d.last_attempt) {
          const topics = Array.from(new Set(d.questions.map((q) => q.topic).filter(Boolean) as string[]));
          for (const t of topics) {
            const entry = map.get(t) || { total: 0, score: 0, attempts: 0 };
            entry.total += d.last_attempt.total;
            entry.score += d.last_attempt.score;
            entry.attempts += 1;
            map.set(t, entry);
          }
        }
      }
    }

    const list = Array.from(map.entries()).map(([topic, data]) => ({
      topic,
      percentage: data.total > 0 ? Math.round((data.score / data.total) * 100) : 0,
      attempts: data.attempts,
    }));

    list.sort((a, b) => b.percentage - a.percentage);
    return list;
  }, [history, decks]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    return history.filter((h) => h.type === activeFilter);
  }, [history, activeFilter]);

  const handleClearHistory = () => {
    clearStudyHistory();
    setHistory([]);
    setConfirmClearOpen(false);
  };

  const handleExportAnalytics = () => {
    const report = {
      exported_at: new Date().toISOString(),
      summary: {
        total_mcq_decks: mcqDecks.length,
        total_flashcard_decks: flashcardDecks.length,
        total_questions: totalQuestions,
        total_flashcards: totalCards,
        mcq_accuracy_percentage: mcqOverallAccuracy,
        flashcard_mastery_percentage: flashcardOverallMastery,
      },
      topic_breakdown: topicStats,
      history_logs: history,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `synapse_study_analytics_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-zinc-300 text-xs font-mono mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>LEARNING ANALYTICS & RETENTION HUB</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 font-mono">
            Study Diagnostics & Performance
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cross-deck metrics, active recall retention, topic proficiencies, and historical records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 text-xs font-mono transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Analytics</span>
          </button>
          {history.length > 0 && (
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/20 hover:bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Top HUD Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Questions Available */}
        <div className="p-4 bg-[#121215] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>MCQ BANK</span>
            <HelpCircle className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            {totalQuestions}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Across {mcqDecks.length} question sets
          </div>
        </div>

        {/* MCQ Accuracy */}
        <div className="p-4 bg-[#121215] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>MCQ ACCURACY</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-[#10B981]">
            {mcqOverallAccuracy}%
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {mcqHistory.length} tests completed
          </div>
        </div>

        {/* Theory Flashcards Available */}
        <div className="p-4 bg-[#121215] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>THEORY CARDS</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-zinc-100">
            {totalCards}
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Across {flashcardDecks.length} flashcard decks
          </div>
        </div>

        {/* Flashcard Mastery */}
        <div className="p-4 bg-[#121215] border border-[#27272A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>THEORY RETENTION</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">
            {flashcardOverallMastery}%
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            {flashcardHistory.length} recall sessions
          </div>
        </div>
      </div>

      {/* Main Grid: Topic Proficiency & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Topic Mastery Proficiency (5 cols) */}
        <div className="lg:col-span-5 bg-[#121215] border border-[#27272A] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-200">
                Topic Proficiency Breakdown
              </h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">{topicStats.length} Topics</span>
          </div>

          {topicStats.length === 0 ? (
            <div className="py-8 text-center space-y-2 text-zinc-500 text-xs font-mono">
              <Award className="w-8 h-8 text-zinc-600 mx-auto" />
              <div>No topic data recorded yet.</div>
              <p className="text-[11px] text-zinc-600">
                Complete practice tests or study flashcards to generate topic proficiencies.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {topicStats.map((item, idx) => (
                <div key={idx} className="space-y-1 bg-[#18181B] border border-[#27272A] p-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-200 truncate max-w-[200px]" title={item.topic}>
                      {item.topic}
                    </span>
                    <span
                      className={`font-bold ${
                        item.percentage >= 80
                          ? 'text-[#10B981]'
                          : item.percentage >= 50
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-[#121215] border border-[#27272A] h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        item.percentage >= 80
                          ? 'bg-[#10B981]'
                          : item.percentage >= 50
                          ? 'bg-cyan-400'
                          : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Historical Activity Feed (7 cols) */}
        <div className="lg:col-span-7 bg-[#121215] border border-[#27272A] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#10B981]" />
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-200">
                Study &amp; Test Activity History
              </h3>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {(['all', 'mcq', 'flashcard'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveFilter(mode)}
                  className={`px-2.5 py-1 border transition-colors ${
                    activeFilter === mode
                      ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
                      : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200 border-[#27272A]'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'mcq' ? 'MCQ Tests' : 'Flashcards'}
                </button>
              ))}
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-zinc-500 text-xs font-mono">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <div>No study history recorded yet.</div>
              <p className="text-[11px] text-zinc-600">
                When you finish practice quizzes, timed exams, or theory flashcard sessions,
                your results will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredHistory.map((item) => {
                const dateStr = new Date(item.timestamp).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const matchedDeck = decks.find((d) => d.id === item.deckId);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] gap-2 transition-colors group"
                  >
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 border uppercase ${
                            item.type === 'flashcard'
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/40 text-[#10B981]'
                          }`}
                        >
                          {item.type === 'flashcard' ? 'FLASHCARD' : item.mode || 'MCQ'}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">{dateStr}</span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 truncate" title={item.deckTitle}>
                        {item.deckTitle}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                      <div className="text-right font-mono">
                        <div
                          className={`text-sm font-bold ${
                            item.percentage >= 80
                              ? 'text-[#10B981]'
                              : item.percentage >= 50
                              ? 'text-cyan-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {item.percentage}%
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {item.score} / {item.total}
                        </div>
                      </div>

                      {matchedDeck && (
                        <button
                          onClick={() => onSelectDeck(matchedDeck, item.mode || (item.type === 'flashcard' ? 'flashcard' : 'practice'))}
                          className="px-2.5 py-1.5 bg-[#121215] hover:bg-[#10B981] text-zinc-300 hover:text-black border border-[#27272A] hover:border-[#10B981] text-[10px] font-mono flex items-center gap-1 transition-colors"
                          title="Retake or re-study this deck"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Retake</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Clearing History */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear Analytics History?"
        message="This will reset all recorded test attempts and flashcard session logs. Saved decks will not be affected."
        confirmLabel="Yes, Clear History"
        variant="danger"
        icon="trash"
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
