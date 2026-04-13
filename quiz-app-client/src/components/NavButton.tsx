import type {FC} from "react";
import { Button } from "./buttons/Button";
import { NavLink } from "react-router-dom";

interface NavButtonProps {
    children?: React.ReactNode;
    to: string;
}

export const NavButton: FC<NavButtonProps> = ({children, to}) => {
    return (
        <NavLink to = {to}>
            <Button>
                {children}
            </Button>
        </NavLink>
    )
}