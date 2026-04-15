import { get } from "../http";

export interface getQuizSummaryListResponce {
  
}

export function getQuizSummaryList(quizId: number, userId?: number) {
  const query = userId ? { userId } : {};
  return get<number[]>(`quizzes/summaryList/${quizId}`, query,  { requiresAuth: true });
}
