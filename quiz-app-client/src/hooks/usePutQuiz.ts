import { putQuiz } from "../api/quiz/putQuiz";
import { useFetch } from "./useFetch";

export function usePutQuiz() {
  return useFetch(putQuiz);
};