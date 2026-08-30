import React, { useState } from "react";

export interface NavItem {
  icon: React.ReactNode;
  label: string;
}

export interface NavCategory {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
  activeNav: string;
  handleNavigation: (label: string) => void;
  navCategories?: NavCategory[];
  navItems?: NavItem[];
  onLogout: () => void;
}

export default function Sidebar({
  sidebarOpen,
  activeNav,
  handleNavigation,
  navCategories,
  navItems = [],
  onLogout,
}: SidebarProps) {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  if (!sidebarOpen) return null;

  const categoriesToRender: NavCategory[] =
    navCategories && navCategories.length > 0
      ? navCategories
      : [{ items: navItems }];

  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        maxHeight: "100vh",
        background: "#ffffff",
        borderRight: "1px solid #e2e8f0",
        color: "#1e293b",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px 0",
        transition: "all 0.2s ease",
        boxShadow: "1px 0 6px rgba(0, 0, 0, 0.02)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      {/* Header section (fixed at top) */}
      <div style={{ flexShrink: 0 }}>
        {/* Logo and Brand Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 20px 16px",
            borderBottom: "1px solid #f1f5f9",
            marginBottom: 12,
          }}
        >
          <img
            src="/images/I-tech-ca.jpg"
            alt="logo"
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              Admin Portal
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
              School Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Categories (Scrollable container) */}
      <nav
        className="custom-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: "0 12px",
        }}
      >
        {categoriesToRender.map((category, catIdx) => (
          <div key={category.title || catIdx}>
            {category.title && (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  padding: "6px 12px 6px",
                }}
              >
                {category.title}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {category.items.map((item) => {
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
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      background: isActive
                        ? "#edf2fe"
                        : isHovered
                          ? "#f8fafc"
                          : "transparent",
                      color: isActive
                        ? "#3b82f6"
                        : isHovered
                          ? "#1e293b"
                          : "#475569",
                      border: "none",
                      borderRight: isActive
                        ? "4px solid #3b82f6"
                        : "4px solid transparent",
                      borderRadius: "8px 0 0 8px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 13.5,
                      fontWeight: isActive ? 600 : 500,
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 11 }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: isActive ? "#3b82f6" : "#64748b",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout Footer (fixed at bottom) */}
      <div
        style={{
          padding: "16px 16px 0",
          borderTop: "1px solid #f1f5f9",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onLogout}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
          style={{
            width: "100%",
            padding: "10px",
            background: isLogoutHovered ? "#fee2e2" : "#fef2f2",
            color: isLogoutHovered ? "#dc2626" : "#ef4444",
            border: "1px solid #fecaca",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s ease",
          }}
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

