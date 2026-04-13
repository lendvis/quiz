import { GetQuizStatsSummary } from "../api/quiz/getQuizStatsSummary";
import { useAutoFetch } from "./useAutoFetch";

export function useGetQuizStatsSummary(id: number) {
    return useAutoFetch(() => GetQuizStatsSummary(id), [id]);
}
