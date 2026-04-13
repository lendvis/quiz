import type {FC} from "react";
import { Button, type ButtonProps } from "./Button";

export interface PrimaryButtonProps extends ButtonProps {
    children?: React.ReactNode;
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({children, ...rest}) => {
    return (
        <Button className="bg-amber-500" {...rest}>
            {children}
        </Button>
    )
}