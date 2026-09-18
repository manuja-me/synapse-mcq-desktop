import { McqDeck, DeckStats } from '../types/mcq';

export interface RustValidationResponse {
  valid: boolean;
  error_message?: string;
  deck?: McqDeck;
  stats?: DeckStats;
}

export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    '__TAURI_INTERNALS__' in window ||
    '__TAURI__' in window ||
    window.location.hostname === 'tauri.localhost' ||
    window.location.protocol === 'tauri:' ||
    window.location.protocol === 'asset:'
  );
}

export async function invokeTrimMemory(): Promise<boolean> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<boolean>('trim_memory');
  } catch (err) {
    console.debug('Memory trimming call skipped:', err);
    return false;
  }
}

export async function minimizeWindow(): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('app_minimize');
    return;
  } catch (err) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().minimize();
      return;
    } catch (err2) {
      if (isTauriEnvironment()) {
        console.error('Failed to minimize window:', err, err2);
      }
    }
  }
}

export async function toggleMaximizeWindow(): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('app_maximize');
    return;
  } catch (err) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().toggleMaximize();
      return;
    } catch (err2) {
      if (isTauriEnvironment()) {
        console.error('Failed to toggle maximize window:', err, err2);
      }
    }
  }
}

export async function closeWindow(): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('app_close');
    return;
  } catch (err) {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
      return;
    } catch (err2) {
      if (isTauriEnvironment()) {
        console.error('Failed to close window:', err, err2);
      }
    }
  }
}

export async function startDragging(): Promise<void> {
  if (!isTauriEnvironment()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().startDragging();
  } catch {
    // Non-fatal
  }
}

export async function validateWithRust(rawJson: string): Promise<RustValidationResponse> {
  const trimmed = rawJson.trim();
  if (
    trimmed.includes('"cards"') ||
    trimmed.includes('"deck_type": "flashcard"') ||
    trimmed.includes('"deck_type":"flashcard"')
  ) {
    return fallbackClientValidation(rawJson);
  }

  if (isTauriEnvironment()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<RustValidationResponse>('parse_and_validate_deck', { rawJson });
    } catch (err) {
      console.warn('Rust validation invocation skipped, using client parser:', err);
    }
  }
  return fallbackClientValidation(rawJson);
}

function fallbackClientValidation(rawJson: string): RustValidationResponse {
  try {
    const trimmed = rawJson.trim();
    if (!trimmed) {
      return { valid: false, error_message: 'JSON input is empty.' };
    }
    const parsed = JSON.parse(trimmed);

    // 1. Detect and Validate Flashcard Decks
    let isFlashcard = false;
    let rawCards: any[] = [];

    if (parsed.deck_type === 'flashcard' || Array.isArray(parsed.cards)) {
      isFlashcard = true;
      rawCards = Array.isArray(parsed.cards) ? parsed.cards : [];
    } else if (Array.isArray(parsed) && parsed.length > 0 && ('front' in parsed[0] || 'back' in parsed[0])) {
      isFlashcard = true;
      rawCards = parsed;
    }

    if (isFlashcard) {
      if (rawCards.length === 0) {
        return { valid: false, error_message: 'The flashcard deck contains 0 cards.' };
      }

      const topicsSet = new Set<string>();
      const diffCounts: Record<string, number> = {};
      const validatedCards: any[] = [];

      for (let i = 0; i < rawCards.length; i++) {
        const c = rawCards[i];
        const cNum = i + 1;
        if (!c.front || typeof c.front !== 'string' || !c.front.trim()) {
          return { valid: false, error_message: `Flashcard #${cNum} is missing front prompt text.` };
        }
        if (!c.back) {
          return { valid: false, error_message: `Flashcard #${cNum} is missing back answer text.` };
        }
        if (Array.isArray(c.back)) {
          if (c.back.length === 0) {
            return { valid: false, error_message: `Flashcard #${cNum} has an empty back answer array.` };
          }
        } else if (typeof c.back !== 'string' || !c.back.trim()) {
          return { valid: false, error_message: `Flashcard #${cNum} has empty back answer text.` };
        }

        if (c.topic) topicsSet.add(c.topic.trim());
        const d = (c.difficulty || 'Medium').toLowerCase();
        diffCounts[d] = (diffCounts[d] || 0) + 1;

        validatedCards.push({
          id: c.id ?? cNum,
          front: c.front.trim(),
          back: Array.isArray(c.back)
            ? c.back.map((item: any) => String(item).trim())
            : c.back.trim(),
          explanation: c.explanation?.trim(),
          topic: c.topic?.trim(),
          difficulty: c.difficulty || 'medium',
          tags: Array.isArray(c.tags) ? c.tags : undefined,
        });
      }

      const deck: McqDeck = {
        id: parsed.id || 'deck-fc-' + Date.now(),
        title: parsed.title || 'Imported Theory Flashcards',
        deck_type: 'flashcard',
        description: parsed.description || 'Theory flashcard deck',
        metadata: {
          difficulty: parsed.metadata?.difficulty || 'Balanced',
          total_cards: validatedCards.length,
          target_audience: parsed.metadata?.target_audience,
        },
        created_at: Date.now(),
        questions: [],
        cards: validatedCards,
      };

      const stats: DeckStats = {
        total_questions: validatedCards.length,
        topics: Array.from(topicsSet).sort(),
        difficulty_counts: diffCounts,
        estimated_minutes: Math.ceil(validatedCards.length * 1.2),
      };

      return { valid: true, deck, stats };
    }

    // 2. Detect and Validate MCQ Decks
    let deck: McqDeck;
    if (Array.isArray(parsed)) {
      deck = {
        id: 'deck-' + Date.now(),
        title: 'Imported Question Set',
        deck_type: 'mcq',
        description: 'Direct array import',
        created_at: Date.now(),
        metadata: {
          difficulty: 'Mixed',
          total_questions: parsed.length,
        },
        questions: parsed,
      };
    } else if (parsed && Array.isArray(parsed.questions)) {
      deck = {
        id: parsed.id || 'deck-' + Date.now(),
        title: parsed.title || 'Imported MCQ Deck',
        deck_type: 'mcq',
        description: parsed.description,
        metadata: parsed.metadata,
        created_at: Date.now(),
        questions: parsed.questions,
      };
    } else {
      return {
        valid: false,
        error_message: 'JSON must either be an MCQ Deck (with "questions" array) or a Flashcard Deck (with "cards" array).',
      };
    }

    if (deck.questions.length === 0) {
      return { valid: false, error_message: 'The questions array is empty.' };
    }

    const topicsSet = new Set<string>();
    const diffCounts: Record<string, number> = {};

    for (let i = 0; i < deck.questions.length; i++) {
      const q = deck.questions[i];
      const qNum = i + 1;
      if (!q.question || !q.question.trim()) {
        return { valid: false, error_message: `Question #${qNum} has empty question text.` };
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { valid: false, error_message: `Question #${qNum} must have at least 2 options.` };
      }
      if (typeof q.correct_answer !== 'number' || q.correct_answer < 0 || q.correct_answer >= q.options.length) {
        return {
          valid: false,
          error_message: `Question #${qNum} has an invalid correct_answer index (${q.correct_answer}). Must be between 0 and ${q.options.length - 1}.`,
        };
      }
      if (q.topic) topicsSet.add(q.topic.trim());
      const d = (q.difficulty || 'Medium').toLowerCase();
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    }

    const stats: DeckStats = {
      total_questions: deck.questions.length,
      topics: Array.from(topicsSet).sort(),
      difficulty_counts: diffCounts,
      estimated_minutes: Math.ceil(deck.questions.length * 1.5),
    };

    return { valid: true, deck, stats };
  } catch (err: any) {
    return {
      valid: false,
      error_message: `JSON Syntax Error: ${err?.message || 'Failed to parse JSON string.'}`,
    };
  }
}

export async function invokeGetDataDirectory(): Promise<string | null> {
  if (!isTauriEnvironment()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string>('get_data_directory');
  } catch (err) {
    console.debug('Failed to get data directory:', err);
    return null;
  }
}

export async function invokeOpenDataDirectory(): Promise<boolean> {
  if (!isTauriEnvironment()) return false;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<boolean>('open_data_directory');
  } catch (err) {
    console.warn('Failed to open data directory:', err);
    return false;
  }
}

export async function invokeLoadPersistentDecks(): Promise<string | null> {
  if (!isTauriEnvironment()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string | null>('load_persistent_decks');
  } catch (err) {
    console.debug('Persistent decks load skipped or not available:', err);
    return null;
  }
}

export async function invokeSavePersistentDecks(jsonContent: string): Promise<boolean> {
  if (!isTauriEnvironment()) return false;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<boolean>('save_persistent_decks', { jsonContent });
  } catch (err) {
    console.warn('Failed to persist decks to disk:', err);
    return false;
  }
}

export async function invokeLoadPersistentSettings(): Promise<string | null> {
  if (!isTauriEnvironment()) return null;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string | null>('load_persistent_settings');
  } catch (err) {
    console.debug('Persistent settings load skipped:', err);
    return null;
  }
}

export async function invokeSavePersistentSettings(jsonContent: string): Promise<boolean> {
  if (!isTauriEnvironment()) {
    return false;
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<boolean>('save_persistent_settings', { jsonContent });
    return result;
  } catch (err) {
    console.warn('Persistent settings save skipped (browser mode or unsupported):', err);
    return false;
  }
}

export async function invokeInstallGitHubUpdate(downloadUrl: string, filename: string): Promise<boolean> {
  if (!isTauriEnvironment()) {
    window.open(downloadUrl, '_blank');
    return true;
  }
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<boolean>('install_github_update', {
      downloadUrl,
      filename,
    });
    return result;
  } catch (err) {
    console.error('Failed to invoke install_github_update:', err);
    // Fallback: open in browser
    window.open(downloadUrl, '_blank');
    throw err;
  }
}
