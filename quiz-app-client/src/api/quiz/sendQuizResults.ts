import { post } from "../http";

export interface QuizResultsBody {
  quizId: string;
  answers: number[];
}

export function sendQuizResults(data: QuizResultsBody) {
  return post("quizzes/result", data, { requiresAuth: true });
}