export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  timestamp?: string;
}

export interface StudySession {
  id: string;
  duration: number;
  type: 'study' | 'break';
  completedAt: string;
}
