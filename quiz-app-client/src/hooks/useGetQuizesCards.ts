import { getQuizCards, type QuizCardsQuery } from "../api/quiz/getQuizCards";
import { useAutoFetch } from "./useAutoFetch";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useGetQuizCards(query?: QuizCardsQuery) {
  const auth = useContext(AuthContext);
  return useAutoFetch(() => getQuizCards(query), [JSON.stringify(query || {}), auth?.token || ""]);
};
