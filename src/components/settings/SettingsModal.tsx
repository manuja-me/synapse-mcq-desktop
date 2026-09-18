import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Sliders,
  Zap,
  Cpu,
  Database,
  Info,
  X,
  RotateCcw,
  Download,
  Trash2,
  Check,
  ExternalLink,
  FolderOpen,
  Upload,
  RefreshCw
} from 'lucide-react';
import { AppSettings, loadSettings, saveSettings, resetSettings } from '../../utils/settings';
import { McqDeck } from '../../types/mcq';
import { loadStoredDecks, saveStoredDecks } from '../../utils/storage';
import { STARTER_DECKS } from '../../utils/sampleDecks';
import { invokeTrimMemory, invokeGetDataDirectory, invokeOpenDataDirectory } from '../../utils/tauriBridge';
import { ConfirmModal } from '../common/ConfirmModal';
import { APP_VERSION } from '../../utils/version';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged?: (settings: AppSettings) => void;
  onDecksUpdated?: (decks: McqDeck[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChanged,
  onDecksUpdated,
}) => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'gamification' | 'performance' | 'data' | 'about'>('general');
  const [saveToast, setSaveToast] = useState(false);
  const [ramTrimmed, setRamTrimmed] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [dataDirectoryPath, setDataDirectoryPath] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available' | 'error'>('idle');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      invokeGetDataDirectory().then((dir) => {
        if (dir) setDataDirectoryPath(dir);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
    if (onSettingsChanged) onSettingsChanged(next);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 1500);
  };

  const handleManualTrim = async () => {
    await invokeTrimMemory();
    setRamTrimmed(true);
    setTimeout(() => setRamTrimmed(false), 2000);
  };

  const handleExportData = () => {
    const decks = loadStoredDecks();
    const blob = new Blob([JSON.stringify(decks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-mcq-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetStarterDecks = () => {
    saveStoredDecks(STARTER_DECKS);
    if (onDecksUpdated) onDecksUpdated(STARTER_DECKS);
    setConfirmResetOpen(false);
    invokeTrimMemory();
  };

  const handleClearAllDecks = () => {
    saveStoredDecks([]);
    if (onDecksUpdated) onDecksUpdated([]);
    setConfirmClearOpen(false);
    invokeTrimMemory();
  };

  const handleRestoreDefaults = () => {
    const defaults = resetSettings();
    setSettings(defaults);
    if (onSettingsChanged) onSettingsChanged(defaults);
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].questions) {
          saveStoredDecks(parsed);
          if (onDecksUpdated) onDecksUpdated(parsed);
          setImportSuccessMessage(`Restored ${parsed.length} deck(s) from backup.`);
          setImportErrorMessage(null);
          setTimeout(() => setImportSuccessMessage(null), 3500);
        } else {
          setImportErrorMessage('Invalid backup file: JSON must contain an array of question decks.');
        }
      } catch (err: any) {
        setImportErrorMessage('Failed to parse backup JSON: ' + (err?.message || 'Invalid syntax'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCheckForUpdates = async () => {
    setUpdateStatus('checking');
    try {
      const response = await fetch('https://api.github.com/repos/manuja-me/synapse-mcq-desktop/releases/latest');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const latestTag = data.tag_name || '';
      setLatestVersion(latestTag);
      const current = APP_VERSION;
      if (latestTag && latestTag !== current) {
        setUpdateStatus('available');
      } else {
        setUpdateStatus('latest');
      }
    } catch {
      setUpdateStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#09090B] border border-[#27272A] shadow-2xl flex flex-col max-h-[85vh] text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272A] bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-xs font-bold font-mono tracking-wider text-zinc-100 uppercase">
              Settings & Preferences
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {saveToast && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#10B981] animate-in fade-in">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Layout: Left tabs + Right content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-44 border-r border-[#27272A] bg-[#0E0E11] p-2 space-y-1 flex flex-col">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors text-left ${
                activeTab === 'general'
                  ? 'bg-[#18181B] text-[#10B981] border-l-2 border-[#10B981] font-semibold'
                  : 'text-zinc-400 hover:bg-[#121215] hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General</span>
            </button>

            <button
              onClick={() => setActiveTab('gamification')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors text-left ${
                activeTab === 'gamification'
                  ? 'bg-[#18181B] text-[#10B981] border-l-2 border-[#10B981] font-semibold'
                  : 'text-zinc-400 hover:bg-[#121215] hover:text-zinc-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Gamification</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors text-left ${
                activeTab === 'performance'
                  ? 'bg-[#18181B] text-[#10B981] border-l-2 border-[#10B981] font-semibold'
                  : 'text-zinc-400 hover:bg-[#121215] hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>RAM & Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors text-left ${
                activeTab === 'data'
                  ? 'bg-[#18181B] text-[#10B981] border-l-2 border-[#10B981] font-semibold'
                  : 'text-zinc-400 hover:bg-[#121215] hover:text-zinc-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Storage & Data</span>
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-mono transition-colors text-left border-t border-[#27272A] pt-2 ${
                activeTab === 'about'
                  ? 'bg-[#18181B] text-[#10B981] border-l-2 border-[#10B981] font-semibold'
                  : 'text-zinc-400 hover:bg-[#121215] hover:text-zinc-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#09090B]">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#10B981] tracking-wider mb-1">
                    Quiz & Examination Defaults
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Configure standard behavior when starting questions and tests.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Default Test Mode</div>
                      <div className="text-[11px] text-zinc-500">
                        {settings.defaultMode === 'practice'
                          ? 'Instant explanations and feedback on answer'
                          : 'Timed exam mode with final diagnostic scorecard'}
                      </div>
                    </div>
                    <div className="flex border border-[#27272A]">
                      <button
                        onClick={() => updateSetting('defaultMode', 'practice')}
                        className={`px-3 py-1 text-xs font-mono ${
                          settings.defaultMode === 'practice'
                            ? 'bg-[#10B981] text-[#09090B] font-bold'
                            : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Practice
                      </button>
                      <button
                        onClick={() => updateSetting('defaultMode', 'exam')}
                        className={`px-3 py-1 text-xs font-mono ${
                          settings.defaultMode === 'exam'
                            ? 'bg-[#10B981] text-[#09090B] font-bold'
                            : 'bg-[#18181B] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        Exam
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Exam Timer Per Question</div>
                      <div className="text-[11px] text-zinc-500">Duration allocated per question in timed exam mode</div>
                    </div>
                    <select
                      value={settings.examTimerSeconds}
                      onChange={(e) => updateSetting('examTimerSeconds', Number(e.target.value))}
                      className="bg-[#18181B] border border-[#27272A] text-zinc-200 text-xs font-mono px-3 py-1 focus:outline-none focus:border-[#10B981]"
                    >
                      <option value={30}>30 Seconds</option>
                      <option value={45}>45 Seconds</option>
                      <option value={60}>60 Seconds (Default)</option>
                      <option value={90}>90 Seconds</option>
                      <option value={120}>120 Seconds</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Auto-Advance on Correct Answer</div>
                      <div className="text-[11px] text-zinc-500">
                        Automatically advance to the next question after answering
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoAdvanceOnAnswer}
                        onChange={(e) => updateSetting('autoAdvanceOnAnswer', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* GAMIFICATION TAB */}
            {activeTab === 'gamification' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#10B981] tracking-wider mb-1">
                    Visual Reward Engine
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Control gamified visual cues, streak multipliers, and quick strike bonuses. (Synthesized audio is 100% disabled).
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Floating Reward Chips</div>
                      <div className="text-[11px] text-zinc-500">Show floating score popups (+100 PTS) on correct answers</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableRewardPops}
                        onChange={(e) => updateSetting('enableRewardPops', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Streak Multiplier Bonus</div>
                      <div className="text-[11px] text-zinc-500">Multiply points for consecutive correct streaks (3x, 5x, 10x)</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableStreakMultipliers}
                        onChange={(e) => updateSetting('enableStreakMultipliers', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Quick Strike Speed Bonus</div>
                      <div className="text-[11px] text-zinc-500">Award +25 bonus points when answering correctly within 15 seconds</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enableSpeedBonus}
                        onChange={(e) => updateSetting('enableSpeedBonus', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* PERFORMANCE & RAM TAB */}
            {activeTab === 'performance' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#10B981] tracking-wider mb-1">
                    System RAM & Performance Engine
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Synapse is built with a strict sub-45 MB RAM footprint ceiling utilizing OS-level working-set trimming.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Auto-Flush RAM on Navigation</div>
                      <div className="text-[11px] text-zinc-500">Automatically flush unused heap memory back to the OS</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoTrimMemory}
                        onChange={(e) => updateSetting('autoTrimMemory', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#27272A] peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>

                  <div className="p-3 bg-[#121215] border border-[#27272A] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-zinc-200">Active RAM Memory Flush</div>
                        <div className="text-[11px] text-zinc-500">
                          Force Win32 `EmptyWorkingSet` / OS memory compact immediately
                        </div>
                      </div>
                      <button
                        onClick={handleManualTrim}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#10B981] text-[#10B981] text-xs font-mono hover:bg-[#10B981] hover:text-[#09090B] transition-colors"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{ramTrimmed ? 'FLUSHED!' : 'FLUSH NOW'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DATA MANAGEMENT TAB */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase text-[#10B981] tracking-wider mb-1">
                    Question Bank & Storage Management
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Your questions and attempts are permanently stored in your operating system's persistent app directory.
                  </p>
                </div>

                {importSuccessMessage && (
                  <div className="p-2.5 bg-emerald-950/40 border border-[#10B981] text-[#10B981] text-xs font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>{importSuccessMessage}</span>
                  </div>
                )}

                {importErrorMessage && (
                  <div className="p-2.5 bg-red-950/40 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" />
                    <span>{importErrorMessage}</span>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />

                <div className="space-y-3 pt-1">
                  {/* Persistent Directory Card */}
                  <div className="p-3 bg-[#121215] border border-[#27272A] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-zinc-200">Persistent OS AppData Storage</div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate" title={dataDirectoryPath || ''}>
                          {dataDirectoryPath || 'Resolving local directory...'}
                        </div>
                      </div>
                      <button
                        onClick={() => invokeOpenDataDirectory()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#10B981] text-[#10B981] text-xs font-mono hover:bg-[#10B981] hover:text-[#09090B] transition-colors flex-shrink-0"
                        title="Open folder in File Explorer / Finder"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>OPEN FOLDER</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-500 border-t border-[#27272A]/60 pt-1.5 leading-relaxed">
                      🛡️ <strong>Upgrade Safety:</strong> All question decks (`decks.json`), automatic backups (`backups/`), and preferences (`settings.json`) live here. Updating or replacing app binaries will NEVER overwrite or delete this folder.
                    </div>
                  </div>

                  {/* Export & Import Buttons */}
                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Export All Decks as JSON</div>
                      <div className="text-[11px] text-zinc-500">Save a timestamped backup file of all question decks</div>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#27272A] hover:border-zinc-400 text-xs font-mono text-zinc-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>EXPORT</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Import &amp; Restore Backup</div>
                      <div className="text-[11px] text-zinc-500">Restore question sets from an existing exported .json file</div>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#27272A] hover:border-[#10B981] text-xs font-mono text-zinc-200 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>RESTORE JSON</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-[#27272A]">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Restore Starter Sample Decks</div>
                      <div className="text-[11px] text-zinc-500">Reload built-in starter decks (Compiler Design, etc.)</div>
                    </div>
                    <button
                      onClick={() => setConfirmResetOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#27272A] hover:border-amber-500 text-xs font-mono text-zinc-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      <span>RESET STARTERS</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#121215] border border-red-950/40">
                    <div>
                      <div className="text-xs font-medium text-red-400">Clear All Decks</div>
                      <div className="text-[11px] text-zinc-500">Erase all saved question decks from disk and storage</div>
                    </div>
                    <button
                      onClick={() => setConfirmClearOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 border border-red-800/60 hover:bg-red-900/50 text-xs font-mono text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE ALL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3.5 pb-2 border-b border-[#27272A]/70">
                  <img
                    src="/app-icon.png"
                    alt="Synapse Icon"
                    className="w-12 h-12 object-contain border border-[#27272A] shadow-lg flex-shrink-0"
                  />
                  <div>
                    <h3 className="text-xs font-mono font-bold uppercase text-[#10B981] tracking-wider">
                      Synapse MCQ Studio
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Ultra-Low-RAM Desktop Platform for AI-Powered PDF MCQ Testing &amp; Learning.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#121215] border border-[#27272A] space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-[#27272A]/50">
                    <span className="text-zinc-500">Version</span>
                    <span className="text-[#10B981] font-bold">{APP_VERSION}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A]/50">
                    <span className="text-zinc-500">Runtime Architecture</span>
                    <span className="text-zinc-300">Tauri v2 + Rust + React 19 + Bun</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A]/50">
                    <span className="text-zinc-500">Memory Budget</span>
                    <span className="text-zinc-300">&lt; 45 MB Working Set</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#27272A]/50">
                    <span className="text-zinc-500">Data Persistence</span>
                    <span className="text-emerald-400">Persistent OS AppData File Storage</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Repository</span>
                    <span className="text-zinc-300">github.com/manuja-me/synapse-mcq-desktop</span>
                  </div>
                </div>

                {/* In-App Update Checker */}
                <div className="p-3 bg-[#121215] border border-[#27272A] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-zinc-200">Software Updates</div>
                      <div className="text-[11px] text-zinc-500">
                        {updateStatus === 'idle' && 'Check for newer releases on GitHub'}
                        {updateStatus === 'checking' && 'Querying GitHub Releases API...'}
                        {updateStatus === 'latest' && `You are running the latest version (${APP_VERSION})!`}
                        {updateStatus === 'available' && `New release ${latestVersion} available!`}
                        {updateStatus === 'error' && 'Could not reach GitHub Releases API.'}
                      </div>
                    </div>
                    <button
                      onClick={handleCheckForUpdates}
                      disabled={updateStatus === 'checking'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] border border-[#27272A] hover:border-[#10B981] text-xs font-mono text-zinc-200 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-[#10B981] ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
                      <span>CHECK</span>
                    </button>
                  </div>

                  {updateStatus === 'available' && (
                    <div className="p-2 bg-emerald-950/40 border border-[#10B981] text-xs font-mono flex items-center justify-between">
                      <span className="text-emerald-300">Upgrade to {latestVersion} (data is preserved automatically)</span>
                      <a
                        href="https://github.com/manuja-me/synapse-mcq-desktop/releases/latest"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#10B981] underline text-[11px]"
                      >
                        <span>Download</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#27272A] bg-[#121215]">
          <button
            onClick={handleRestoreDefaults}
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Restore Default Settings
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#10B981] text-[#09090B] font-mono text-xs font-bold hover:bg-[#059669] transition-colors"
          >
            DONE
          </button>
        </div>
      </div>

      {/* Confirmation Modals for Destructive Actions */}
      <ConfirmModal
        isOpen={confirmClearOpen}
        title="Clear All Saved Question Decks?"
        message="This action will delete all stored decks and attempt records from local storage. This action cannot be undone."
        confirmLabel="Yes, Delete All"
        variant="danger"
        icon="trash"
        onConfirm={handleClearAllDecks}
        onCancel={() => setConfirmClearOpen(false)}
      />

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Restore Starter Sample Decks?"
        message="This will overwrite current decks with the default built-in starter decks (Compiler Design, Operating Systems, etc.)."
        confirmLabel="Yes, Restore"
        variant="warning"
        icon="alert"
        onConfirm={handleResetStarterDecks}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
