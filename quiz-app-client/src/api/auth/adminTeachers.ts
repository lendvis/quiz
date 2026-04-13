import { get, post } from "../http";
import type { UserGroup } from "./types";

export interface TeacherListItem {
  id: number;
  username: string;
  displayName: string;
  groups: UserGroup[];
}

export interface TeacherListResponse {
  teachers: TeacherListItem[];
}

export interface CreateTeacherBody {
  displayName: string;
  username: string;
  password: string;
  groupIds: number[];
}

export interface CreateTeacherResponse {
  message?: string;
  teacher: TeacherListItem;
}

export function getTeachers() {
  return get<TeacherListResponse>("auth/admin/teachers", {}, { requiresAuth: true });
}

export function createTeacher(body: CreateTeacherBody) {
  return post<CreateTeacherResponse, CreateTeacherBody>("auth/admin/teachers", body, {
    requiresAuth: true,
  });
}
