import { Outlet } from "react-router-dom";

export const AuthLayout = () => {
    return (
        <div className="flex justify-center items-center h-screen transition-all">
            <Outlet />
        </div>
    );
};
