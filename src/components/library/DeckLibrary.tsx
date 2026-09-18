import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  Clock,
  Trash2,
  Download,
  Plus,
  Search,
  CheckCircle2,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { McqDeck } from '../../types/mcq';
import { deleteStoredDeck } from '../../utils/storage';
import { ConfirmModal } from '../common/ConfirmModal';

interface DeckLibraryProps {
  decks: McqDeck[];
  onSelectDeck: (deck: McqDeck, mode: 'practice' | 'exam' | 'flashcard') => void;
  onOpenImporter: () => void;
  onDecksUpdated: (decks: McqDeck[]) => void;
}

export const DeckLibrary: React.FC<DeckLibraryProps> = ({
  decks,
  onSelectDeck,
  onOpenImporter,
  onDecksUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<'all' | 'mcq' | 'flashcard'>('all');

  const isDeckFlashcard = (d: McqDeck) =>
    d.deck_type === 'flashcard' ||
    (Boolean(d.cards && d.cards.length > 0) && (!d.questions || d.questions.length === 0));

  const mcqCount = decks.filter((d) => !isDeckFlashcard(d)).length;
  const flashcardCount = decks.filter(isDeckFlashcard).length;

  const filteredDecks = decks.filter((d) => {
    const isFlashcard = isDeckFlashcard(d);

    if (selectedType === 'mcq' && isFlashcard) return false;
    if (selectedType === 'flashcard' && !isFlashcard) return false;

    const qLower = searchQuery.toLowerCase();
    const matchesSearch =
      d.title.toLowerCase().includes(qLower) ||
      (d.description && d.description.toLowerCase().includes(qLower)) ||
      (d.questions && d.questions.some((q) => q.topic?.toLowerCase().includes(qLower))) ||
      (d.cards &&
        d.cards.some(
          (c) =>
            c.front.toLowerCase().includes(qLower) ||
            c.topic?.toLowerCase().includes(qLower) ||
            (Array.isArray(c.back) ? c.back.join(' ') : c.back).toLowerCase().includes(qLower)
        ));

    const matchesDiff =
      selectedDifficulty === 'All' ||
      (d.metadata?.difficulty &&
        d.metadata.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

    return matchesSearch && matchesDiff;
  });

  const [deckPendingDelete, setDeckPendingDelete] = useState<McqDeck | null>(null);

  const handleDeleteRequest = (e: React.MouseEvent, deck: McqDeck) => {
    e.stopPropagation();
    setDeckPendingDelete(deck);
  };

  const handleConfirmDelete = () => {
    if (!deckPendingDelete) return;
    const updated = deleteStoredDeck(deckPendingDelete.id);
    onDecksUpdated(updated);
    setDeckPendingDelete(null);
  };

  const handleExport = (e: React.MouseEvent, deck: McqDeck) => {
    e.stopPropagation();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_mcqs.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121215] border border-[#27272A] p-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#18181B] border border-[#27272A] text-zinc-300 text-xs font-mono mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#10B981]" />
            <span>QUESTION BANK & FLASHCARD HUB</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 font-mono">
            MCQ Decks & Theory Flashcards
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {decks.length} total decks ({mcqCount} MCQ sets, {flashcardCount} flashcard decks) stored locally in high-speed offline storage.
          </p>
        </div>

        <button
          onClick={onOpenImporter}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold self-start sm:self-auto transition-colors font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>IMPORT NEW JSON</span>
        </button>
      </div>

      {/* Deck Type Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-3 font-mono text-xs">
        <button
          onClick={() => setSelectedType('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
            selectedType === 'all'
              ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
              : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border-[#27272A]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Decks ({decks.length})</span>
        </button>

        <button
          onClick={() => setSelectedType('mcq')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
            selectedType === 'mcq'
              ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
              : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border-[#27272A]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>MCQ Sets ({mcqCount})</span>
        </button>

        <button
          onClick={() => setSelectedType('flashcard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 border transition-colors ${
            selectedType === 'flashcard'
              ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
              : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border-[#27272A]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>🎴 Theory Flashcards ({flashcardCount})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks by topic, title, prompt, or keyword..."
            className="w-full bg-[#121215] border border-[#27272A] pl-9 pr-4 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#10B981] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Easy', 'Medium', 'Hard', 'Balanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 text-xs font-mono transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-[#10B981] text-[#09090B] font-bold'
                  : 'bg-[#121215] text-zinc-400 hover:text-zinc-200 border border-[#27272A]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="bg-[#121215] border border-[#27272A] p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto" />
          <div className="text-sm font-semibold text-zinc-300 font-mono">No matching decks found</div>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms or import a new MCQ JSON set from Antigravity.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map((deck) => {
            const isFlashcard = isDeckFlashcard(deck);
            const lastAttempt = deck.last_attempt;
            const flashcardStats = deck.flashcard_stats;

            const topics = isFlashcard
              ? Array.from(
                  new Set((deck.cards || []).map((c) => c.topic).filter(Boolean))
                )
              : Array.from(
                  new Set(deck.questions.map((q) => q.topic).filter(Boolean))
                );

            return (
              <div
                key={deck.id}
                className="bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] p-5 flex flex-col justify-between space-y-4 group relative transition-colors"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-[#10B981] text-[10px] font-mono font-medium">
                        {deck.metadata?.difficulty || (isFlashcard ? 'Theory' : 'Mixed')}
                      </span>
                      {isFlashcard ? (
                        <span className="px-2 py-0.5 bg-[#10B981]/10 border border-[#10B981]/50 text-[#10B981] text-[10px] font-mono font-bold flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>FLASHCARDS</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 text-[10px] font-mono">
                          MCQ
                        </span>
                      )}
                    </div>

                    {/* Delete & Export Actions */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExport(e, deck)}
                        title="Export JSON"
                        className="p-1 text-zinc-400 hover:text-[#10B981] hover:bg-[#27272A] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteRequest(e, deck)}
                        title="Delete deck"
                        className="p-1 text-zinc-400 hover:text-red-400 hover:bg-[#27272A] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-100 group-hover:text-[#10B981] transition-colors line-clamp-2">
                    {deck.title}
                  </h3>

                  {deck.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}
                </div>

                {/* Card Middle: Stats & Topics */}
                <div className="space-y-3 pt-2 border-t border-[#27272A]">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      {isFlashcard ? (
                        <>
                          <Layers className="w-3 h-3 text-[#10B981]" />
                          <span>{deck.cards?.length || 0} Theory Cards</span>
                        </>
                      ) : (
                        <>
                          <HelpCircle className="w-3 h-3 text-[#10B981]" />
                          <span>{deck.questions.length} Questions</span>
                        </>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        ~{Math.ceil(isFlashcard ? (deck.cards?.length || 0) * 0.8 : deck.questions.length * 1.5)}m
                      </span>
                    </span>
                  </div>

                  {/* Topic Badges */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] text-zinc-400 text-[10px] truncate max-w-[120px] font-mono"
                        >
                          {topic}
                        </span>
                      ))}
                      {topics.length > 3 && (
                        <span className="text-[10px] text-zinc-500 self-center font-mono">
                          +{topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Flashcard Mastery or MCQ Last Score Badge */}
                  {isFlashcard && flashcardStats ? (
                    <div className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] text-xs">
                      <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Retention Mastery:</span>
                      </span>
                      <span className="font-mono font-bold text-[#10B981]">
                        {Math.round(
                          (flashcardStats.mastered_count /
                            (flashcardStats.total_cards || 1)) *
                            100
                        )}
                        % ({flashcardStats.mastered_count}/{flashcardStats.total_cards})
                      </span>
                    </div>
                  ) : !isFlashcard && lastAttempt ? (
                    <div className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] text-xs">
                      <span className="text-zinc-400 text-[11px] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Best Score:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          lastAttempt.percentage >= 80
                            ? 'text-[#10B981]'
                            : lastAttempt.percentage >= 50
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {lastAttempt.percentage}% ({lastAttempt.score}/{lastAttempt.total})
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Card Bottom: Launch Action */}
                {isFlashcard ? (
                  <div className="pt-2">
                    <button
                      onClick={() => onSelectDeck(deck, 'flashcard')}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors snappy-press"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Study Flashcards</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onSelectDeck(deck, 'practice')}
                      className="flex items-center justify-center gap-1.5 py-2 bg-[#10B981] hover:bg-[#059669] text-[#09090B] text-xs font-semibold font-mono transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Practice</span>
                    </button>

                    <button
                      onClick={() => onSelectDeck(deck, 'exam')}
                      className="flex items-center justify-center gap-1.5 py-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-200 text-xs font-semibold font-mono transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Exam</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Native Desktop Style Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deckPendingDelete}
        title="Remove Question Deck"
        subtitle="Permanent Deletion"
        icon="trash"
        variant="danger"
        confirmLabel="Yes, Delete Deck"
        cancelLabel="Keep Deck"
        onCancel={() => setDeckPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to remove this deck from your library? This action will permanently remove all questions and past performance history from local offline storage."
        details={
          deckPendingDelete ? (
            <div className="space-y-1.5">
              <div className="flex justify-between items-start gap-2">
                <span className="text-zinc-500">Deck:</span>
                <span className="text-zinc-200 font-bold truncate text-right">{deckPendingDelete.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Total Questions:</span>
                <span className="text-[#10B981] font-bold">{deckPendingDelete.questions.length} MCQs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Difficulty:</span>
                <span className="text-zinc-400">{deckPendingDelete.metadata?.difficulty || 'Mixed'}</span>
              </div>
              {deckPendingDelete.last_attempt && (
                <div className="flex justify-between items-center text-amber-400">
                  <span className="text-zinc-500">Best Score:</span>
                  <span>{deckPendingDelete.last_attempt.percentage}% ({deckPendingDelete.last_attempt.score}/{deckPendingDelete.last_attempt.total})</span>
                </div>
              )}
            </div>
          ) : null
        }
      />
    </div>
  );
};
