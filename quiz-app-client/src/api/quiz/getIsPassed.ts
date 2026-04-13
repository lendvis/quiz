import { get } from "../http";

export interface GetIsPassedResponce {
    passed: boolean
}

export function getIsPassed(quizId: number) {
  return get<GetIsPassedResponce>(`quizzes/result/check/${quizId}`, undefined, {
    requiresAuth: true,
  });
}
