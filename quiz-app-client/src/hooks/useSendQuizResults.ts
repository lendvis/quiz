import { useState } from "react";
import type { QuizResultsBody } from "../api/quiz/sendQuizResults";
import { sendQuizResults } from "../api/quiz/sendQuizResults";

export function useSendQuizResults() {
  const [state, setState] = useState({
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: undefined as any,
  });

  const sendResults = async (data: QuizResultsBody) => {
    setState({ isFetching: true, isSuccess: false, isError: false, error: undefined });

    try {
      await sendQuizResults(data);
      setState({ isFetching: false, isSuccess: true, isError: false, error: undefined });
    } catch (err: any) {
      setState({ isFetching: false, isSuccess: false, isError: true, error: err });
    }
  };

  return [state, sendResults] as const;
}