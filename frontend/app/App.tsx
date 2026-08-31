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
import { ADMIN_ONLY_PATHS, NAV_CATEGORIES } from "./layouts/adminNav";
import Dashboard from './pages/admin/AdminDashboard';


const IMPLEMENTED_ADMIN_PAGES: Record<string, ComponentType> = {
  "/students": StudentsPage,
  "/users": UserManagementPage,
};

const allAdminPaths = NAV_CATEGORIES.flatMap((category) => category.items.map((item) => item.path)).filter(
  (path) => path !== "/",
);
const adminOnlyPaths = allAdminPaths.filter((path) => ADMIN_ONLY_PATHS.includes(path));
const generalPaths = allAdminPaths.filter((path) => !ADMIN_ONLY_PATHS.includes(path));

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

      {/* Any authenticated user (ADMIN or STAFF) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        {generalPaths.map(renderAdminRoute)}
      </Route>

      {/* ADMIN-only routes, e.g. User Management */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        {adminOnlyPaths.map(renderAdminRoute)}
      </Route>
    </Routes>
  );
}
