import {
  Sparkles,
  BookOpen,
  FileJson,
  Settings,
  Cpu,
  Play,
  Layers,
  LogOut,
  ShieldCheck,
  Check,
  BarChart3,
  Sun,
  Moon,
  ArrowUpCircle
} from 'lucide-react';
import { McqDeck } from '../../types/mcq';
import { APP_VERSION } from '../../utils/version';

interface SidebarProps {
  activeTab: 'studio' | 'library' | 'import' | 'analytics';
  onSelectTab: (tab: 'studio' | 'library' | 'import' | 'analytics') => void;
  deckCount: number;
  activeQuiz: {
    deck: McqDeck;
    mode: 'practice' | 'exam' | 'flashcard';
  } | null;
  onExitQuiz?: () => void;
  onOpenSettings: () => void;
  onTrimMemory: () => void;
  isTrimming?: boolean;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  updateAvailable?: boolean;
  onOpenUpdater?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  deckCount,
  activeQuiz,
  onExitQuiz,
  onOpenSettings,
  onTrimMemory,
  isTrimming = false,
  theme = 'dark',
  onToggleTheme,
  updateAvailable = false,
  onOpenUpdater,
}) => {
  return (
    <aside className="w-56 sm:w-60 h-[calc(100vh-2.5rem)] bg-[#0C0C0E] border-r border-[#27272A] flex flex-col justify-between select-none flex-shrink-0">
      {/* Top Section: Workspace Tabs */}
      <div className="p-3 space-y-4">
        {/* App Branding Tile with New Icon */}
        <div className="flex items-center gap-2.5 px-1 py-1 border-b border-[#27272A]/80 pb-3">
          <img
            src="/app-icon.png"
            alt="Synapse MCQ Studio"
            className="w-7 h-7 object-contain border border-[#27272A] flex-shrink-0"
          />
          <div className="leading-tight">
            <div className="text-xs font-bold font-mono tracking-wider text-white">SYNAPSE</div>
            <div className="text-[10px] font-mono text-[#10B981] tracking-wide">MCQ STUDIO</div>
          </div>
        </div>

        {/* Navigation Category Label */}
        <div className="px-2 pt-0.5 text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center justify-between">
          <span>WORKSPACE</span>
          <span className="text-[9px] text-[#10B981] font-bold">LOCAL</span>
        </div>

        {/* Primary Vertical Navigation Tabs */}
        <nav className="space-y-1.5 font-mono text-xs">
          <button
            onClick={() => onSelectTab('studio')}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left border ${
              activeTab === 'studio' && !activeQuiz
                ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
                : 'bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] border-[#27272A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Prompt Studio</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('library')}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left border ${
              activeTab === 'library' && !activeQuiz
                ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
                : 'bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] border-[#27272A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4" />
              <span>Question Bank</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.2 border ${
                activeTab === 'library' && !activeQuiz
                  ? 'bg-[#09090B] text-[#10B981] border-[#09090B]'
                  : 'bg-[#18181B] text-zinc-400 border-[#27272A]'
              }`}
            >
              {deckCount}
            </span>
          </button>

          <button
            onClick={() => onSelectTab('import')}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left border ${
              activeTab === 'import' && !activeQuiz
                ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
                : 'bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] border-[#27272A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileJson className="w-4 h-4" />
              <span>Ingest JSON</span>
            </div>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left border ${
              activeTab === 'analytics' && !activeQuiz
                ? 'bg-[#10B981] text-[#09090B] font-bold border-[#10B981]'
                : 'bg-[#121215] text-zinc-400 hover:text-zinc-100 hover:bg-[#18181B] border-[#27272A]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </div>
          </button>
        </nav>

        {/* Active Quiz or Flashcard Card indicator in Sidebar */}
        {activeQuiz && (
          <div className="p-3 bg-[#121215] border border-[#10B981]/60 space-y-2 mt-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#10B981]">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#10B981] inline-block animate-pulse"></span>
                {activeQuiz.mode === 'flashcard' ? 'STUDY SESSION' : 'ACTIVE TEST'}
              </span>
              <span className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400 uppercase">
                {activeQuiz.mode}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-100 truncate" title={activeQuiz.deck.title}>
              {activeQuiz.deck.title}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {activeQuiz.mode === 'flashcard'
                ? `${activeQuiz.deck.cards?.length || 0} Theory Cards`
                : `${activeQuiz.deck.questions.length} Questions`}
            </div>
            {onExitQuiz && (
              <button
                onClick={onExitQuiz}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#18181B] hover:bg-red-950/40 border border-[#27272A] hover:border-red-800/60 text-zinc-400 hover:text-red-300 text-xs font-mono transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>{activeQuiz.mode === 'flashcard' ? 'Exit Study' : 'Exit Test'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Settings, Theme, Updates & System Controls */}
      <div className="p-3 border-t border-[#27272A] bg-[#0A0A0C] space-y-2">
        {/* Update Notification Tile */}
        {updateAvailable && onOpenUpdater && (
          <button
            onClick={onOpenUpdater}
            className="w-full flex items-center justify-between px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 border border-[#10B981] text-[#10B981] text-xs font-mono font-bold transition-colors animate-pulse"
          >
            <div className="flex items-center gap-2">
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Update Ready</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#10B981] text-black">NEW</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-1.5 bg-[#121215] hover:bg-[#18181B] border border-[#27272A] text-zinc-300 hover:text-white text-xs font-mono transition-colors"
          >
            <div className="flex items-center gap-2">
              {theme === 'light' ? (
                <Moon className="w-3.5 h-3.5 text-zinc-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono uppercase">
              {theme === 'light' ? 'Light' : 'Dark'}
            </span>
          </button>
        )}

        {/* Centralized Settings Button */}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#121215] hover:bg-[#18181B] border border-[#27272A] hover:border-[#10B981]/50 text-zinc-300 hover:text-white text-xs font-mono transition-colors group"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-[#10B981] group-hover:rotate-45 transition-transform" />
            <span>Settings</span>
          </div>
          <kbd className="text-[10px] px-1 bg-[#18181B] border border-[#27272A] text-zinc-500 font-mono">
            Ctrl+,
          </kbd>
        </button>

        {/* Flush RAM Button */}
        <button
          onClick={onTrimMemory}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#121215] hover:bg-[#18181B] border border-[#27272A] hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
          title="Trim Win32 Working-Set Memory to sub-45MB"
        >
          <div className="flex items-center gap-2">
            <Cpu className={`w-3.5 h-3.5 text-[#10B981] ${isTrimming ? 'animate-spin' : ''}`} />
            <span>Flush RAM</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {isTrimming ? 'TRIMMED' : 'TRIM'}
          </span>
        </button>

        {/* System & Version Status */}
        <div className="pt-2 px-1 flex items-center justify-between text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-[#10B981]" />
            <span>OFFLINE</span>
          </div>
          <span className="text-zinc-400">{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  );
};
