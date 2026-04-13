import { type FC, type InputHTMLAttributes, type ReactNode } from "react";
import { Input } from "../../../components/ui/Input";
import { ErrorBoundary } from "../../../components/common/ErrorBoundary";
import { AlertTriangle } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    children?: ReactNode;
    error?: string | null
}

export const AuthInput: FC<InputProps> = ({ children, ...props }) => {
    const errorFallback = (error: string) => <div className="text-red-500 flex flex-row">
        <AlertTriangle className="mr-2"/>
        {error}
    </div>

    return (
        <div className="mb-2.5 text-white">
            <Input className={props.error ? "border-2 border-red-500" : ""} {...props}>{children}</Input>
            <div>
                <ErrorBoundary error={props.error != null} fallback={errorFallback(props.error as string)} />
            </div>
        </div>
    );
};
