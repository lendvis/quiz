import { get } from "../http";

export interface QuizResultsBody {
  quizId: string;
}

export interface QuizResultsResponce {
  quizId: string,
  answers: number[];
  rightAnswers: number[],
}

export function getQuizResults(data: QuizResultsBody) {
  return get<QuizResultsResponce>("quizzes/result", data, { requiresAuth: true });
}
