import { post } from "../http";
import type { AuthResponse } from "./types";

export interface LoginBody {
  username: string,
  password: string
}

export function login(body: LoginBody) {
  return post<AuthResponse, LoginBody>(`auth/login`, body);
}
