import { get } from "../http";
import type { GroupListResponse } from "./types";

export function getAssignedGroups() {
  return get<GroupListResponse>(`auth/getAssignedGroups`, {}, { requiresAuth: true });
}
