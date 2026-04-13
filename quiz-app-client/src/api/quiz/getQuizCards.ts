import { get } from "../http";

export interface QuizCard {
  questionCount: number,
  id: string,
  name: string,
  image: string,
  appointed?: boolean,
  isAssigned?: boolean,
  hasAttempt?: boolean,
  isPassed?: boolean,
  attemptCount?: number
}

export interface QuizCardsQuery {
  name?: string,
  passed?: boolean,
  assigned?: boolean,
  authorId?: number,
  self?: boolean
}

export function getQuizCards(query?: QuizCardsQuery) {
  return get<QuizCard[]>(`quizzes/cards`, query, { requiresAuth: true });
}
