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

    let deck: McqDeck;
    if (Array.isArray(parsed)) {
      deck = {
        id: 'deck-' + Date.now(),
        title: 'Imported Question Set',
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
        description: parsed.description,
        metadata: parsed.metadata,
        created_at: Date.now(),
        questions: parsed.questions,
      };
    } else {
      return {
        valid: false,
        error_message: 'JSON must either be a Deck object with a "questions" array, or a direct array of questions.',
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
