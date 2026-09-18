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
 * Automatically picks the best Windows installer binary from release assets.
 * Prioritizes:
 * 1. .msi (clean installer)
 * 2. .exe (portable or setup installer)
 * 3. .zip (portable archive)
 */
export function pickBestWindowsAsset(assets: any[]): ReleaseAsset | null {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  // 1. MSI installer
  const msi = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.msi'));
  if (msi) {
    return {
      name: msi.name,
      browser_download_url: msi.browser_download_url,
      size: msi.size,
      content_type: msi.content_type,
    };
  }

  // 2. EXE installer
  const exe = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
  if (exe) {
    return {
      name: exe.name,
      browser_download_url: exe.browser_download_url,
      size: exe.size,
      content_type: exe.content_type,
    };
  }

  // 3. ZIP package
  const zip = assets.find((a: any) => typeof a?.name === 'string' && a.name.toLowerCase().endsWith('.zip'));
  if (zip) {
    return {
      name: zip.name,
      browser_download_url: zip.browser_download_url,
      size: zip.size,
      content_type: zip.content_type,
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

/**
 * Downloads and launches the selected update binary on Windows, falling back to browser download if needed.
 */
export async function executeAppUpdate(asset: ReleaseAsset): Promise<boolean> {
  return await invokeInstallGitHubUpdate(asset.browser_download_url, asset.name);
}
