import { searchQuizCards } from "../api/quiz/searchQuizCards";
import { useFetch } from "./useFetch";

export function useSearchQuizCards() {
  return useFetch(searchQuizCards);
};