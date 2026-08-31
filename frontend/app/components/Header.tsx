import React from "react";
import AvatarPlaceholder from "./avatar";

export interface NotificationItem {
  id: string | number;
  message: string;
  time: string;
}

export interface HeaderProps {
  onToggleSidebar: () => void;
  notificationCount?: number;
  notifications?: NotificationItem[];
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  currentUser: any;
}

export default function Header({
  onToggleSidebar,
  notificationCount = 0,
  notifications = [], // Prevents .map() on undefined
  onNotificationClick,
  onProfileClick,
  currentUser,
}: HeaderProps) {

  console.log(currentUser);
  return (
    <header
      style={{
        height: 60,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      {/* Left: Sidebar Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: "none",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
              fontSize: 16,
              fontWeight: 600,
              color: "#0f172a",
          }}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>
          School Management Portal
        </span>
      </div>

      {/* Right: Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button
          onClick={onNotificationClick}
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          🔔
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: "50%",
                width: 16,
                height: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {notificationCount}
            </span>
          )}
        </button>

        {/* Dropdown list guarded against undefined map errors */}
        {notifications.length > 0 && (
          <div style={{ display: "none" }}>
            {notifications.map((n) => (
              <div key={n.id}>{n.message}</div>
            ))}
          </div>
        )}

        <button
          onClick={onProfileClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <AvatarPlaceholder name={currentUser.name} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>
            {currentUser.name}
          </span>
        </button>
      </div>
    </header>
  );
}
