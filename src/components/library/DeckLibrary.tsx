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

interface DeckLibraryProps {
  decks: McqDeck[];
  onSelectDeck: (deck: McqDeck, mode: 'practice' | 'exam') => void;
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

  const filteredDecks = decks.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      d.questions.some((q) => q.topic?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDiff =
      selectedDifficulty === 'All' ||
      (d.metadata?.difficulty && d.metadata.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());

    return matchesSearch && matchesDiff;
  });

  const handleDelete = (e: React.MouseEvent, deckId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this deck from your library?')) {
      const updated = deleteStoredDeck(deckId);
      onDecksUpdated(updated);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel rounded-2xl p-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-violet/10 border border-neon-violet/25 text-neon-violet text-xs font-mono mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>QUESTION BANK HUB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            MCQ Decks & Question Banks
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {decks.length} total decks stored locally in high-speed offline storage.
          </p>
        </div>

        <button
          onClick={onOpenImporter}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-button-cyan text-xs font-semibold self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Import New MCQ JSON</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks by topic, title, or keyword..."
            className="w-full bg-obsidian-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-neon-cyan transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Easy', 'Medium', 'Hard', 'Balanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedDifficulty === diff
                  ? 'bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan font-semibold shadow-glow-cyan'
                  : 'bg-obsidian-900 text-slate-400 hover:text-slate-200 border border-white/[0.06]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <div className="text-sm font-semibold text-slate-300">No matching decks found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or import a new MCQ JSON set from Antigravity.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDecks.map((deck) => {
            const lastAttempt = deck.last_attempt;
            const topics = Array.from(
              new Set(deck.questions.map((q) => q.topic).filter(Boolean))
            );

            return (
              <div
                key={deck.id}
                className="glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4 group relative"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/25 text-neon-cyan text-[10px] font-mono font-medium">
                      {deck.metadata?.difficulty || 'Mixed'}
                    </span>

                    {/* Delete & Export Actions */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleExport(e, deck)}
                        title="Export JSON"
                        className="p-1 rounded-lg text-slate-400 hover:text-neon-cyan hover:bg-white/5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, deck.id)}
                        title="Delete deck"
                        className="p-1 rounded-lg text-slate-400 hover:text-neon-rose hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-neon-cyan transition-colors line-clamp-2">
                    {deck.title}
                  </h3>

                  {deck.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}
                </div>

                {/* Card Middle: Stats & Topics */}
                <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3 text-neon-cyan" />
                      <span>{deck.questions.length} Questions</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>~{Math.ceil(deck.questions.length * 1.5)}m</span>
                    </span>
                  </div>

                  {/* Topic Badges */}
                  {topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {topics.slice(0, 3).map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 text-[10px] truncate max-w-[120px]"
                        >
                          {topic}
                        </span>
                      ))}
                      {topics.length > 3 && (
                        <span className="text-[10px] text-slate-500 self-center">
                          +{topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Last Score Badge */}
                  {lastAttempt && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-obsidian-950/80 border border-white/[0.05] text-xs">
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-neon-amber" />
                        <span>Best Score:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          lastAttempt.percentage >= 80
                            ? 'text-neon-emerald'
                            : lastAttempt.percentage >= 50
                            ? 'text-neon-cyan'
                            : 'text-neon-amber'
                        }`}
                      >
                        {lastAttempt.percentage}% ({lastAttempt.score}/{lastAttempt.total})
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Launch Modes */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => onSelectDeck(deck, 'practice')}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-button-cyan text-xs font-semibold"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Practice</span>
                  </button>

                  <button
                    onClick={() => onSelectDeck(deck, 'exam')}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-button-violet text-xs font-semibold"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Exam</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
