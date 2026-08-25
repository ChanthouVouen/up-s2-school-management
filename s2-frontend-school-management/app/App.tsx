import { Route, Routes } from "react-router";

import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Unauthorized from "./pages/Unauthorized";
import LoginPage from "./auth/login";
import RegisterPage from "./auth/register";
import ForgotPassword from "./auth/forgot-password";
import ProtectedRoute from "./ProtectedRoute";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Any authenticated user (ADMIN or STAFF) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* ADMIN-only routes — pass allowedRoles to restrict a branch of routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
