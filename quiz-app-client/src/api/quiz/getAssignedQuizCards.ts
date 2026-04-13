import { get } from "../http";
import type { QuizCard } from "./getQuizCards";

export interface AssignedQuizCardsBody {
  name?: string,
  passed?: boolean,
  authorId?: number,
  self?: boolean
}

export function getAssignedQuizCards(query?: AssignedQuizCardsBody) {
  return get<QuizCard[]>(
    "quizzes/cards",
    {
      ...query,
      name: query?.name ?? "",
      assigned: true,
    },
    { requiresAuth: true }
  );
}
