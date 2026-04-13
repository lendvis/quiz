import { post } from "../http";
import type { QuizSettings } from "./getQuiz";

export interface CreateQuizBody {
  name: string;
  description: string;
  settings: QuizSettings;
}

export interface CreateQuizResposnce {
  id: number;
}

export function createQuiz(data: CreateQuizBody) {
  return post<CreateQuizResposnce, CreateQuizBody>("quizzes", data, { requiresAuth: true });
}
