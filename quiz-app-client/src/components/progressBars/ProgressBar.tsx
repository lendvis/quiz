import type { FC } from "react"

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
    progress: number
}

export const ProgressBar:FC<ProgressBarProps> = ({progress, ...rest}) => {
    return (
        <div className="theme-progress-track h-4 rounded overflow-hidden" {...rest}>
            <div className="theme-progress-fill transition-all duration-75 h-full" style={{width: `${progress}%`}} />
        </div>
    )
}
