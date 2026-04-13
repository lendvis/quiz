import { get } from "../http";
import type { QuizCard, QuizCardsQuery } from "./getQuizCards";

export function getPassedQuizCards(query?: QuizCardsQuery) {
  return get<QuizCard[]>(
    "quizzes/cards",
    {
      ...query,
      name: query?.name ?? "",
      passed: true,
    },
    { requiresAuth: true }
  );
}
