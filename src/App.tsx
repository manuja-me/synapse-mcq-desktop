import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileJson,
  Cpu,
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';
import { McqDeck } from './types/mcq';
import { loadStoredDecks } from './utils/storage';
import { invokeTrimMemory } from './utils/tauriBridge';
import { TitleBar } from './components/common/TitleBar';
import { CommandPalette } from './components/common/CommandPalette';
import { PromptStudio } from './components/prompt-studio/PromptStudio';
import { DeckLibrary } from './components/library/DeckLibrary';
import { JsonImporter } from './components/library/JsonImporter';
import { QuizContainer } from './components/quiz/QuizContainer';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'import'>('studio');
  const [decks, setDecks] = useState<McqDeck[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<{
    deck: McqDeck;
    mode: 'practice' | 'exam';
  } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [trimToast, setTrimToast] = useState(false);

  // Load decks on mount
  useEffect(() => {
    const loaded = loadStoredDecks();
    setDecks(loaded);
  }, []);

  const handleStartQuiz = (deck: McqDeck, mode: 'practice' | 'exam') => {
    setActiveQuiz({ deck, mode });
    invokeTrimMemory();
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setDecks(loadStoredDecks());
    invokeTrimMemory();
  };

  const handleDeckImported = (deck: McqDeck, autoStartMode?: 'practice' | 'exam') => {
    const updated = loadStoredDecks();
    setDecks(updated);
    if (autoStartMode) {
      setActiveQuiz({ deck, mode: autoStartMode });
    } else {
      setActiveTab('library');
    }
    invokeTrimMemory();
  };

  const handleManualTrimMemory = async () => {
    await invokeTrimMemory();
    setTrimToast(true);
    setTimeout(() => setTrimToast(false), 2200);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col pt-11 relative overflow-x-hidden select-none">
      {/* Ambient background glows */}
      <div className="fixed top-12 left-1/4 w-[600px] h-[300px] bg-neon-cyan/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-12 right-1/4 w-[600px] h-[300px] bg-neon-violet/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Frameless Window TitleBar */}
      <TitleBar
        activeDeckTitle={activeQuiz?.deck.title}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onTrimMemory={handleManualTrimMemory}
      />

      {/* Main App Container */}
      <main className="flex-1 w-full p-4 sm:p-6 max-w-7xl mx-auto overflow-y-auto">
        {activeQuiz ? (
          <QuizContainer
            deck={activeQuiz.deck}
            initialMode={activeQuiz.mode}
            onExitQuiz={handleExitQuiz}
          />
        ) : (
          <div className="space-y-6">
            {/* Nav Tabs Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('studio')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'studio'
                      ? 'bg-neon-cyan text-obsidian-950 font-bold shadow-glow-cyan'
                      : 'bg-obsidian-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Prompt Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('library')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'library'
                      ? 'bg-neon-cyan text-obsidian-950 font-bold shadow-glow-cyan'
                      : 'bg-obsidian-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Question Bank ({decks.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'import'
                      ? 'bg-neon-cyan text-obsidian-950 font-bold shadow-glow-cyan'
                      : 'bg-obsidian-900/80 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Ingest MCQ JSON</span>
                </button>
              </nav>

              {/* Quick Launch sample deck */}
              {decks.length > 0 && activeTab === 'studio' && (
                <button
                  onClick={() => handleStartQuiz(decks[0], 'practice')}
                  className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-neon-cyan transition-colors"
                >
                  <Play className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>Quick Test ({decks[0].title.slice(0, 24)}...)</span>
                </button>
              )}
            </div>

            {/* Tab Views */}
            {activeTab === 'studio' && (
              <PromptStudio onGoToIngestion={() => setActiveTab('import')} />
            )}

            {activeTab === 'library' && (
              <DeckLibrary
                decks={decks}
                onSelectDeck={handleStartQuiz}
                onOpenImporter={() => setActiveTab('import')}
                onDecksUpdated={setDecks}
              />
            )}

            {activeTab === 'import' && (
              <JsonImporter onDeckImported={handleDeckImported} />
            )}
          </div>
        )}
      </main>

      {/* Floating RAM Trim Toast */}
      {trimToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-neon-emerald text-xs font-mono shadow-glow-emerald animate-in fade-in slide-in-from-bottom-2 duration-150">
          <Cpu className="w-4 h-4 animate-spin" />
          <span>Working-Set RAM actively flushed to OS memory manager!</span>
        </div>
      )}

      {/* Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => {
          setActiveQuiz(null);
          setActiveTab(view === 'quiz' ? 'library' : view);
        }}
        onStartQuiz={handleStartQuiz}
        onTrimMemory={handleManualTrimMemory}
        decks={decks}
      />
    </div>
  );
}
