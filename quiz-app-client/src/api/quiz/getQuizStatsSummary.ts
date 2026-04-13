import { get } from "../http";

export interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  answeredQuestions?: number;
  accuracy?: number;
  passPercent?: number;
  isPassed?: boolean;
  allowRetake?: boolean;
  showCorrectAnswers?: boolean;
  completedAt?: string | null;
}

export interface QuizSummaryViewModel extends QuizSummary {
  answeredQuestions: number;
  accuracy: number;
  passPercent: number;
  isPassed: boolean;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export function normalizeQuizSummary(summary: QuizSummary): QuizSummaryViewModel {
  const totalQuestions = Number(summary.totalQuestions ?? 0);
  const correctAnswers = Number(summary.correctAnswers ?? 0);
  const wrongAnswers = Number(summary.wrongAnswers ?? 0);
  const unanswered = Number(summary.unanswered ?? 0);
  const answeredQuestions =
    summary.answeredQuestions !== undefined
      ? Number(summary.answeredQuestions)
      : Math.max(0, totalQuestions - unanswered);

  const fallbackAccuracy =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const accuracy = clamp(
    Math.round(summary.accuracy !== undefined ? Number(summary.accuracy) : fallbackAccuracy),
    0,
    100
  );
  const passPercent = clamp(Number(summary.passPercent ?? 60), 1, 100);
  const isPassed =
    typeof summary.isPassed === "boolean"
      ? summary.isPassed
      : accuracy >= passPercent;
  const allowRetake = typeof summary.allowRetake === "boolean" ? summary.allowRetake : true;
  const showCorrectAnswers =
    typeof summary.showCorrectAnswers === "boolean"
      ? summary.showCorrectAnswers
      : true;

  return {
    ...summary,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unanswered,
    answeredQuestions,
    accuracy,
    passPercent,
    isPassed,
    allowRetake,
    showCorrectAnswers,
  };
}

export async function GetQuizStatsSummary(id: number) {
  const summary = await get<QuizSummary>(`quizzes/summary/${id}`, undefined, {
    requiresAuth: true,
  });
  return normalizeQuizSummary(summary);
}
