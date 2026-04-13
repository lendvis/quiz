import { login } from "../../api/auth/login";
import { useFetch } from "../useFetch";

export function useLogin() {
  return useFetch(login);
}