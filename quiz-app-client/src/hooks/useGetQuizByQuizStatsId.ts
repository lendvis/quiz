import { getQuizByQuizStatsId } from "../api/quiz/getQuizByQuizStatsId";
import { useAutoFetch } from "./useAutoFetch";

export function useGetQuizByQuizStatsId(quizStatsId: number) {
  return useAutoFetch(() => getQuizByQuizStatsId(quizStatsId), [quizStatsId]);
};
