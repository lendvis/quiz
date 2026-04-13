import { useAutoFetch } from "./useAutoFetch";
import { checkUsername } from "../api/quiz/checkUsername";

export function useCheckUsername(username?: string) {
  return useAutoFetch(() => {
    if (!username) {
      throw new Error("No username");
    }
    return checkUsername({ username });
  }, [username]);
}
