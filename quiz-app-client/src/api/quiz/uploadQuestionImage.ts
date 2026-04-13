import { post } from "../http";

export function uploadQuestionImage(questionId: number, file: File) {
  const formData = new FormData();
  formData.append("image", file);

  return post<{}, FormData>(
    `image/question/${questionId}`,
    formData,
    {
      requiresAuth: true
    }
  );
}