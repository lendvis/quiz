import { getQuizSummaryList } from "../api/quiz/getQuizSummaryList";
import { useAutoFetch } from "./useAutoFetch";

export function useGetQuizSummaryList(quizId: number, userId?: number) {
  return useAutoFetch(() => getQuizSummaryList(quizId, userId), [quizId, userId]);
}
