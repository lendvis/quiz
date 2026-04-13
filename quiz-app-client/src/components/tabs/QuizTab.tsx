import { useState, useEffect, type FC } from "react";
import { useParams } from "react-router-dom";
import { getQuiz, type Quiz, type QuizQuestion } from "../../api/quiz/getQuiz";
import { Loadable } from "../common/Loadable";
import { AutoFetchTab } from "./AutoFetchTab";
import { QuizQuestionPanel } from "../quiz/QuizQuestionPanel";
import { useGetQuizByQuizStatsId } from "../../hooks/useGetQuizByQuizStatsId";
import { WithApi } from "../withApi";
import { useFetch } from "../../hooks/useFetch";
import { useSendQuestionResult } from "../../hooks/useSendQuestionResult";
import { getLastAnsweredQuestionId } from "../../api/quiz/getLastAnsweredQuestionId";
import { useNavigate } from "react-router-dom";

export const QuizTab: FC = () => {
    const { id } = useParams();

    const quizStatsId = Number((id as string));
    const getQuizByQuizStatsIdResponce = useGetQuizByQuizStatsId(quizStatsId);
    const [getQuizResponce, getQuizFunc] = useFetch(getQuiz);

    const [sendQuestionResultResponce, sendQuestionResult] = useSendQuestionResult();

    const [questionIndex, setQuestionIndex] = useState(0);

    const currentQuestion = getQuizResponce.data?.questions[questionIndex];

    const navigate = useNavigate();

    const handleSelectOption = async (answerOptionId: number) => {
        if (!id) return;

        const questionId = Number(currentQuestion?.id);
        if (!Number.isFinite(questionId)) return;

        await sendQuestionResult({
            quizStatsId: Number(id),
            questionId,
            answerOptionId,
        });

        const isLastQuestion =
            questionIndex + 1 >= (getQuizResponce.data?.questions.length ?? 0);

        if (isLastQuestion) {
            navigate(`/results/${getQuizResponce.data?.id}/${quizStatsId}`);
        } else {
            nextQuestion();
        }
    };

    const nextQuestion = () => {
        setQuestionIndex((prev) => prev + 1);
    }

    const getQuestionIndexById = (questionId: number): number => {
        const index = getQuizResponce.data?.questions.findIndex(q => Number(q.id) === questionId) ?? -1;
        return index;
    };

    const trySetLastQuestionIndex = async () => {
        let _questionIndex: number = 0;

        const response = await getLastAnsweredQuestionId(quizStatsId);
        const lastAnsweredQuestionId = Number(response.question_id);

        if (Number.isFinite(lastAnsweredQuestionId) && lastAnsweredQuestionId !== -1) {
            _questionIndex = getQuestionIndexById(lastAnsweredQuestionId) + 1;
        }

        setQuestionIndex(_questionIndex);
    }

    useEffect(() => {
        trySetLastQuestionIndex();
    }, [getQuizResponce])



    useEffect(() => {
        if (!getQuizByQuizStatsIdResponce.isSuccess) return;

        getQuizFunc(Number(getQuizByQuizStatsIdResponce.data?.quiz_id));
    }, [getQuizByQuizStatsIdResponce, getQuizFunc])

    useEffect(() => {
        if (!getQuizResponce.data) {
            return;
        }

        if (questionIndex >= getQuizResponce.data.questions.length) {
            navigate(`/results/${getQuizResponce.data.id}/${quizStatsId}`);
        }
    }, [getQuizResponce.data, questionIndex, quizStatsId, navigate]);

    return (
        <AutoFetchTab response={getQuizByQuizStatsIdResponce}>
            {() => {
                return <WithApi<Quiz> response={getQuizResponce}>
                    {
                        (quiz: Quiz) => {
                            return <>
                                <Loadable loading={sendQuestionResultResponce.isFetching}>
                                    {currentQuestion && (
                                        <QuizQuestionPanel
                                            question={currentQuestion as QuizQuestion}
                                            onAnswerButtonClick={(answerOptionId: number) =>
                                                handleSelectOption(answerOptionId)
                                            }
                                            questionIndex={questionIndex}
                                            questionCount={quiz.questions.length}
                                            error={sendQuestionResultResponce.error}
                                        />
                                    )}
                                </Loadable>
                            </>
                        }
                    }
                </WithApi>
            }}
        </AutoFetchTab>
    );
};


//const currentQuestion: QuizQuestion | undefined =
//    quiz.questions[questionIndex];

//return (
//    <Loadable
//        loading={
//            quizFetchState.isFetching ||
//            sendQuizResultsState.isFetching
//        }
//        fallback="Загрузка теста"
//    >
//
//    </Loadable>
//);
