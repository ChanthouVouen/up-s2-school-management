import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth/AuthContext";
import type { RoleName } from "./types/auth.types";

interface ProtectedRouteProps {
  allowedRoles?: RoleName[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
