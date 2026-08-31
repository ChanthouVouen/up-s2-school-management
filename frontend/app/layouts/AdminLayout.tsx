import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../auth/AuthContext";
import { findNavItemByPath, getNavCategoriesForPermissions, getPageDescription } from "./adminNav";

export interface AdminLayoutProps {
  children: ReactNode;
  pageDescription?: string;
  notificationCount?: number;
  headerAction?: ReactNode;
}

export default function AdminLayout({
  children,
  pageDescription,
  notificationCount = 0,
  headerAction,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logout, permissions, user } = useAuth();
  const location = useLocation();

  const currentNavItem = findNavItemByPath(location.pathname);
  const title = currentNavItem?.label ?? "Page";
  const navCategories = getNavCategoriesForPermissions(permissions);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      <Sidebar sidebarOpen={sidebarOpen} navCategories={navCategories} onLogout={handleLogout} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          notificationCount={notificationCount}
          onNotificationClick={() => console.log("Open Notifications")}
          onProfileClick={() => console.log("Open Profile Menu")}
          currentUser={user}
        />

        <main className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <PageHeader
            title={title}
            description={pageDescription ?? getPageDescription(title)}
            action={headerAction}
          />
          {children}
        </main>
      </div>
    </div>
  );
}
