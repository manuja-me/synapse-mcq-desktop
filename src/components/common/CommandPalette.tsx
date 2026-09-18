import React, { useEffect, useState } from 'react';
import { Search, Sparkles, BookOpen, Play, Clock, Cpu, X, FileJson, Settings } from 'lucide-react';
import { McqDeck } from '../../types/mcq';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'studio' | 'library' | 'quiz') => void;
  onStartQuiz: (deck: McqDeck, mode: 'practice' | 'exam') => void;
  onTrimMemory: () => void;
  onOpenSettings?: () => void;
  decks: McqDeck[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onStartQuiz,
  onTrimMemory,
  onOpenSettings,
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-[#121215] border border-[#27272A] shadow-2xl overflow-hidden text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input header */}
        <div className="flex items-center px-4 py-3 border-b border-[#27272A] gap-3">
          <Search className="w-4 h-4 text-[#10B981]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, topics, or question decks..."
            autoFocus
            className="w-full bg-transparent text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#27272A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1 text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
            Navigation & Actions
          </div>

          <button
            onClick={() => {
              onNavigate('studio');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-[#18181B] hover:text-[#10B981] transition-colors text-left group"
          >
            <div className="p-1.5 bg-[#18181B] border border-[#27272A] text-[#10B981]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-zinc-200 group-hover:text-[#10B981]">AI Prompt Studio</div>
              <div className="text-[11px] text-zinc-400">Generate unified Antigravity prompt for your PDF</div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Jump</span>
          </button>

          <button
            onClick={() => {
              onNavigate('library');
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-[#18181B] hover:text-[#10B981] transition-colors text-left group"
          >
            <div className="p-1.5 bg-[#18181B] border border-[#27272A] text-zinc-300">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-zinc-200 group-hover:text-[#10B981]">Deck Library & Ingestion</div>
              <div className="text-[11px] text-zinc-400">Manage question sets, import JSON or CSV</div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">Jump</span>
          </button>

          {onOpenSettings && (
            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-[#18181B] hover:text-[#10B981] transition-colors text-left group"
            >
              <div className="p-1.5 bg-[#18181B] border border-[#27272A] text-[#10B981]">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-zinc-200 group-hover:text-[#10B981]">Settings & Preferences</div>
                <div className="text-[11px] text-zinc-400">Configure quiz timers, gamification, and system RAM</div>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Ctrl+,</span>
            </button>
          )}

          <button
            onClick={() => {
              onTrimMemory();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs hover:bg-[#18181B] hover:text-[#10B981] transition-colors text-left group"
          >
            <div className="p-1.5 bg-[#18181B] border border-[#27272A] text-[#10B981]">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-zinc-200 group-hover:text-[#10B981]">Trim Working-Set RAM</div>
              <div className="text-[11px] text-zinc-400">Flush unused pages from system memory</div>
            </div>
            <span className="text-[10px] font-mono text-[#10B981]">Action</span>
          </button>

          {/* Decks quick launch */}
          {filteredDecks.length > 0 && (
            <>
              <div className="px-3 pt-3 pb-1 text-[10px] font-mono tracking-wider text-zinc-500 uppercase">
                Available Decks ({filteredDecks.length})
              </div>
              {filteredDecks.map((deck) => (
                <div
                  key={deck.id}
                  className="flex items-center justify-between px-3 py-2 text-xs bg-[#18181B]/50 hover:bg-[#18181B] border border-[#27272A] transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate mr-3">
                    <FileJson className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-zinc-200 truncate">{deck.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">
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
                      className="px-2 py-1 bg-[#10B981] text-[#09090B] hover:bg-[#059669] text-[10px] flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Play className="w-3 h-3" /> Practice
                    </button>
                    <button
                      onClick={() => {
                        onStartQuiz(deck, 'exam');
                        onClose();
                      }}
                      className="px-2 py-1 bg-[#27272A] hover:bg-[#3F3F46] text-zinc-200 text-[10px] flex items-center gap-1 font-medium transition-colors"
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
        <div className="px-4 py-2 bg-[#09090B] border-t border-[#27272A] text-[10px] text-zinc-500 flex items-center justify-between font-mono">
          <span>Navigate with arrows or click</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
};
