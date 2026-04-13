import { createQuizStats } from "../api/quiz/createQuizStats";
import { useFetch } from "./useFetch";

export function useCreateQuizStats() {
  return useFetch(createQuizStats);
}