import { get } from "../http";

export interface getQuizSummaryListResponce {
  
}

export function getQuizSummaryList(quizStatsId: number) {
  return get<number[]>(`quizzes/summaryList/${quizStatsId}`, {},  { requiresAuth: true });
}
