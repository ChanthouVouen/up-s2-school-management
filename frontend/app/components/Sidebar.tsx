import React, { useState } from "react";
import { NavLink } from "react-router";
import ConfirmModal from "./users/ConfirmModal";

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export interface NavCategory {
  title?: string;
  items: NavItem[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
  navCategories?: NavCategory[];
  navItems?: NavItem[];
  onLogout: () => void;
}

export default function Sidebar({
  sidebarOpen,
  navCategories,
  navItems = [],
  onLogout,
}: SidebarProps) {
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!sidebarOpen) return null;

  const categoriesToRender: NavCategory[] =
    navCategories && navCategories.length > 0
      ? navCategories
      : [{ items: navItems }];

  return (
    <>
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
                {category.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      background: isActive ? "#edf2fe" : "transparent",
                      color: isActive ? "#3b82f6" : "#475569",
                      border: "none",
                      borderRight: isActive ? "4px solid #3b82f6" : "4px solid transparent",
                      borderRadius: "8px 0 0 8px",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 13.5,
                      fontWeight: isActive ? 600 : 500,
                      width: "100%",
                      transition: "all 0.15s ease",
                      textDecoration: "none",
                    })}
                  >
                    {({ isActive }) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
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
                    )}
                  </NavLink>
                ))}
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
            onClick={() => setIsModalOpen(true)}
            // onMouseEnter={() => setIsLogoutHovered(true)}
            // onMouseLeave={() => setIsLogoutHovered(false)}
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
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onConfirm={onLogout}
        title="Logout"
        message={
          <>
            Are you sure to logout your account?
          </>
        }
        confirmText="Yes, I logout"
        cancelText="Cancel"
        variant="danger"
        loading={submitting}
      />
    </>
  );
}
