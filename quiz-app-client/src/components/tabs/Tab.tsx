import type { FC, HTMLAttributes } from "react"

export interface TabProps extends React.PropsWithChildren , HTMLAttributes<HTMLDivElement> {

}

export const Tab:FC<TabProps> = ({children, className = "", ...rest}) => {
    return (
        <div className={`p-4 w-full min-h-full ${className}`} {...rest}>
            {children}
        </div>
    )
}
