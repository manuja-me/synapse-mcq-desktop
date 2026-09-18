import React from 'react';
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
  Check
} from 'lucide-react';
import { McqDeck } from '../../types/mcq';

interface SidebarProps {
  activeTab: 'studio' | 'library' | 'import';
  onSelectTab: (tab: 'studio' | 'library' | 'import') => void;
  deckCount: number;
  activeQuiz: {
    deck: McqDeck;
    mode: 'practice' | 'exam';
  } | null;
  onExitQuiz?: () => void;
  onOpenSettings: () => void;
  onTrimMemory: () => void;
  isTrimming?: boolean;
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
}) => {
  return (
    <aside className="w-56 sm:w-60 h-[calc(100vh-2.5rem)] bg-[#0C0C0E] border-r border-[#27272A] flex flex-col justify-between select-none flex-shrink-0">
      {/* Top Section: Workspace Tabs */}
      <div className="p-3 space-y-4">
        {/* Navigation Category Label */}
        <div className="px-2 pt-1 text-[10px] font-mono tracking-widest text-zinc-500 uppercase flex items-center justify-between">
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
        </nav>

        {/* Active Quiz Card indicator in Sidebar */}
        {activeQuiz && (
          <div className="p-3 bg-[#121215] border border-[#10B981]/60 space-y-2 mt-4 animate-in fade-in">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#10B981]">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2 h-2 bg-[#10B981] inline-block animate-pulse"></span>
                ACTIVE TEST
              </span>
              <span className="px-1 bg-[#18181B] border border-[#27272A] text-zinc-400 uppercase">
                {activeQuiz.mode}
              </span>
            </div>
            <div className="text-xs font-semibold text-zinc-100 truncate" title={activeQuiz.deck.title}>
              {activeQuiz.deck.title}
            </div>
            <div className="text-[11px] text-zinc-400 font-mono">
              {activeQuiz.deck.questions.length} Questions
            </div>
            {onExitQuiz && (
              <button
                onClick={onExitQuiz}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#18181B] hover:bg-red-950/40 border border-[#27272A] hover:border-red-800/60 text-zinc-400 hover:text-red-300 text-xs font-mono transition-colors"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit Test</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Section: Settings & System Controls */}
      <div className="p-3 border-t border-[#27272A] bg-[#0A0A0C] space-y-2">
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
          <span className="text-zinc-400">v0.1.6</span>
        </div>
      </div>
    </aside>
  );
};
