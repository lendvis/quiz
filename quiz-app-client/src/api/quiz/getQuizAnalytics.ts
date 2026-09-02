import { get } from "../http";

export interface AnalyticsSummary {
  attempts: number;
  avg: number;
  median: number;
  min: number;
  max: number;
  avgMin: number;
  passed: number;
}

export interface AnalyticsQuestion {
  n: number;
  text: string;
  /** доля верных ответов, % */
  pct: number;
  /** среднее время на вопрос, секунды */
  sec: number;
  /** самый популярный неверный вариант */
  topWrong: { text: string; n: number } | null;
}

export interface AnalyticsStudent {
  name: string;
  grp: string | null;
  pct: number;
  correct: number;
  total: number;
  min: number;
  date: string;
}

export interface AnalyticsGroup {
  name: string;
  students: number;
  done: number;
  avg: number | null;
}

export interface QuizAnalytics {
  quiz: { id: number; name: string };
  summary: AnalyticsSummary | null;
  /** распределение баллов по пяти интервалам: bucket 1 — 0-20%, bucket 5 — 80-100% */
  dist: { bucket: number; n: number }[];
  questions: AnalyticsQuestion[];
  students: AnalyticsStudent[];
  groups: AnalyticsGroup[];
}

export function getQuizAnalytics(quizId: number | string) {
  return get<QuizAnalytics>(`quizzes/${quizId}/analytics`, undefined, { requiresAuth: true });
}
