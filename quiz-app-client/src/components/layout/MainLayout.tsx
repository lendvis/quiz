import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";

export const MainLayout = () => {
    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1">
                <Outlet />
            </div>
        </div>
    );
};
