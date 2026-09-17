import React, { useEffect, useState } from 'react';
import { Search, Sparkles, BookOpen, Play, Clock, Cpu, X, FileJson } from 'lucide-react';
import { McqDeck } from '../../types/mcq';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'studio' | 'library' | 'quiz') => void;
  onStartQuiz: (deck: McqDeck, mode: 'practice' | 'exam') => void;
  onTrimMemory: () => void;
  decks: McqDeck[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onStartQuiz,
  onTrimMemory,
  decks,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDecks = decks.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.questions.some((q) => q.topic?.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-obsidian-900 border border-white/10 rounded-2xl shadow-2xl shadow-neon-cyan/10 overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input header */}
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-neon-cyan" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, topics, or question decks..."
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Navigation & Actions
          </div>

          <button
            onClick={() => {
              onNavigate('studio');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-white/[0.06] hover:text-neon-cyan transition-all text-left group"
          >
            <div className="p-1.5 rounded-lg bg-neon-cyan/10 text-neon-cyan">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-200 group-hover:text-neon-cyan">AI Prompt Studio</div>
              <div className="text-[11px] text-slate-400">Generate unified Antigravity prompt for your PDF</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Jump</span>
          </button>

          <button
            onClick={() => {
              onNavigate('library');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-white/[0.06] hover:text-neon-cyan transition-all text-left group"
          >
            <div className="p-1.5 rounded-lg bg-neon-violet/10 text-neon-violet">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-200 group-hover:text-neon-violet">Deck Library & Ingestion</div>
              <div className="text-[11px] text-slate-400">Manage question sets, import JSON or CSV</div>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Jump</span>
          </button>

          <button
            onClick={() => {
              onTrimMemory();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-white/[0.06] hover:text-neon-emerald transition-all text-left group"
          >
            <div className="p-1.5 rounded-lg bg-neon-emerald/10 text-neon-emerald">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-slate-200 group-hover:text-neon-emerald">Trim Working-Set RAM</div>
              <div className="text-[11px] text-slate-400">Flush unused pages from system memory</div>
            </div>
            <span className="text-[10px] font-mono text-neon-emerald">Action</span>
          </button>

          {/* Decks quick launch */}
          {filteredDecks.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                Available Decks ({filteredDecks.length})
              </div>
              {filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-white/[0.02] hover:bg-white/[0.06] transition-all"
                >
                  <div className="flex items-center gap-2.5 truncate mr-3">
                    <FileJson className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-slate-200 truncate">{deck.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {deck.questions.length} questions • {deck.metadata?.difficulty || 'Mixed'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        onStartQuiz(deck, 'practice');
                        onClose();
                      }}
                      className="px-2 py-1 rounded-lg bg-neon-cyan/10 hover:bg-neon-cyan/25 text-neon-cyan text-[11px] flex items-center gap-1 font-medium transition-all"
                    >
                      <Play className="w-3 h-3" /> Practice
                    </button>
                    <button
                      onClick={() => {
                        onStartQuiz(deck, 'exam');
                        onClose();
                      }}
                      className="px-2 py-1 rounded-lg bg-neon-violet/10 hover:bg-neon-violet/25 text-neon-violet text-[11px] flex items-center gap-1 font-medium transition-all"
                    >
                      <Clock className="w-3 h-3" /> Exam
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-obsidian-950/80 border-t border-white/[0.06] text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Navigate with arrows or click</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
