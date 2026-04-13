import type { FC, ReactNode } from "react";
import { Button } from "../../buttons/Button";
import { ErrorFallback, type ErrorFallbackProps } from "./ErrorFallback";
import { useNavigate } from "react-router-dom";

export interface NonAuthorizedFallbackProps extends ErrorFallbackProps {
    children?: ReactNode;
    errorCode?: string;
}


export const NonAuthorizedFallback:FC<NonAuthorizedFallbackProps> = () => {
    const navigate = useNavigate();

    return (
        <ErrorFallback>
            <h1 className="text-black mb-2">{`Пожайлуста авторизуйтесь`}</h1>
            <Button onClick={() => {navigate("/login")}}>Авторизоваться</Button>
        </ErrorFallback>
    )
}