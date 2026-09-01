import type { ComponentType } from "react";
import { Route, Routes } from "react-router";

import Unauthorized from "./pages/Unauthorized";
import LoginPage from "./auth/login";
import RegisterPage from "./auth/register";
import ForgotPassword from "./auth/forgot-password";
import ProtectedRoute from "./ProtectedRoute";
import StudentsPage from "./pages/admin/students";
import UserManagementPage from "./pages/admin/users";
import ComingSoonPage from "./pages/admin/ComingSoonPage";
import { NAV_CATEGORIES, PATH_PERMISSIONS } from "./layouts/adminNav";
import Dashboard from './pages/admin/AdminDashboard';
import RoleBasePermission from "./pages/admin/role-permission";
import SystemActivityLogs from "./pages/admin/activity-log";
import OrganizationSettings from "./pages/admin/setting";


const IMPLEMENTED_ADMIN_PAGES: Record<string, ComponentType> = {
  "/": Dashboard,
  "/students": StudentsPage,
  "/users": UserManagementPage,
  "/role-permission": RoleBasePermission,
  "/activity-logs": SystemActivityLogs,
  "/setting": OrganizationSettings
};

const allAdminPaths = NAV_CATEGORIES.flatMap((category) => category.items.map((item) => item.path));

const openPaths = allAdminPaths.filter((path) => !PATH_PERMISSIONS[path]);

// Group permission-gated paths by the permission they require, so routes
// sharing a permission share one ProtectedRoute wrapper.
const pathsByPermission = new Map<string, string[]>();
for (const path of allAdminPaths) {
  const permission = PATH_PERMISSIONS[path];
  if (!permission) continue;
  const group = pathsByPermission.get(permission) ?? [];
  group.push(path);
  pathsByPermission.set(permission, group);
}

function renderAdminRoute(path: string) {
  const Page = IMPLEMENTED_ADMIN_PAGES[path] ?? ComingSoonPage;
  return <Route key={path} path={path} element={<Page />} />;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Any authenticated user — no specific permission required */}
      <Route element={<ProtectedRoute />}>
        {openPaths.map(renderAdminRoute)}
      </Route>

      {/* Permission-gated routes, one ProtectedRoute per required permission */}
      {Array.from(pathsByPermission.entries()).map(([permission, paths]) => (
        <Route key={permission} element={<ProtectedRoute requiredPermissions={[permission]} />}>
          {paths.map(renderAdminRoute)}
        </Route>
      ))}
    </Routes>
  );
}
