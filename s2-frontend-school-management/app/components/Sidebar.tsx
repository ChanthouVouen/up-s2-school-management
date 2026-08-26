import React, { useState } from "react";

export interface NavItem {
  icon: string;
  label: string;
}

export interface SidebarProps {
  sidebarOpen: boolean;
  activeNav: string;
  handleNavigation: (label: string) => void;
  navItems?: NavItem[];
  onLogout: () => void;
}

export default function Sidebar({
  sidebarOpen,
  activeNav,
  handleNavigation,
  navItems = [],
  onLogout,
}: SidebarProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  if (!sidebarOpen) return null;

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px 0",
        transition: "width 0.2s ease",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <img
            src="/images/I-tech-ca.jpg"
            alt="logo"
            style={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </div>
        <div
          style={{
            padding: "0 20px 20px",
            fontSize: 18,
            fontWeight: 700,
            color: "#38bdf8",
            textAlign: "center",
          }}
        >
          Admin Dashboard
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {navItems.map((item) => {
            const isActive = activeNav === item.label;
            const isHovered = hoveredNav === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavigation(item.label)}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 20px",
                  background: isActive
                    ? "#1e293b"
                    : isHovered
                      ? "#334155"
                      : "transparent",
                  color: isActive || isHovered ? "#38bdf8" : "#94a3b8",
                  border: "none",
                  borderLeft: isActive
                    ? "4px solid #38bdf8"
                    : isHovered
                      ? "4px solid #0284c7"
                      : "4px solid transparent",
                  textAlign: "left",
                    cursor: "pointer",
                    borderRadius: 50,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  width: "100%",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ padding: "0 20px" }}>
        <button
          type="button"
          onClick={onLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          style={{
            width: "100%",
            padding: "10px",
            background: isLogoutHovered ? "#ef4444" : "#ef444420",
            color: isLogoutHovered ? "#ffffff" : "#f87171",
            border: isLogoutHovered
              ? "1px solid #ef4444"
              : "1px solid #ef444440",
            borderRadius: 50,
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s ease",
            transform: isLogoutHovered ? "translateY(-1px)" : "none",
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
