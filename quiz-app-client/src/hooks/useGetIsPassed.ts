import { getIsPassed } from "../api/quiz/getIsPassed";
import { useAutoFetch } from "./useAutoFetch";

export function useGetIsPassed(quizId: number, enabled = true) {
  return useAutoFetch(() => {
    if (!enabled) {
      return Promise.resolve({ passed: false });
    }
    return getIsPassed(quizId);
  }, [quizId, enabled]);
}
