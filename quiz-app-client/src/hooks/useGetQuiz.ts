import { getQuiz } from "../api/quiz/getQuiz";
import { useAutoFetch } from "./useAutoFetch";

export function useGetQuiz(id: number, deps: readonly unknown[] = []) {
  return useAutoFetch(() => {
    if (!id) {
      throw new Error("No quiz ID");
    }
    return getQuiz(id);
  }, [id, ...deps]);
}
