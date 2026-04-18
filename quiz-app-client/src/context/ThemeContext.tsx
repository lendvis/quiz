import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type FC,
  type PropsWithChildren,
} from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "quiz-app-theme";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const isTheme = (value: string | undefined | null): value is Theme => {
  return value === "dark" || value === "light";
};

const resolveInitialTheme = (): Theme => {
  if (typeof document !== "undefined") {
    const themeFromDataset = document.documentElement.dataset.theme;
    if (isTheme(themeFromDataset)) {
      return themeFromDataset;
    }
  }

  if (typeof window !== "undefined") {
    try {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (isTheme(savedTheme)) {
        return savedTheme;
      }
    } catch {
      return "dark";
    }
  }

  return "dark";
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export const ThemeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);

  useEffect(() => {
    applyTheme(theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      return;
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isDark: theme === "dark",
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
