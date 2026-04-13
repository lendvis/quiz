export type UserRole = "student" | "teacher" | "leadership";

export interface UserGroup {
  id: number;
  name: string;
}

export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
  group: UserGroup | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface AuthResponse extends AuthSession {
  role: UserRole;
  message?: string;
}

export interface GroupListResponse {
  groups: UserGroup[];
}
