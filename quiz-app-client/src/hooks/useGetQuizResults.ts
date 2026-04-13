import { getQuizResults } from "../api/quiz/getQuizResults";
import { useFetch } from "./useFetch";

export function useGetQuizResults() {
  return useFetch(getQuizResults);
}