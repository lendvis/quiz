import type { FC, ReactNode } from "react"
import { Button, type ButtonProps } from "../Button"

export interface QuestionAnswerButtonProps extends ButtonProps {
    children?: ReactNode
}

export const QuestionAnswerButton: FC<QuestionAnswerButtonProps> = ({ children, ...rest }) => {
    return (
        <Button {...rest}>{children}</Button>
    )
}