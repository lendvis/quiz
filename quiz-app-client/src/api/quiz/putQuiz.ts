import { put } from "../http";
import type { Quiz } from "./getQuiz";

export interface PutQuizBody {
  id: number;
  quiz: Quiz;
}

export function putQuiz(putQuizBody: PutQuizBody) {
  return put(`quizzes/${putQuizBody.id}`, putQuizBody.quiz, { requiresAuth: true });
}
