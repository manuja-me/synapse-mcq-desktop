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

export async function syncPersistentSettingsOnLaunch(): Promise<AppSettings> {
  try {
    const diskContent = await invokeLoadPersistentSettings();
    if (diskContent && diskContent.trim().length > 0) {
      const parsed = JSON.parse(diskContent) as AppSettings;
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged, null, 2));
      return merged;
    }
    const current = loadSettings();
    await invokeSavePersistentSettings(JSON.stringify(current, null, 2));
    return current;
  } catch (err) {
    console.warn('Persistent settings launch sync skipped:', err);
    return loadSettings();
  }
}
