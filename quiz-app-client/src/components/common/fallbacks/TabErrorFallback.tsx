import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button";
import { ErrorFallback, type ErrorFallbackProps } from "./ErrorFallback";

export interface TabErrorFallbackProps extends ErrorFallbackProps {
    children?: ReactNode;
    errorCode?: string;
}


export const TabErrorFallback:FC<TabErrorFallbackProps> = () => {
    return (
        <ErrorFallback>
            <h1 className="text-black mb-2">{`При загрузке данных произошла ошибка`}</h1>
            <Button>Повторить</Button>
        </ErrorFallback>
    )
}