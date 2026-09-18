import { McqDeck, QuizSessionState, StudyHistoryEntry } from '../types/mcq';
import { STARTER_DECKS } from './sampleDecks';
import { invokeLoadPersistentDecks, invokeSavePersistentDecks } from './tauriBridge';

const DECKS_STORAGE_KEY = 'synapse_mcq_decks_v1';
const RECENT_SESSION_KEY = 'synapse_mcq_recent_session_v1';
const HISTORY_STORAGE_KEY = 'synapse_mcq_history_v1';

export function loadStoredDecks(): McqDeck[] {
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    if (!raw) {
      // Seed with starter decks
      saveStoredDecks(STARTER_DECKS);
      return STARTER_DECKS;
    }
    const parsed = JSON.parse(raw) as McqDeck[];
    return parsed.length > 0 ? parsed : STARTER_DECKS;
  } catch (err) {
    console.error('Failed to load decks from storage:', err);
    return STARTER_DECKS;
  }
}

export function saveStoredDecks(decks: McqDeck[]): void {
  try {
    const serialized = JSON.stringify(decks, null, 2);
    localStorage.setItem(DECKS_STORAGE_KEY, serialized);
    // Asynchronously sync to persistent OS AppData disk file
    invokeSavePersistentDecks(serialized).catch((err) => {
      console.debug('Disk save error (non-fatal):', err);
    });
  } catch (err) {
    console.error('Failed to save decks:', err);
  }
}

/**
 * Initializes persistent storage on app launch.
 * Synchronizes between disk (AppData/com.synapse.mcq/decks.json) and localStorage.
 */
export async function syncPersistentDecksOnLaunch(): Promise<McqDeck[]> {
  try {
    const diskContent = await invokeLoadPersistentDecks();
    if (diskContent && diskContent.trim().length > 0) {
      const parsed = JSON.parse(diskContent) as McqDeck[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(parsed, null, 2));
        return parsed;
      }
    }
    // If no disk file exists yet, migrate current localStorage decks to disk
    const current = loadStoredDecks();
    await invokeSavePersistentDecks(JSON.stringify(current, null, 2));
    return current;
  } catch (err) {
    console.warn('Persistent decks launch sync skipped:', err);
    return loadStoredDecks();
  }
}

export function saveSingleDeck(deck: McqDeck): McqDeck[] {
  const existing = loadStoredDecks();
  const index = existing.findIndex((d) => d.id === deck.id);
  let updated: McqDeck[];
  if (index >= 0) {
    updated = [...existing];
    updated[index] = deck;
  } else {
    updated = [deck, ...existing];
  }
  saveStoredDecks(updated);
  return updated;
}

export function deleteStoredDeck(deckId: string): McqDeck[] {
  const existing = loadStoredDecks();
  const updated = existing.filter((d) => d.id !== deckId);
  saveStoredDecks(updated);
  return updated;
}

export function loadStudyHistory(): StudyHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudyHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load study history:', err);
    return [];
  }
}

export function recordStudyHistoryEntry(entry: Omit<StudyHistoryEntry, 'id'>): void {
  try {
    const history = loadStudyHistory();
    const newEntry: StudyHistoryEntry = {
      ...entry,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    // Keep 150 most recent entries
    const updated = [newEntry, ...history].slice(0, 150);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record study history entry:', err);
  }
}

export function clearStudyHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear study history:', err);
  }
}

export function recordDeckAttempt(
  deckId: string,
  score: number,
  total: number,
  mode: 'practice' | 'exam'
): McqDeck[] {
  const existing = loadStoredDecks();
  const matchedDeck = existing.find((d) => d.id === deckId);

  if (matchedDeck) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const topics = Array.from(
      new Set(matchedDeck.questions.map((q) => q.topic).filter(Boolean) as string[])
    );

    recordStudyHistoryEntry({
      deckId,
      deckTitle: matchedDeck.title,
      type: 'mcq',
      timestamp: Date.now(),
      score,
      total,
      percentage,
      mode,
      topics,
    });
  }

  const updated = existing.map((d) => {
    if (d.id === deckId) {
      return {
        ...d,
        last_attempt: {
          date: Date.now(),
          score,
          total,
          percentage: total > 0 ? Math.round((score / total) * 100) : 0,
          mode,
        },
      };
    }
    return d;
  });
  saveStoredDecks(updated);
  return updated;
}

export function recordFlashcardStudySession(
  deckId: string,
  masteredCount: number,
  reviewCount: number,
  totalCards: number
): McqDeck[] {
  const existing = loadStoredDecks();
  const matchedDeck = existing.find((d) => d.id === deckId);

  if (matchedDeck) {
    const percentage = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
    const topics = Array.from(
      new Set(
        (matchedDeck.cards || []).map((c) => c.topic).filter(Boolean) as string[]
      )
    );

    recordStudyHistoryEntry({
      deckId,
      deckTitle: matchedDeck.title,
      type: 'flashcard',
      timestamp: Date.now(),
      score: masteredCount,
      total: totalCards,
      percentage,
      mode: 'flashcard',
      topics,
    });
  }

  const updated = existing.map((d) => {
    if (d.id === deckId) {
      return {
        ...d,
        flashcard_stats: {
          last_studied: Date.now(),
          mastered_count: masteredCount,
          review_count: reviewCount,
          total_cards: totalCards,
        },
      };
    }
    return d;
  });
  saveStoredDecks(updated);
  return updated;
}
