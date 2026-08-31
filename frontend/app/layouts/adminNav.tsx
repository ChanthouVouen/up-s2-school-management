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
import type { RoleName } from "../types/auth.types";

/**
 * Single source of truth mapping each sidebar entry to its route.
 * Add a page? Add its route here and it shows up in the sidebar automatically.
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    items: [{ icon: <LayoutGrid size={18} />, label: "Dashboard", path: "/" }],
  },
  {
    title: "Academics & Admission",
    items: [
      { icon: <Users size={18} />, label: "Students", path: "/students" },
      { icon: <ClipboardList size={18} />, label: "Applications", path: "/applications" },
      { icon: <FileText size={18} />, label: "Documents", path: "/documents" },
      { icon: <GraduationCap size={18} />, label: "Partner Schools", path: "/partner-schools" },
    ],
  },
  {
    title: "Finance & Services",
    items: [
      { icon: <Banknote size={18} />, label: "Scholarships", path: "/scholarships" },
      { icon: <CreditCard size={18} />, label: "Payments", path: "/payments" },
      { icon: <IdCard size={18} />, label: "ID Cards", path: "/id-cards" },
    ],
  },
  {
    title: "Access & Security",
    items: [
      { icon: <UserCog size={18} />, label: "User Management", path: "/users", adminOnly: true },
      { icon: <ShieldCheck size={18} />, label: "Roles & Permissions", path: "/roles-permissions", adminOnly: true },
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

/** Sidebar entries requiring ADMIN, e.g. to gate their routes with ProtectedRoute. */
export const ADMIN_ONLY_PATHS = NAV_CATEGORIES.flatMap((category) => category.items)
  .filter((item) => item.adminOnly)
  .map((item) => item.path);

/** Drops nav entries the given role can't see (e.g. STAFF never sees "User Management"). */
export function getNavCategoriesForRole(role: RoleName | undefined): NavCategory[] {
  return NAV_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter((item) => !item.adminOnly || role === "ADMIN"),
  })).filter((category) => category.items.length > 0);
}
