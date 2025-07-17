export interface Answer {
  id: number;
  content: string;
  questionId: number;
  userId: number;
  isCorrect: boolean;
  createdAt: Date;
}
