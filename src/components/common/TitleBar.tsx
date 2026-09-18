import React from 'react';
import { Minus, Square, X, Cpu, Sparkles, Command, Sun, Moon, ArrowUpCircle } from 'lucide-react';
import { minimizeWindow, toggleMaximizeWindow, closeWindow } from '../../utils/tauriBridge';

interface TitleBarProps {
  activeDeckTitle?: string;
  onOpenCommandPalette: () => void;
  onTrimMemory: () => void;
  theme?: 'dark' | 'light' | 'system';
  onToggleTheme?: () => void;
  updateAvailable?: boolean;
  onOpenUpdater?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  activeDeckTitle,
  onOpenCommandPalette,
  onTrimMemory,
  theme = 'dark',
  onToggleTheme,
  updateAvailable = false,
  onOpenUpdater,
}) => {
  return (
    <header className="h-10 w-full bg-[#09090B] border-b border-[#27272A] flex items-center justify-between select-none z-50 fixed top-0 left-0 right-0">
      {/* Left: App Brand & Drag region */}
      <div data-tauri-drag-region className="flex items-center gap-3 px-3 h-full cursor-default">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/app-icon.png" alt="Synapse" className="w-5 h-5 object-contain" />
          <span className="text-xs font-bold tracking-wider text-white font-mono">
            SYNAPSE <span className="text-[10px] text-[#10B981]">MCQ</span>
          </span>
        </div>

        {/* Active deck breadcrumb */}
        {activeDeckTitle && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 pl-3 border-l border-[#27272A]">
            <span className="text-zinc-500 font-mono text-[10px]">ACTIVE:</span>
            <span className="text-zinc-200 max-w-[200px] truncate font-medium">{activeDeckTitle}</span>
          </div>
        )}
      </div>

      {/* Center: Window Drag Area & Quick Nav Trigger */}
      <div data-tauri-drag-region className="flex-1 h-full flex items-center justify-center px-4 cursor-default">
        <button
          data-tauri-drag-region="false"
          onClick={(e) => {
            e.stopPropagation();
            onOpenCommandPalette();
          }}
          className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#121215] border border-[#27272A] hover:border-[#3F3F46] text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
        >
          <Command className="w-3 h-3 text-[#10B981]" />
          <span>Quick Navigation</span>
          <kbd className="px-1.5 py-0.5 bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-zinc-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Theme Toggle, RAM Trim & Window Controls */}
      <div data-tauri-drag-region="false" className="flex items-center h-full gap-1.5 pr-1">
        {updateAvailable && onOpenUpdater && (
          <button
            data-tauri-drag-region="false"
            onClick={(e) => {
              e.stopPropagation();
              onOpenUpdater();
            }}
            title="New software version available on GitHub"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-[#10B981] text-[#10B981] text-[10px] font-mono font-bold transition-colors animate-pulse"
          >
            <ArrowUpCircle className="w-3.5 h-3.5 text-[#10B981]" />
            <span>UPDATE</span>
          </button>
        )}

        {onToggleTheme && (
          <button
            data-tauri-drag-region="false"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTheme();
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="flex items-center justify-center w-7 h-7 bg-[#121215] border border-[#27272A] hover:border-[#10B981]/50 text-zinc-300 hover:text-[#10B981] transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>
        )}

        <button
          data-tauri-drag-region="false"
          onClick={(e) => {
            e.stopPropagation();
            onTrimMemory();
          }}
          title="Active RAM Memory Flush (Win32 Working-Set Trim)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#121215] border border-[#27272A] hover:border-[#10B981]/50 text-[#10B981] text-[10px] font-mono transition-colors"
        >
          <Cpu className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">RAM TRIM</span>
        </button>

        {/* Window Control Buttons */}
        <div data-tauri-drag-region="false" className="flex items-center h-full border-l border-[#27272A]">
          <button
            data-tauri-drag-region="false"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow();
            }}
            title="Minimize"
            aria-label="Minimize"
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <button
            data-tauri-drag-region="false"
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximizeWindow();
            }}
            title="Maximize"
            aria-label="Maximize"
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>

          <button
            data-tauri-drag-region="false"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow();
            }}
            title="Close"
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#DC2626] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
