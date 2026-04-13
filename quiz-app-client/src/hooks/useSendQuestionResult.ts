
import { sendQuestionResult } from "../api/quiz/sendQuestionResult";
import { useFetch } from "./useFetch";

export function useSendQuestionResult() {
  return useFetch(sendQuestionResult);
}