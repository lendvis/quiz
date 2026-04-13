import { getLastQuizStats } from "../api/quiz/getLastQuizStats";
import { useAutoFetch } from "./useAutoFetch";

export function useGetLastQuizStats(id: number) {
  return useAutoFetch(() => getLastQuizStats(id), [id]);
};
