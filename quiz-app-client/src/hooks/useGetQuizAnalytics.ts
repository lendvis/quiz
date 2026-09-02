import { useContext } from "react";
import { getQuizAnalytics } from "../api/quiz/getQuizAnalytics";
import { useAutoFetch } from "./useAutoFetch";
import { AuthContext } from "../context/AuthContext";

export function useGetQuizAnalytics(quizId: number | string) {
  const auth = useContext(AuthContext);
  return useAutoFetch(() => getQuizAnalytics(quizId), [String(quizId), auth?.token || ""]);
}
