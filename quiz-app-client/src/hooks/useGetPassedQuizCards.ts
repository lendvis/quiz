import { getPassedQuizCards } from "../api/quiz/getPassedQuizCards";
import { useAutoFetch } from "./useAutoFetch";

export function useGetPassedQuizCards() {
  return useAutoFetch(getPassedQuizCards);
};