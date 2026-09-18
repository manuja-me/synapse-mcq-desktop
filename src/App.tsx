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
import { loadStoredDecks, syncPersistentDecksOnLaunch } from './utils/storage';
import { invokeTrimMemory } from './utils/tauriBridge';
import { AppSettings, loadSettings, syncPersistentSettingsOnLaunch } from './utils/settings';
import { TitleBar } from './components/common/TitleBar';
import { Sidebar } from './components/common/Sidebar';
import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/common/CommandPalette';
import { PromptStudio } from './components/prompt-studio/PromptStudio';
import { DeckLibrary } from './components/library/DeckLibrary';
import { JsonImporter } from './components/library/JsonImporter';
import { QuizContainer } from './components/quiz/QuizContainer';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'import'>('studio');
  const [decks, setDecks] = useState<McqDeck[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{
    deck: McqDeck;
    mode: 'practice' | 'exam';
  } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [trimToast, setTrimToast] = useState(false);

  // Load decks and settings on mount and sync with persistent OS disk storage
  useEffect(() => {
    // 1. Instant load from localStorage
    setDecks(loadStoredDecks());
    setSettings(loadSettings());

    // 2. Synchronize with persistent AppData disk files (survives updates, re-installs, and portable moves)
    syncPersistentDecksOnLaunch().then((diskDecks) => {
      if (diskDecks && diskDecks.length > 0) {
        setDecks(diskDecks);
      }
    });

    syncPersistentSettingsOnLaunch().then((diskSettings) => {
      if (diskSettings) {
        setSettings(diskSettings);
      }
    });
  }, []);

  // Global keyboard shortcuts (Ctrl+, for Settings, Ctrl+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartQuiz = (deck: McqDeck, mode?: 'practice' | 'exam') => {
    const chosenMode = mode || settings.defaultMode;
    setActiveQuiz({ deck, mode: chosenMode });
    if (settings.autoTrimMemory) {
      invokeTrimMemory();
    }
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setDecks(loadStoredDecks());
    if (settings.autoTrimMemory) {
      invokeTrimMemory();
    }
  };

  const handleDeckImported = (deck: McqDeck, autoStartMode?: 'practice' | 'exam') => {
    const updated = loadStoredDecks();
    setDecks(updated);
    if (autoStartMode) {
      setActiveQuiz({ deck, mode: autoStartMode });
    } else {
      setActiveTab('library');
    }
    if (settings.autoTrimMemory) {
      invokeTrimMemory();
    }
  };

  const handleManualTrimMemory = async () => {
    await invokeTrimMemory();
    setTrimToast(true);
    setTimeout(() => setTrimToast(false), 2200);
  };

  return (
    <div className="h-screen bg-[#09090B] text-zinc-100 flex flex-col pt-10 relative overflow-hidden select-none">
      {/* Top Frameless Window TitleBar */}
      <TitleBar
        activeDeckTitle={activeQuiz?.deck.title}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onTrimMemory={handleManualTrimMemory}
      />

      {/* Main Desktop App Layout: Left Sidebar + Right Content Area */}
      <div className="flex-1 flex flex-row w-full overflow-hidden">
        {/* Left Desktop Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveQuiz(null);
            setActiveTab(tab);
            if (settings.autoTrimMemory) {
              invokeTrimMemory();
            }
          }}
          deckCount={decks.length}
          activeQuiz={activeQuiz}
          onExitQuiz={handleExitQuiz}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onTrimMemory={handleManualTrimMemory}
          isTrimming={trimToast}
        />

        {/* Right Content Workspace */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[#09090B]">
          {activeQuiz ? (
            <QuizContainer
              deck={activeQuiz.deck}
              initialMode={activeQuiz.mode}
              onExitQuiz={handleExitQuiz}
            />
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
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
      </div>

      {/* Floating RAM Trim Toast Notification */}
      {trimToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#121215] border border-[#10B981] text-[#10B981] text-xs font-mono animate-in fade-in duration-150 shadow-2xl">
          <Cpu className="w-4 h-4 animate-spin" />
          <span>Working-Set RAM actively flushed to OS memory manager</span>
        </div>
      )}

      {/* Centralized Settings & Preferences Modal (Ctrl+,) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={setSettings}
        onDecksUpdated={setDecks}
      />

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
        onOpenSettings={() => setIsSettingsOpen(true)}
        decks={decks}
      />
    </div>
  );
}
