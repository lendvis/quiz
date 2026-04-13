import { getQuizSummaryList } from "../api/quiz/getQuizSummaryList";
import { useAutoFetch } from "./useAutoFetch";

export function useGetQuizSummaryList(quizId: number) {
  return useAutoFetch(() => getQuizSummaryList(quizId), [quizId]);
}
