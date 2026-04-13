import { useState, type FC, type ReactNode, useEffect } from "react"
import { QuestionAnswerButton, type QuestionAnswerButtonProps } from "./QuestionAnswerButton"

export interface QuestionAnswerButtonEditorProps extends QuestionAnswerButtonProps {
    children?: ReactNode
    text: string
    onChangeText?: (value: string) => void
}

export const QuestionAnswerButtonEditor: FC<QuestionAnswerButtonEditorProps> = ({
    text,
    onChangeText,
    ...rest
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(text)

    useEffect(() => {
        setValue(text)
    }, [text])

    const enableEditMode = () => {
        setIsEditing(true)
    }

    const disableEditMode = () => {
        setIsEditing(false)
        onChangeText?.(value)
    }

    return (
        <QuestionAnswerButton
            {...rest}
            onClick={!isEditing ? enableEditMode : undefined}
            className="w-full"
        >
            {!isEditing ? (
                <span className="block w-full text-left truncate">
                    {value}
                </span>
            ) : (
                <div className="flex items-center gap-2 w-full">
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === "Enter") disableEditMode()
                            if (e.key === "Escape") setIsEditing(false)
                        }}
                        className="
                            flex-1
                            bg-transparent
                            border
                            border-gray-300
                            rounded-md
                            px-2 py-1
                            text-sm
                            outline-none
                            focus:ring-2
                            focus:ring-blue-500
                            focus:border-blue-500
                        "
                    />

                    <div
                        onClick={(e) => {
                            e.stopPropagation()
                            disableEditMode()
                        }}
                        className="
                            flex
                            items-center
                            justify-center
                            w-8 h-8
                            rounded-full
                            bg-blue-600
                            text-white
                            text-sm
                            hover:bg-blue-700
                            active:scale-95
                            transition
                        "
                    >
                        ✓
                    </div>
                </div>
            )}
        </QuestionAnswerButton>
    )
}