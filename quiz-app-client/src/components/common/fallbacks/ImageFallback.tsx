import type { FC, ReactNode } from "react";
import { ErrorFallback, type ErrorFallbackProps } from "./ErrorFallback";

export interface ImageErrorFallbackProps extends ErrorFallbackProps {
    children?: ReactNode;
    errorCode?: string;
}


export const ImageErrorFallback:FC<ImageErrorFallbackProps> = () => {
    return (
        <ErrorFallback>
                    <h1 className="text-black mb-2">{`При загрузке изображения произошла ошибка`}</h1>
        </ErrorFallback>
    )
}