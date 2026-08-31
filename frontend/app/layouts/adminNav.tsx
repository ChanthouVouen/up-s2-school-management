import {
  LayoutGrid,
  Users,
  ClipboardList,
  FileText,
  GraduationCap,
  Banknote,
  CreditCard,
  IdCard,
  UserCog,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
} from "lucide-react";
import type { NavCategory } from "../components/Sidebar";
import { PERMISSIONS } from "../types/permissions";

/**
 * Single source of truth mapping each sidebar entry to its route.
 * Add a page? Add its route here and it shows up in the sidebar automatically.
 * `permission` gates both visibility (Sidebar) and access (App.tsx routes) —
 * it must match a permission name seeded in backend/prisma/seed.ts, or every
 * role will be denied. Omit it for pages any authenticated user can open.
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    items: [{ icon: <LayoutGrid size={18} />, label: "Dashboard", path: "/", permission: PERMISSIONS.DASHBOARD_VIEW }],
  },
  {
    title: "Academics & Admission",
    items: [
      { icon: <Users size={18} />, label: "Students", path: "/students", permission: PERMISSIONS.STUDENT_VIEW },
      { icon: <ClipboardList size={18} />, label: "Applications", path: "/applications", permission: PERMISSIONS.APPLICATION_VIEW },
      { icon: <FileText size={18} />, label: "Documents", path: "/documents", permission: PERMISSIONS.DOCUMENT_VIEW },
      { icon: <GraduationCap size={18} />, label: "Partner Schools", path: "/partner-schools", permission: PERMISSIONS.PARTNER_SCHOOL_VIEW },
    ],
  },
  {
    title: "Finance & Services",
    items: [
      { icon: <Banknote size={18} />, label: "Scholarships", path: "/scholarships" },
      { icon: <CreditCard size={18} />, label: "Payments", path: "/payments", permission: PERMISSIONS.PAYMENT_VIEW },
      { icon: <IdCard size={18} />, label: "ID Cards", path: "/id-cards" },
    ],
  },
  {
    title: "Access & Security",
    items: [
      { icon: <UserCog size={18} />, label: "User Management", path: "/users", permission: PERMISSIONS.USER_VIEW },
      { icon: <ShieldCheck size={18} />, label: "Roles & Permissions", path: "/role-permission", permission: PERMISSIONS.ROLE_VIEW },
    ],
  },
  {
    title: "System & Reports",
    items: [
      { icon: <BarChart3 size={18} />, label: "Reports", path: "/reports" },
      { icon: <History size={18} />, label: "Activity Logs", path: "/activity-logs" },
      { icon: <Settings size={18} />, label: "Settings", path: "/settings" },
    ],
  },
];

const PAGE_DESCRIPTIONS: Record<string, string> = {
  Dashboard: "Welcome back, Admin! Here's real-time dynamic data from your school database.",
  Students: "Manage student profiles, enrollments, and academic records.",
  Applications: "Review and process new student admission applications.",
  Documents: "Upload, view, and manage school documents and records.",
  "Partner Schools": "Manage affiliated partner schools and educational institutions.",
  Scholarships: "Track scholarship programs, eligibility, and awarded students.",
  Payments: "View tuition fee payments, invoices, and financial transactions.",
  "ID Cards": "Generate, issue, and manage student and staff ID cards.",
  "User Management": "Manage user accounts.",
  "Roles & Permissions": "Configure user roles, system permissions, and security access controls.",
  Reports: "Generate administrative analytics and performance reports.",
  "Activity Logs": "Monitor system activity, audit trails, and user logs.",
  Settings: "Configure system preferences and portal settings.",
};

export function getPageDescription(label: string): string {
  return PAGE_DESCRIPTIONS[label] ?? `Overview and management portal for ${label.toLowerCase()}.`;
}

/** Finds the sidebar entry whose route matches the current location. */
export function findNavItemByPath(pathname: string) {
  return NAV_CATEGORIES.flatMap((category) => category.items).find(
    (item) => item.path === pathname,
  );
}

/** Maps each route to the permission required to reach it, e.g. to gate routes with ProtectedRoute. */
export const PATH_PERMISSIONS: Record<string, string> = Object.fromEntries(
  NAV_CATEGORIES.flatMap((category) => category.items)
    .filter((item) => item.permission)
    .map((item) => [item.path, item.permission as string]),
);

/** Drops nav entries the given permissions can't see (e.g. STAFF never sees "User Management"). */
export function getNavCategoriesForPermissions(permissions: string[]): NavCategory[] {
  return NAV_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter((item) => !item.permission || permissions.includes(item.permission)),
  })).filter((category) => category.items.length > 0);
}
