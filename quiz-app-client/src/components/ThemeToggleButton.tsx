import { MoonStar, SunMedium } from "lucide-react";
import type { FC } from "react";

import { useTheme } from "../context/ThemeContext";

interface ThemeToggleButtonProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggleButton: FC<ThemeToggleButtonProps> = ({
  compact = false,
  className = "",
}) => {
  const { isDark, toggleTheme } = useTheme();

  const currentThemeLabel = isDark ? "Темная" : "Светлая";
  const nextThemeLabel = isDark ? "светлую" : "темную";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${compact ? "theme-toggle--compact" : ""} ${className}`.trim()}
      aria-label={`Переключить на ${nextThemeLabel} тему`}
      title={`Переключить на ${nextThemeLabel} тему`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? <MoonStar size={18} /> : <SunMedium size={18} />}
      </span>

      {!compact && (
        <span className="theme-toggle__copy">
          <span className="theme-toggle__label">Тема</span>
          <span className="theme-toggle__value">{currentThemeLabel}</span>
        </span>
      )}
    </button>
  );
};
