import { getUsername } from "../api/quiz/getUsername";
import { useAutoFetch } from "./useAutoFetch";

export function useGetUsername() {
    return useAutoFetch(getUsername);
}