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
import DocumentList from "./pages/admin/documents/DocumentList";
import UploadDocument from "./pages/admin/documents/UploadDocument";
import DocumentDetail from "./pages/admin/documents/DocumentDetail";
import DocumentPreview from "./pages/admin/documents/DocumentPreview";
import ReviewDocument from "./pages/admin/documents/ReviewDocument";
import PartnerSchoolsPage from "./pages/admin/partner-schools";
import PartnerSchoolDetailPage from "./pages/admin/partner-schools/detail";
import { PERMISSIONS } from "./types/permissions";
import SystemActivityLogs from "./pages/admin/activity-log";
import OrganizationSettings from "./pages/admin/setting";
import ApplicationsPage, { ApplicationDetailPage } from "./pages/admin/applications";
import PaymentsPage from "./pages/admin/payments";
import InquiriesPage from "./pages/admin/inquiries";
import ScholarshipsPage from "./pages/admin/scholarships";

import IdCardsPage from "./pages/admin/id-cards";
import { VerifyCardPage } from "./pages/admin/id-cards/VerifyCardPage";

import WelcomePage from "./pages/none-admin/welcome";
import ApplyPage from "./pages/none-admin/apply";
import StudentLayout from "./pages/none-admin/student/StudentLayout";
import StudentOverview from "./pages/none-admin/student/Overview";
import StudentDocuments from "./pages/none-admin/student/Documents";
import StudentPayments from "./pages/none-admin/student/Payments";
import StudentRequests from "./pages/none-admin/student/Requests";

const IMPLEMENTED_ADMIN_PAGES: Record<string, ComponentType> = {
  "/admin": Dashboard,
  "/students": StudentsPage,
  "/users": UserManagementPage,
  "/role-permission": RoleBasePermission,
  "/documents": DocumentList,
  "/partner-schools": PartnerSchoolsPage,
  "/activity-logs": SystemActivityLogs,
  "/setting": OrganizationSettings,
  "/applications": ApplicationsPage,
  "/payments": PaymentsPage,
  "/inquiries": InquiriesPage,
  "/scholarships": ScholarshipsPage,
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
      {/* Public marketing site + self-service admissions */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/apply" element={<ApplyPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Public QR Code Verification Route */}
      <Route path="/verify-card" element={<VerifyCardPage />} />

      {/* Student portal — STUDENT role only */}
      <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/student/documents" element={<StudentDocuments />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/student/requests" element={<StudentRequests />} />
        </Route>
      </Route>

      {/* Any authenticated user — no specific permission required */}
      <Route element={<ProtectedRoute />}>
        {openPaths.map(renderAdminRoute)}
        <Route path="/documents/upload" element={<UploadDocument />} />

        <Route path="/documents/:id" element={<DocumentDetail />} />

        <Route path="/documents/:id/preview" element={<DocumentPreview />} />

        <Route path="/documents/:id/review" element={<ReviewDocument />} />
      </Route>

      {/* Partner school detail page route */}
      <Route element={<ProtectedRoute requiredPermissions={[PERMISSIONS.PARTNER_SCHOOL_VIEW]} />}>
        <Route path="/partner-schools/:id" element={<PartnerSchoolDetailPage />} />
      </Route>

      <Route element={<ProtectedRoute requiredPermissions={[PERMISSIONS.APPLICATION_VIEW]} />}>
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
      </Route>

      {/* Permission-gated routes, one ProtectedRoute per required permission */}
      {Array.from(pathsByPermission.entries()).map(([permission, paths]) => (
        <Route
          key={permission}
          element={<ProtectedRoute requiredPermissions={[permission]} />}
        >
          {paths.map(renderAdminRoute)}
        </Route>
      ))}
    </Routes>
  );
}
