import { get } from "../http";

export interface getLastQuizStatsBody {
    last_quiz_stats_id: number
}

export function getLastQuizStats(quizId: number) {
  return get<getLastQuizStatsBody>(`quizzes/getLastQuizStats/${quizId}`, {}, { requiresAuth: true });
}
