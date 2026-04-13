import { type FC, type FormHTMLAttributes, type ReactNode } from "react";

export interface GroupFallbackProps extends FormHTMLAttributes<HTMLFormElement> {
    children?: ReactNode;
}

export const GroupFallback: FC<GroupFallbackProps> = ({ children, ...rest }) => {
    return (
        <div className="w-full h-full flex justify-center items-center">
            <form className="w-full h-full max-w-150 flex flex-col justify-center items-center" {...rest}>
                {children}
            </form>
        </div>
    )
}