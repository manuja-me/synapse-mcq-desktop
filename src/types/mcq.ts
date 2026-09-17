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

export interface DeckMetadata {
  generated_at?: string;
  difficulty?: string;
  total_questions?: number;
  target_audience?: string;
  source?: string;
}

export interface McqDeck {
  id: string;
  title: string;
  description?: string;
  metadata?: DeckMetadata;
  questions: McqQuestion[];
  created_at: number;
  last_attempt?: {
    date: number;
    score: number;
    total: number;
    percentage: number;
    mode: 'practice' | 'exam';
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
}
