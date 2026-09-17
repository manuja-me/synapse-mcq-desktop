import React from 'react';
import { Minus, Square, X, Cpu, Sparkles, Command } from 'lucide-react';
import { minimizeWindow, toggleMaximizeWindow, closeWindow, isTauriEnvironment } from '../../utils/tauriBridge';

interface TitleBarProps {
  activeDeckTitle?: string;
  onOpenCommandPalette: () => void;
  onTrimMemory: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  activeDeckTitle,
  onOpenCommandPalette,
  onTrimMemory,
}) => {
  const isTauri = isTauriEnvironment();

  return (
    <header
      data-tauri-drag-region
      className="h-11 w-full bg-obsidian-950/85 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-3 select-none z-50 fixed top-0 left-0 right-0"
    >
      {/* Left: App Brand & Window Controls */}
      <div className="flex items-center gap-3">
        {/* Window controls (Only in Tauri desktop mode) */}
        {isTauri && (
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={closeWindow}
              title="Close"
              className="w-3 h-3 rounded-full bg-neon-rose/80 hover:bg-neon-rose hover:shadow-glow-rose transition-all flex items-center justify-center group"
            >
              <X className="w-2 h-2 text-obsidian-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={minimizeWindow}
              title="Minimize"
              className="w-3 h-3 rounded-full bg-neon-amber/80 hover:bg-neon-amber transition-all flex items-center justify-center group"
            >
              <Minus className="w-2 h-2 text-obsidian-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={toggleMaximizeWindow}
              title="Maximize"
              className="w-3 h-3 rounded-full bg-neon-emerald/80 hover:bg-neon-emerald hover:shadow-glow-emerald transition-all flex items-center justify-center group"
            >
              <Square className="w-1.5 h-1.5 text-obsidian-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-violet p-0.5 flex items-center justify-center shadow-glow-cyan">
            <div className="w-full h-full bg-obsidian-950 rounded-[6px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            </div>
          </div>
          <span className="text-xs font-bold tracking-widest bg-gradient-to-r from-white via-slate-200 to-neon-cyan bg-clip-text text-transparent">
            SYNAPSE <span className="text-[10px] text-neon-cyan font-mono font-normal">MCQ</span>
          </span>
        </div>

        {/* Active deck breadcrumb */}
        {activeDeckTitle && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pl-3 border-l border-white/[0.08]">
            <span className="text-slate-500">Active:</span>
            <span className="text-slate-200 max-w-[200px] truncate font-medium">{activeDeckTitle}</span>
          </div>
        )}
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-obsidian-900 border border-white/[0.08] hover:border-neon-cyan/40 text-slate-400 hover:text-slate-200 text-xs transition-all shadow-inner group"
      >
        <Command className="w-3 h-3 text-neon-cyan group-hover:scale-110 transition-transform" />
        <span>Quick Navigation</span>
        <kbd className="px-1.5 py-0.5 rounded bg-obsidian-800 border border-white/10 text-[10px] font-mono text-slate-400">
          Ctrl+K
        </kbd>
      </button>

      {/* Right: RAM Optimization Badge & Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTrimMemory}
          title="Active RAM Memory Flush (Win32 Working-Set Trim)"
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[11px] font-mono hover:bg-neon-cyan/20 transition-all hover:shadow-glow-cyan"
        >
          <Cpu className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:inline">LOW-RAM CORE</span>
          <span className="text-[9px] px-1 bg-neon-cyan/20 rounded font-semibold">TRIM</span>
        </button>
      </div>
    </header>
  );
};
