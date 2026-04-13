import { get } from "../http";
import { type QuizCard } from "./getQuizCards";


export function searchQuizCards(query: string) {
  return get<QuizCard[]>("quizzes/cards", { search: query} );
}