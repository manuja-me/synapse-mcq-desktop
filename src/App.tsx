import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileJson,
  Cpu,
  Layers,
  HelpCircle,
  Play,
  ArrowUpCircle,
  X
} from 'lucide-react';
import { McqDeck } from './types/mcq';
import { loadStoredDecks, syncPersistentDecksOnLaunch } from './utils/storage';
import { invokeTrimMemory } from './utils/tauriBridge';
import { AppSettings, loadSettings, saveSettings, applyTheme, syncPersistentSettingsOnLaunch } from './utils/settings';
import { checkForUpdates, ReleaseInfo } from './utils/updater';
import { TitleBar } from './components/common/TitleBar';
import { Sidebar } from './components/common/Sidebar';
import { SettingsModal } from './components/settings/SettingsModal';
import { CommandPalette } from './components/common/CommandPalette';
import { UpdateModal } from './components/common/UpdateModal';
import { PromptStudio } from './components/prompt-studio/PromptStudio';
import { DeckLibrary } from './components/library/DeckLibrary';
import { JsonImporter } from './components/library/JsonImporter';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { QuizContainer } from './components/quiz/QuizContainer';
import { FlashcardContainer } from './components/flashcards/FlashcardContainer';

export function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'import' | 'analytics'>('studio');
  const [decks, setDecks] = useState<McqDeck[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<{
    deck: McqDeck;
    mode: 'practice' | 'exam' | 'flashcard';
  } | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [trimToast, setTrimToast] = useState(false);

  // Auto-updater state
  const [updateInfo, setUpdateInfo] = useState<ReleaseInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateBannerDismissed, setUpdateBannerDismissed] = useState(false);

  // Load decks and settings on mount and sync with persistent OS disk storage
  useEffect(() => {
    // 1. Instant load from localStorage
    const storedSettings = loadSettings();
    setDecks(loadStoredDecks());
    setSettings(storedSettings);
    applyTheme(storedSettings.theme);

    // 2. Synchronize with persistent AppData disk files (survives updates, re-installs, and portable moves)
    syncPersistentDecksOnLaunch().then((diskDecks) => {
      if (diskDecks && diskDecks.length > 0) {
        setDecks(diskDecks);
      }
    });

    syncPersistentSettingsOnLaunch().then((diskSettings) => {
      if (diskSettings) {
        setSettings(diskSettings);
        applyTheme(diskSettings.theme);
      }
    });

    // 3. Proactively check for new GitHub Releases on application launch
    checkForUpdates().then((res) => {
      if (res.updateAvailable && res.latestRelease) {
        setUpdateInfo(res.latestRelease);
      }
    });
  }, []);

  // Sync theme changes
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

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

  const handleToggleTheme = () => {
    const isCurrentlyLight = document.documentElement.classList.contains('light');
    const newTheme = isCurrentlyLight ? 'dark' : 'light';
    const updated = { ...settings, theme: newTheme as 'dark' | 'light' };
    saveSettings(updated);
    setSettings(updated);
    applyTheme(newTheme);
  };

  const handleStartQuiz = (deck: McqDeck, mode?: 'practice' | 'exam' | 'flashcard') => {
    let chosenMode: 'practice' | 'exam' | 'flashcard';
    if (mode) {
      chosenMode = mode;
    } else if (
      deck.deck_type === 'flashcard' ||
      (Boolean(deck.cards && deck.cards.length > 0) && (!deck.questions || deck.questions.length === 0))
    ) {
      chosenMode = 'flashcard';
    } else {
      chosenMode = settings.defaultMode;
    }

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

  const handleDeckImported = (deck: McqDeck, autoStartMode?: 'practice' | 'exam' | 'flashcard') => {
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
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        updateAvailable={Boolean(updateInfo)}
        onOpenUpdater={() => setIsUpdateModalOpen(true)}
      />

      {/* Top Notification Banner if a new GitHub release is detected */}
      {updateInfo && !updateBannerDismissed && (
        <div className="bg-[#10B981] text-[#09090B] px-4 py-2 flex items-center justify-between text-xs font-mono font-bold z-40 border-b border-black flex-shrink-0 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 truncate pr-2">
            <ArrowUpCircle className="w-4 h-4 animate-bounce flex-shrink-0" />
            <span className="truncate">
              NEW UPDATE AVAILABLE: {updateInfo.tagName}! Click to download and install automatically.
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsUpdateModalOpen(true)}
              className="px-3 py-1 bg-[#09090B] text-[#10B981] hover:bg-zinc-900 border border-black font-bold uppercase transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setUpdateBannerDismissed(true)}
              className="p-1 hover:bg-black/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
          theme={settings.theme}
          onToggleTheme={handleToggleTheme}
          updateAvailable={Boolean(updateInfo)}
          onOpenUpdater={() => setIsUpdateModalOpen(true)}
        />

        {/* Right Content Workspace */}
        <main className="flex-1 h-full overflow-y-auto p-4 sm:p-6 bg-[#09090B]">
          {activeQuiz ? (
            activeQuiz.mode === 'flashcard' ? (
              <FlashcardContainer
                deck={activeQuiz.deck}
                onExitStudy={handleExitQuiz}
              />
            ) : (
              <QuizContainer
                deck={activeQuiz.deck}
                initialMode={activeQuiz.mode}
                onExitQuiz={handleExitQuiz}
              />
            )
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

              {activeTab === 'analytics' && (
                <AnalyticsTab
                  decks={decks}
                  onSelectDeck={handleStartQuiz}
                />
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
        onOpenUpdater={() => setIsUpdateModalOpen(true)}
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

      {/* Software Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        release={updateInfo}
      />
    </div>
  );
}
