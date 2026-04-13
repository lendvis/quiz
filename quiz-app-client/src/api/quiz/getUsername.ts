import { get } from "../http";

export interface GetUsernameResponce {
  username: string
}

export function getUsername() {
  return get<GetUsernameResponce>("auth/profile", {}, { requiresAuth: true });
}
