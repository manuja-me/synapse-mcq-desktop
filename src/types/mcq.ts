export interface McqQuestion {
  id?: string | number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  distractor_explanations?: string[];
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  tags?: string[];
}

export interface FlashcardItem {
  id?: string | number;
  front: string;
  back: string | string[];
  explanation?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  tags?: string[];
}

export type DeckType = 'mcq' | 'flashcard';

export interface DeckMetadata {
  generated_at?: string;
  difficulty?: string;
  total_questions?: number;
  total_cards?: number;
  target_audience?: string;
  source?: string;
}

export interface McqDeck {
  id: string;
  title: string;
  deck_type?: DeckType;
  description?: string;
  metadata?: DeckMetadata;
  questions: McqQuestion[];
  cards?: FlashcardItem[];
  created_at: number;
  last_attempt?: {
    date: number;
    score: number;
    total: number;
    percentage: number;
    mode?: 'practice' | 'exam' | 'flashcard';
  };
  flashcard_stats?: {
    last_studied?: number;
    mastered_count: number;
    review_count: number;
    total_cards: number;
  };
}

export interface DeckStats {
  total_questions: number;
  topics: string[];
  difficulty_counts: Record<string, number>;
  estimated_minutes: number;
}

export interface UserAnswerRecord {
  questionIndex: number;
  selectedOption: number | null;
  isCorrect: boolean;
  timeSpentSeconds: number;
  flaggedForReview: boolean;
}

export interface QuizSessionState {
  deck: McqDeck;
  mode: 'practice' | 'exam';
  currentIndex: number;
  answers: Record<number, UserAnswerRecord>;
  status: 'in-progress' | 'submitted' | 'review';
  startTime: number;
  elapsedSeconds: number;
  durationSeconds: number; // For exam mode timer
}

export interface PromptConfig {
  questionCount: number;
  difficulty: 'Balanced' | 'Easy' | 'Medium' | 'Hard' | 'Progressive Adaptive';
  archetype: 'Conceptual & Theory' | 'Practical / Application' | 'Case Study & Scenario' | 'High-Yield Board Exam' | 'Edge Cases & Trick Questions';
  academicLevel: 'High School' | 'Undergraduate' | 'Graduate / Postgrad' | 'Professional Certification' | 'Corporate Training';
  explanationDepth: 'Didactic (Every option analyzed)' | 'Concise Rationale' | 'Key Takeaway Only';
  language: string;
  customDirectives: string;
  selfContainedQuestions?: boolean; // strictly forbid "look at slide X/page Y"
  exhaustiveTheory?: boolean;       // maximize theoretical elements from the document
  preventTopicDuplicates?: boolean; // no duplicate theory topics
  strictPdfScopeOnly?: boolean;     // strictly bounded to provided PDF scope
}

export interface FlashcardPromptConfig {
  cardCount: number | 'auto';
  difficulty: 'Balanced' | 'Easy' | 'Medium' | 'Hard';
  academicLevel: 'High School' | 'Undergraduate' | 'Graduate / Postgrad' | 'Professional Certification';
  theoryDepth: 'Atomic Definitions & Axioms' | 'Comprehensive & Multi-Part Concepts' | 'Comparative / Differences';
  language: string;
  customDirectives: string;
  exhaustiveTheory?: boolean;       // maximize theoretical elements from the document
  preventTopicDuplicates?: boolean; // no duplicate theory topics
  strictPdfScopeOnly?: boolean;     // strictly bounded to provided PDF scope
  onlyTheoryNotes?: boolean;        // generate exclusively from theory parts of the note
}

export interface StudyHistoryEntry {
  id: string;
  deckId: string;
  deckTitle: string;
  type: 'mcq' | 'flashcard';
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  mode?: 'practice' | 'exam' | 'flashcard';
  topics?: string[];
}

