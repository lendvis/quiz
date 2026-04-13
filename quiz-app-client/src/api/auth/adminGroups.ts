import { get, post } from "../http";
import type { UserGroup } from "./types";

export interface ManagedGroup extends UserGroup {
  studentsCount: number;
  teachersCount: number;
}

export interface ManagedGroupListResponse {
  groups: ManagedGroup[];
}

export interface CreateGroupBody {
  name: string;
}

export interface CreateGroupResponse {
  message?: string;
  group: UserGroup;
}

export function getManagedGroups() {
  return get<ManagedGroupListResponse>("auth/admin/groups", {}, { requiresAuth: true });
}

export function createGroup(body: CreateGroupBody) {
  return post<CreateGroupResponse, CreateGroupBody>("auth/admin/groups", body, { requiresAuth: true });
}
