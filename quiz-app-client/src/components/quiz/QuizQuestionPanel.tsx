import type { FC } from "react"
import type { QuizQuestion } from "../../api/quiz/getQuiz"
import { ServerBackground } from "../ServerBackground"
import { ProgressBar } from "../progressBars/ProgressBar"
import { QuestionAnswerButton } from "../buttons/questionAnswerButtons/QuestionAnswerButton"
import type { ApiError } from "../../api/api-error"

export interface QuizQuestionPanelProps {
    question: QuizQuestion;
    onAnswerButtonClick: (answerOptionId: number) => void;
    questionIndex?: number;
    questionCount?: number;
    error: ApiError | null;
}

export const QuizQuestionPanel: FC<QuizQuestionPanelProps> = ({ question, onAnswerButtonClick, questionIndex, questionCount, error }) => {
    const hasProgress = typeof questionIndex === "number" && typeof questionCount === "number" && questionCount > 0;
    const progress = hasProgress ? ((questionIndex + 1) / questionCount) * 100 : 0;
    const questionImageId = question.image || null;

    return (
        <div className="w-full h-full flex flex-col justify-center">
            <div className="flex flex-col md:flex-row text-slate-100 gap-5 items-center">
                <div className="flex flex-col flex-1 items-stretch justify-center">
                    {questionImageId && (
                        <ServerBackground
                            imageId={questionImageId}
                            className="w-full h-85 bg-slate-800 bg-cover bg-center rounded-xl border border-slate-700"
                        />
                    )}
                    <h1 className="mt-5 bg-slate-900/60 p-3 rounded-lg border border-slate-700">{question.text}</h1>
                </div>


                <div className="flex flex-col flex-1 justify-center gap-2">
                    {hasProgress && (
                        <div>
                            <span className="">{`${questionIndex + 1}/${questionCount}`}</span>
                            <ProgressBar progress={progress} />
                        </div>
                    )}

                    {question.answers.map((option, i) => (
                        <QuestionAnswerButton
                            key={option.id ?? i}
                            onClick={() => {
                                const answerOptionId = Number(option.id);
                                if (Number.isFinite(answerOptionId)) {
                                    onAnswerButtonClick(answerOptionId);
                                }
                            }}
                            tabIndex={i}
                        >
                            {option.text}
                        </QuestionAnswerButton>
                    ))}
                </div>

            </div>

            <div className="flex justify-center w-full">
                {
                    error && (
                        <div className="transition mt-5 border-3 p-2 rounded bg-red-300 border-red-500 text-red-900 min-w-1/2 text-center">
                            {error.message ? <p>{error.message}</p> : <p>Не удалось отправить ответ на вопрос</p>}
                        </div>
                    )
                }
            </div>
        </div>
    );
};

//<ProgressBar progress={passed ? 100 : (questionId / quiz.questions.length) * 100} />
