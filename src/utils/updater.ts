import { APP_VERSION, APP_VERSION_NUMBER } from './version';
import { invokeInstallGitHubUpdate } from './tauriBridge';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

export interface ReleaseInfo {
  tagName: string;
  versionNumber: string;
  name: string;
  body: string;
  publishedAt: string;
  htmlUrl: string;
  bestAsset: ReleaseAsset | null;
  assets: ReleaseAsset[];
}

export interface UpdateCheckResult {
  updateAvailable: boolean;
  currentVersion: string;
  latestRelease: ReleaseInfo | null;
  error?: string;
}

/**
 * Compare two semver strings (e.g. "v0.1.8" vs "v0.1.7").
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const clean1 = (v1 || '').replace(/^v/i, '').trim();
  const clean2 = (v2 || '').replace(/^v/i, '').trim();

  const [core1, pre1] = clean1.split(/-(.+)/);
  const [core2, pre2] = clean2.split(/-(.+)/);

  const parts1 = (core1 || '0').split('.').map((p) => parseInt(p, 10) || 0);
  const parts2 = (core2 || '0').split('.').map((p) => parseInt(p, 10) || 0);

  const maxLen = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < maxLen; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  // Pre-release versions have lower precedence than normal versions
  if (!pre1 && pre2) return 1;
  if (pre1 && !pre2) return -1;
  if (pre1 && pre2) return pre1.localeCompare(pre2);

  return 0;
}

/**
 * Automatically picks the best Windows package from release assets.
 * Prioritizes:
 * 1. .zip (portable standalone binary package - best for direct atomic executable swap without installers)
 * 2. .exe (standalone executable or silent installer)
 * 3. .msi (clean installer)
 */
export function pickBestWindowsAsset(assets: any[]): ReleaseAsset | null {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  // 1. ZIP portable package (preferred for direct atomic self-replace)
  const zip = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.zip'));
  if (zip) {
    return {
      name: zip.name,
      browser_download_url: zip.browser_download_url,
      size: zip.size,
      content_type: zip.content_type,
    };
  }

  // 2. EXE standalone or installer
  const exe = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
  if (exe) {
    return {
      name: exe.name,
      browser_download_url: exe.browser_download_url,
      size: exe.size,
      content_type: exe.content_type,
    };
  }

  // 3. MSI package
  const msi = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.msi'));
  if (msi) {
    return {
      name: msi.name,
      browser_download_url: msi.browser_download_url,
      size: msi.size,
      content_type: msi.content_type,
    };
  }

  // Fallback to first available asset
  return {
    name: assets[0].name,
    browser_download_url: assets[0].browser_download_url,
    size: assets[0].size,
    content_type: assets[0].content_type,
  };
}

const GITHUB_REPO = 'manuja-me/synapse-mcq-desktop';
const RELEASES_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

/**
 * Check GitHub Releases for newer version of Synapse MCQ Desktop.
 */
export async function checkForUpdates(): Promise<UpdateCheckResult> {
  try {
    const res = await fetch(RELEASES_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return {
        updateAvailable: false,
        currentVersion: APP_VERSION,
        latestRelease: null,
        error: `GitHub API error: HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const tagName = data.tag_name || '';
    const cleanTag = tagName.replace(/^v/i, '');
    const isNewer = compareSemver(cleanTag, APP_VERSION_NUMBER) > 0;

    const rawAssets = Array.isArray(data.assets) ? data.assets : [];
    const formattedAssets: ReleaseAsset[] = rawAssets.map((a: any) => ({
      name: a.name,
      browser_download_url: a.browser_download_url,
      size: a.size,
      content_type: a.content_type,
    }));

    const bestAsset = pickBestWindowsAsset(rawAssets);

    const releaseInfo: ReleaseInfo = {
      tagName: tagName || `v${cleanTag}`,
      versionNumber: cleanTag,
      name: data.name || tagName,
      body: data.body || '',
      publishedAt: data.published_at || new Date().toISOString(),
      htmlUrl: data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`,
      bestAsset,
      assets: formattedAssets,
    };

    return {
      updateAvailable: isNewer,
      currentVersion: APP_VERSION,
      latestRelease: releaseInfo,
    };
  } catch (err: any) {
    return {
      updateAvailable: false,
      currentVersion: APP_VERSION,
      latestRelease: null,
      error: err?.message || 'Network error checking for updates',
    };
  }
}

export interface SelfUpdateProgress {
  downloaded: number;
  total: number;
  percentage: number;
  stage: 'downloading' | 'replacing' | 'relaunching' | 'completed';
}

/**
 * Downloads the update chunk-by-chunk with in-app progress, swaps the binary on disk,
 * and relaunches seamlessly without any external installer wizard or UAC dialog.
 */
export async function performSelfUpdate(
  asset: ReleaseAsset,
  onProgress?: (progress: SelfUpdateProgress) => void
): Promise<boolean> {
  const notify = (p: SelfUpdateProgress) => {
    if (onProgress) onProgress(p);
  };

  // Step 1: Try official @tauri-apps/plugin-updater if available
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const { relaunch } = await import('@tauri-apps/plugin-process');
    const update = await check();
    if (update?.available) {
      let downloaded = 0;
      let contentLength = 0;
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            notify({
              downloaded: 0,
              total: contentLength,
              percentage: 0,
              stage: 'downloading',
            });
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const pct = contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
            notify({
              downloaded,
              total: contentLength,
              percentage: pct,
              stage: 'downloading',
            });
            break;
          case 'Finished':
            notify({
              downloaded: contentLength,
              total: contentLength,
              percentage: 100,
              stage: 'replacing',
            });
            break;
        }
      });

      notify({
        downloaded,
        total: contentLength,
        percentage: 100,
        stage: 'relaunching',
      });
      await relaunch();
      return true;
    }
  } catch (pluginErr) {
    console.warn('Tauri updater plugin check/download skipped, using native chunked self-replacer:', pluginErr);
  }

  // Step 2: Native chunked streaming & atomic disk replacement engine
  const { invokeDownloadAndSelfReplace, listenUpdateDownloadProgress } = await import('./tauriBridge');
  let unlisten: (() => void) | null = null;
  try {
    unlisten = await listenUpdateDownloadProgress((p) => {
      const stage = p.percentage >= 99.5 ? 'replacing' : 'downloading';
      notify({
        downloaded: p.downloaded_bytes,
        total: p.total_bytes,
        percentage: p.percentage,
        stage,
      });
    });

    notify({
      downloaded: 0,
      total: asset.size || 0,
      percentage: 0,
      stage: 'downloading',
    });

    const success = await invokeDownloadAndSelfReplace(asset.browser_download_url, asset.name);
    notify({
      downloaded: asset.size || 0,
      total: asset.size || 0,
      percentage: 100,
      stage: 'relaunching',
    });
    return success;
  } finally {
    if (unlisten) unlisten();
  }
}

/**
 * Backwards-compatible wrapper that invokes the native self-update engine.
 */
export async function executeAppUpdate(asset: ReleaseAsset): Promise<boolean> {
  return await performSelfUpdate(asset);
}
