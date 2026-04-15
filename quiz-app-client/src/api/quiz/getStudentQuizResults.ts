import { get } from "../http";

export interface StudentQuizResultItem {
  quizStatsId: number;
  completedAt: string | null;
  student: {
    id: number;
    displayName: string;
    username: string;
  };
  group: {
    id: number;
    name: string;
  } | null;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  passPercent: number;
  accuracy: number;
  isPassed: boolean;
}

export function getStudentQuizResults(quizId: number) {
  return get<StudentQuizResultItem[]>(`quizzes/${quizId}/student-results`, undefined, {
    requiresAuth: true,
  });
}
