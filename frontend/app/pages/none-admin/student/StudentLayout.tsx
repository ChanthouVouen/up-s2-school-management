import { NavLink, Outlet } from "react-router";
import { GraduationCap, LayoutGrid, FileText, CreditCard, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";

const NAV_ITEMS = [
  { to: "/student", label: "Overview", icon: <LayoutGrid size={17} />, end: true },
  { to: "/student/documents", label: "Documents", icon: <FileText size={17} /> },
  { to: "/student/payments", label: "Payments", icon: <CreditCard size={17} /> },
  { to: "/student/requests", label: "Requests", icon: <MessageSquare size={17} /> },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={18} />
            </span>
            <div>
              <p className="text-sm font-bold leading-none text-slate-900">Student Portal</p>
              <p className="text-xs text-slate-400">{user?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
