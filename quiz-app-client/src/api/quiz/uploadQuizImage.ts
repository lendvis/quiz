import { post } from "../http";

export function uploadQuizImage(quizId: number, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return post<{}, FormData>(
    `image/quiz/${quizId}`,
    formData,
    {
      requiresAuth: true
    }
  );
}