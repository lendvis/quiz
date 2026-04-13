import { get } from "../http";

export interface QuizSettings {
  passPercent: number;
  timeLimitMinutes: number;
  showCorrectAnswers: boolean;
  allowRetake: boolean;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  passPercent: 60,
  timeLimitMinutes: 20,
  showCorrectAnswers: true,
  allowRetake: true,
};

export interface Quiz {
  name: string;
  id?: number;
  description: string;
  questions: QuizQuestion[];
  image: string | null;
  settings: QuizSettings;
}

export interface QuizQuestion {
  id?: number;
  text: string;
  answers: QuizQuestionAnswer[];
  image?: string | null;
}

export interface QuizQuestionAnswer {
  id?: number;
  text: string;
  is_correct: boolean;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const toNumber = (value: unknown, fallback: number) => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
};

const toOptionalNumber = (value: unknown): number | undefined => {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : undefined;
};

export function normalizeQuizSettings(value: unknown): QuizSettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_QUIZ_SETTINGS };
  }

  const input = value as Partial<QuizSettings>;

  return {
    passPercent: clamp(
      toNumber(input.passPercent, DEFAULT_QUIZ_SETTINGS.passPercent),
      1,
      100
    ),
    timeLimitMinutes: clamp(
      toNumber(input.timeLimitMinutes, DEFAULT_QUIZ_SETTINGS.timeLimitMinutes),
      1,
      300
    ),
    showCorrectAnswers:
      typeof input.showCorrectAnswers === "boolean"
        ? input.showCorrectAnswers
        : DEFAULT_QUIZ_SETTINGS.showCorrectAnswers,
    allowRetake:
      typeof input.allowRetake === "boolean"
        ? input.allowRetake
        : DEFAULT_QUIZ_SETTINGS.allowRetake,
  };
}

export function normalizeQuiz(rawQuiz: Omit<Quiz, "settings"> & { settings?: unknown }): Quiz {
  const normalizedQuestions = Array.isArray(rawQuiz.questions)
    ? rawQuiz.questions.map((question) => ({
        ...question,
        id: toOptionalNumber(question.id),
        answers: Array.isArray(question.answers)
          ? question.answers.map((answer) => ({
              ...answer,
              id: toOptionalNumber(answer.id),
              is_correct: Boolean(answer.is_correct),
            }))
          : [],
      }))
    : [];

  return {
    ...rawQuiz,
    id: toOptionalNumber(rawQuiz.id),
    questions: normalizedQuestions,
    settings: normalizeQuizSettings(rawQuiz.settings),
  };
}

export async function getQuiz(id: number) {
  const quiz = await get<Omit<Quiz, "settings"> & { settings?: unknown }>(`quizzes/${id}`);
  return normalizeQuiz(quiz);
}
