import { McqDeck, QuizSessionState } from '../types/mcq';
import { STARTER_DECKS } from './sampleDecks';

const DECKS_STORAGE_KEY = 'synapse_mcq_decks_v1';
const RECENT_SESSION_KEY = 'synapse_mcq_recent_session_v1';

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
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error('Failed to save decks:', err);
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

export function recordDeckAttempt(
  deckId: string,
  score: number,
  total: number,
  mode: 'practice' | 'exam'
): McqDeck[] {
  const existing = loadStoredDecks();
  const updated = existing.map((d) => {
    if (d.id === deckId) {
      return {
        ...d,
        last_attempt: {
          date: Date.now(),
          score,
          total,
          percentage: Math.round((score / total) * 100),
          mode,
        },
      };
    }
    return d;
  });
  saveStoredDecks(updated);
  return updated;
}
