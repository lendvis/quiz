import { get } from "../http";

export interface GetQuizByQuizStatsIdBody {
    quiz_id: number
}

export function getQuizByQuizStatsId(quizStatsId: number) {
  return get<GetQuizByQuizStatsIdBody>(`quizzes/getQuizByQuizStatsId/${quizStatsId}`, {}, { requiresAuth: true });
}
