import type {FC} from "react";
import { Button, type ButtonProps } from "./Button";
import { Loadable } from "../common/Loadable";

export interface LoadableButtonProps extends ButtonProps {
    children?: React.ReactNode;
    loading: boolean
}

export const LoadableButton: FC<LoadableButtonProps> = ({children, loading, ...rest}) => {
    return (
        <Button className="" {...rest}>
            <Loadable loading={loading}>
                {children}
            </Loadable>
        </Button>
    )
}