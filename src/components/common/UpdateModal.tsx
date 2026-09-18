import React, { useState } from 'react';
import {
  ArrowUpCircle,
  X,
  Download,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Sparkles,
  Loader2
} from 'lucide-react';
import { ReleaseInfo, ReleaseAsset, executeAppUpdate } from '../../utils/updater';
import { APP_VERSION } from '../../utils/version';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  release: ReleaseInfo | null;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, release }) => {
  const [selectedAsset, setSelectedAsset] = useState<ReleaseAsset | null>(
    release?.bestAsset || release?.assets?.[0] || null
  );
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync selectedAsset when release prop changes
  React.useEffect(() => {
    if (release) {
      setSelectedAsset(release.bestAsset || release.assets?.[0] || null);
      setInstallStatus('idle');
      setErrorMessage(null);
    }
  }, [release]);

  if (!isOpen || !release) return null;

  const handleInstallNow = async () => {
    if (!selectedAsset) return;
    setInstallStatus('installing');
    setErrorMessage(null);

    try {
      await executeAppUpdate(selectedAsset);
      setInstallStatus('completed');
    } catch (err: any) {
      setInstallStatus('error');
      setErrorMessage(err?.message || 'Failed to download or launch the installer. You can download manually below.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-xl bg-[#09090B] border border-[#27272A] shadow-2xl flex flex-col max-h-[85vh] text-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#27272A] bg-[#121215]">
          <div className="flex items-center gap-2.5">
            <ArrowUpCircle className="w-4 h-4 text-[#10B981]" />
            <h2 className="text-xs font-bold font-mono tracking-wider text-zinc-100 uppercase">
              Software Update Available
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-[#27272A] transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Version Banner */}
          <div className="p-3.5 bg-[#121215] border border-[#27272A] flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400">Current Version: <span className="text-zinc-200 font-bold">{APP_VERSION}</span></div>
              <div className="text-sm font-bold font-mono text-[#10B981] flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Release: {release.tagName}</span>
              </div>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 text-right">
              <div>Released</div>
              <div>{formatDate(release.publishedAt)}</div>
            </div>
          </div>

          {/* Recommended Binary Package */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold uppercase text-zinc-400 tracking-wider">
              Installer Package Selection
            </div>

            {release.assets.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={selectedAsset?.name || ''}
                  onChange={(e) => {
                    const found = release.assets.find((a) => a.name === e.target.value);
                    if (found) setSelectedAsset(found);
                  }}
                  className="w-full bg-[#121215] border border-[#27272A] px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-[#10B981]"
                >
                  {release.assets.map((asset) => (
                    <option key={asset.name} value={asset.name}>
                      {asset.name} ({formatBytes(asset.size)}) {asset.name.endsWith('.msi') ? '[Recommended MSI]' : ''}
                    </option>
                  ))}
                </select>

                {selectedAsset && (
                  <div className="p-2.5 bg-[#0C0C0E] border border-[#27272A] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <FileCode className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                      <span className="text-zinc-300 truncate">{selectedAsset.name}</span>
                    </div>
                    <span className="text-zinc-500 flex-shrink-0">{formatBytes(selectedAsset.size)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#121215] border border-amber-800/40 text-xs font-mono text-amber-300">
                No direct binary attachments found for this release. You can download the source or packages directly from GitHub.
              </div>
            )}
          </div>

          {/* Release Notes */}
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-semibold uppercase text-zinc-400 tracking-wider">
              Release Notes & Changelog
            </div>
            <div className="p-3 bg-[#0C0C0E] border border-[#27272A] max-h-48 overflow-y-auto font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-text">
              {release.body || 'No release notes provided.'}
            </div>
          </div>

          {/* Status Messages */}
          {installStatus === 'installing' && (
            <div className="p-3 bg-emerald-950/30 border border-[#10B981] text-xs font-mono flex items-center gap-2 text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin text-[#10B981]" />
              <span>Downloading update and launching Windows installer... Please allow UAC prompt if shown.</span>
            </div>
          )}

          {installStatus === 'completed' && (
            <div className="p-3 bg-emerald-950/40 border border-[#10B981] text-xs font-mono flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Update downloaded! The installer has been launched. Please finish the installation setup.</span>
            </div>
          )}

          {installStatus === 'error' && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-xs font-mono flex items-start gap-2 text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Installation error:</div>
                <div className="text-[11px] text-red-200 mt-0.5">{errorMessage}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#27272A] bg-[#121215]">
          <a
            href={release.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View on GitHub</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] text-zinc-300 text-xs font-mono transition-colors"
            >
              Later
            </button>

            {selectedAsset && (
              <button
                onClick={handleInstallNow}
                disabled={installStatus === 'installing'}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-[#09090B] font-mono text-xs font-bold transition-colors"
              >
                {installStatus === 'installing' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>DOWNLOADING...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>INSTALL NOW</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
