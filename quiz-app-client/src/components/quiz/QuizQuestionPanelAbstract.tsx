import { useEffect, type FC, type ReactNode } from "react"
import type { QuizQuestion } from "../../api/quiz/getQuiz"
import { ServerBackground } from "../ServerBackground"
import { type QuestionAnswerButtonProps } from "../buttons/questionAnswerButtons/QuestionAnswerButton"

export interface QuizQuestionPanelAbstractProps {
    question: QuizQuestion
    onAnswerButtonClick: ()  => {};
    questionButtonPrefab: (props: QuestionAnswerButtonProps) => ReactNode;
}

export const QuizQuestionPanelAbstract: FC<QuizQuestionPanelAbstractProps> = ({question, onAnswerButtonClick, questionButtonPrefab}) => {
    useEffect(() =>{
        console.log(question);
    }, [])

    return (
        <div className="flex flex-col md:flex-row text-black gap-5 w-full h-full items-center">
            <div className="flex flex-col flex-1 items-stretch justify-center">
                {
                    question.image && (
                        <ServerBackground imageId={question.image} className="w-full h-85 bg-gray-800 bg-cover bg-center"></ServerBackground>
                    )
                }
                <h1 className="mt-5 bg-black/10 p-2 rounded ">{question.text}</h1>
            </div>

            <div className="flex flex-col flex-1 justify-center gap-2">
                

                {question!.answers.map((_, i) => (
                    questionButtonPrefab({onClick: () => {onAnswerButtonClick()}, tabIndex: i, children: (<div>test</div>) })
                ))}
            </div>
        </div>
    )
}

//<ProgressBar progress={passed ? 100 : (questionId / quiz.questions.length) * 100} />