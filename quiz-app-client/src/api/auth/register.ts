import { post } from "../http";
import type { AuthResponse, UserRole } from "./types";

export interface RegisterBody {
  username: string,
  password: string,
  displayName: string,
  role: UserRole | "leadership",
  groupId?: number,
  leadershipRegistrationCode?: string
}

export function register(body: RegisterBody) {
  return post<AuthResponse, RegisterBody>(`auth/register`, body);
}
