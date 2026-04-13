export interface AuthContextValue {
  token: string | null;
  isAuthorized: boolean;
  login: (token: string) => void;
  logout: () => void;
}
