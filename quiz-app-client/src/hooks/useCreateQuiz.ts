import { createQuiz } from "../api/quiz/createQuiz";
import { useFetch } from "./useFetch";

export function useCreateQuiz() {
  return useFetch(createQuiz);
}