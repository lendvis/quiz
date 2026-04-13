import React, { useState, useEffect } from "react";

interface QuizImageProps {
  quizId: string;
  className?: string;
}

export const QuizImage: React.FC<QuizImageProps> = ({ quizId, className }) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    setImageUrl(`/image/${quizId}`);
  }, [quizId]);

  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${imageUrl})` }}
    />
  );
};
