export const DEFAULT_QUIZ_SETTINGS = {
  passPercent: 60,
  timeLimitMinutes: 20,
  showCorrectAnswers: true,
  allowRetake: true,
};

export const normalizeQuizSettings = (value) => {
  const parsedValue =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return {};
          }
        })()
      : value ?? {};

  return {
    passPercent: Math.min(100, Math.max(1, Number(parsedValue.passPercent ?? DEFAULT_QUIZ_SETTINGS.passPercent))),
    timeLimitMinutes: Math.max(1, Number(parsedValue.timeLimitMinutes ?? DEFAULT_QUIZ_SETTINGS.timeLimitMinutes)),
    showCorrectAnswers: Boolean(parsedValue.showCorrectAnswers ?? DEFAULT_QUIZ_SETTINGS.showCorrectAnswers),
    allowRetake: Boolean(parsedValue.allowRetake ?? DEFAULT_QUIZ_SETTINGS.allowRetake),
  };
};
