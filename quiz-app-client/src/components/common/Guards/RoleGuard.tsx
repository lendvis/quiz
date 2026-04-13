import { useContext, type FC, type ReactNode } from "react";
import { AuthContext } from "../../../context/AuthContext";

export interface RoleGuardProps {
  children: ReactNode;
  roles: string[];
  fallback?: ReactNode;
}

export const RoleGuard: FC<RoleGuardProps> = ({ children, roles, fallback = null }) => {
  const auth = useContext(AuthContext);
  const role = auth?.role;

  if (role && roles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
