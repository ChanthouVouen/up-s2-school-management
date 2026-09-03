import { Navigate, Outlet } from "react-router";
import { useAuth } from "./auth/AuthContext";
import type { RoleName } from "./types/auth.types";

interface ProtectedRouteProps {
  allowedRoles?: RoleName[];
  /** Grants access if the user holds at least one of these permissions. */
  requiredPermissions?: string[];
}

export default function ProtectedRoute({ allowedRoles, requiredPermissions }: ProtectedRouteProps) {
  const { isAuthenticated, role, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && !hasPermission(...requiredPermissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
