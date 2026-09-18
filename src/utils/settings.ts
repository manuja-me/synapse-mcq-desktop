import { invokeLoadPersistentSettings, invokeSavePersistentSettings } from './tauriBridge';

export interface AppSettings {
  defaultMode: 'practice' | 'exam';
  examTimerSeconds: number;
  autoAdvanceOnAnswer: boolean;
  autoAdvanceDelayMs: number;
  enableRewardPops: boolean;
  enableStreakMultipliers: boolean;
  enableSpeedBonus: boolean;
  autoTrimMemory: boolean;
  theme: 'dark' | 'light' | 'system';
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultMode: 'practice',
  examTimerSeconds: 60,
  autoAdvanceOnAnswer: false,
  autoAdvanceDelayMs: 800,
  enableRewardPops: true,
  enableStreakMultipliers: true,
  enableSpeedBonus: true,
  autoTrimMemory: true,
  theme: 'dark',
};

const SETTINGS_STORAGE_KEY = 'synapse_mcq_settings_v1';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (err) {
    console.warn('Failed to parse settings from storage, using defaults:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    const serialized = JSON.stringify(settings, null, 2);
    localStorage.setItem(SETTINGS_STORAGE_KEY, serialized);
    invokeSavePersistentSettings(serialized).catch((err) => {
      console.debug('Disk settings save error (non-fatal):', err);
    });
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function resetSettings(): AppSettings {
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    invokeSavePersistentSettings(JSON.stringify(DEFAULT_SETTINGS, null, 2)).catch(() => {});
  } catch (err) {
    console.error('Failed to clear settings:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function syncPersistentSettingsOnLaunch(): Promise<AppSettings | null> {
  try {
    const diskContent = await invokeLoadPersistentSettings();
    if (diskContent && diskContent.trim().length > 0) {
      const parsed = JSON.parse(diskContent) as AppSettings;
      if (parsed && typeof parsed === 'object') {
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged, null, 2));
        applyTheme(merged.theme);
        return merged;
      }
    }
    const current = loadSettings();
    applyTheme(current.theme);
    await invokeSavePersistentSettings(JSON.stringify(current, null, 2));
    return current;
  } catch (err) {
    console.warn('Persistent settings launch sync skipped:', err);
    const current = loadSettings();
    applyTheme(current.theme);
    return current;
  }
}

export function applyTheme(theme: 'dark' | 'light' | 'system' = 'dark'): void {
  try {
    const root = document.documentElement;
    const isLight =
      theme === 'light' ||
      (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

    if (isLight) {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  } catch (err) {
    console.warn('Failed to apply theme:', err);
  }
}
