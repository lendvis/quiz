import { type FC, type ReactNode } from "react";
import { useGetUserGroup } from "../../../hooks/auth/useGetUserGroup";
import { ErrorFallback } from "../fallbacks/ErrorFallback";
import { Loadable } from "../Loadable";

export interface GroupGuardProps {
    children: ReactNode,
    fallback?: ReactNode
}

export const GroupGuard: FC<GroupGuardProps> = ({ children, fallback }) => {
    const getUserGroupResponce = useGetUserGroup();

    if (getUserGroupResponce.isSuccess) {
        return <>{children}</>;
    }

    return fallback ? (
        <>{fallback}</>
    ) : (
        <Loadable loading={getUserGroupResponce.isFetching}>
            <ErrorFallback>Вы должны быть в группе</ErrorFallback>
        </Loadable>
    );
};
