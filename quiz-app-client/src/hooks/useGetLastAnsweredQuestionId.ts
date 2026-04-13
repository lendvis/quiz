import { getLastAnsweredQuestionId } from "../api/quiz/getLastAnsweredQuestionId";
import { useAutoFetch } from "./useAutoFetch";

  export function useGetLastAnsweredQuestionId(id: number) {
    return useAutoFetch(() => getLastAnsweredQuestionId(id), [id]);
  }
