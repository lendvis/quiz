import type { FC } from "react"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    progress: number
}

export const ProgressBar:FC<ProgressBarProps> = ({progress, ...rest}) => {
    return (
        <div className="h-4 bg-gray-600 rounded overflow-hidden" {...rest}>
            <div className="transition-all duration-75 h-full bg-gray-700" style={{width: `${progress}%`}} />
        </div>
    )
}