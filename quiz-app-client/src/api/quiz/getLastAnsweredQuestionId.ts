import { get } from "../http";

export interface GetLastAnsweredQuestionIdResponce {
    question_id: number
}

export function getLastAnsweredQuestionId(quizStatsId: number) {
  return get<GetLastAnsweredQuestionIdResponce>(`quizzes/getLastAnsweredQuestionId/${quizStatsId}`, {}, { requiresAuth: true });
}
