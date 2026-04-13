import { post } from "../http";

export interface SendQuestionResultBody {
  quizStatsId: number,
  questionId: number,
  answerOptionId: number
}

export function sendQuestionResult(data: SendQuestionResultBody) {
  return post<{}, SendQuestionResultBody>("quizzes/result/question", data, { requiresAuth: true });
}