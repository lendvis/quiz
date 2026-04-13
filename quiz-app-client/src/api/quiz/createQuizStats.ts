import { post } from "../http";

export interface CreateQuizStatsResponce {
    quiz_stats_id: number
}

export interface CreateQuizStatsBody {

}

export function createQuizStats(quizId: number) {
  return post<CreateQuizStatsResponce, CreateQuizStatsBody>(`quizzes/begin/${quizId}`, {} , { requiresAuth: true });
}