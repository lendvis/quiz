import { register } from "../../api/auth/register";
import { useFetch } from "../useFetch";

export function useRegister() {
  return useFetch(register);
}