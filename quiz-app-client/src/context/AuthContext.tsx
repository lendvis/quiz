import {
  createContext,
  useContext,
  useEffect,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";
import { setToken, clearToken } from "../auth/auth.store";
import type { AuthUser, UserRole } from "../api/auth/types";

/**
 * Shape stored in localStorage
 */
type StoredAuth = {
  token: string;
  user: AuthUser;
};

/**
 * Context contract
 */
export type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  role: UserRole | null;
  isAuthorized: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const STORAGE_KEY = "auth_data";

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider
 */
export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  /**
   * Initialize from localStorage
   */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed: StoredAuth = JSON.parse(saved);

      if (parsed.token && parsed.user) {
        setTokenState(parsed.token);
        setUser(parsed.user);
        setToken(parsed.token); // sync with your API layer
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.error("Invalid auth data in storage");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * Login
   */
  const login = (newToken: string, nextUser: AuthUser) => {
    setTokenState(newToken);
    setUser(nextUser);

    setToken(newToken); // update API client

    const data: StoredAuth = {
      token: newToken,
      user: nextUser,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  /**
   * Logout
   */
  const logout = () => {
    setTokenState(null);
    setUser(null);

    clearToken(); // clear API client
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role ?? null,
        isAuthorized: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Optional helper hook (recommended)
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthContextProvider");
  }

  return context;
};
