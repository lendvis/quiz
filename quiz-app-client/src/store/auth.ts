export interface AuthData {
  token: string | null;
  user: { id: number; name: string } | null;
}

export const defaultAuth: AuthData = {
  token: null,
  user: null,
};
