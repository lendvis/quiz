import { useContext, type FC, type ReactNode } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { NonAuthorizedFallback } from "../fallbacks/NonAuthorizedFallback";

export interface AuthGuardProps {
    children: ReactNode,
    fallback?: ReactNode
}

export const AuthGuard: FC<AuthGuardProps> = ({ children, fallback }) => {
    const auth = useContext(AuthContext);

    if (auth?.isAuthorized) {
        return <>{children}</>;
    }

    return fallback ? (
        <>{fallback}</>
    ) : (
        <NonAuthorizedFallback></NonAuthorizedFallback>
    );
};