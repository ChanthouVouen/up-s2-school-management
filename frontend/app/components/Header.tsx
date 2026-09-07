import React from "react";
import AvatarPlaceholder from "./avatar";

export interface NotificationItem {
  id: string | number;
  message: string;
  time: string;
}

export interface HeaderProps {
  onToggleSidebar?: () => void;
  notificationCount?: number;
  notifications?: NotificationItem[];
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  currentUser: any;
}

export default function Header({
  onProfileClick,
  currentUser,
}: HeaderProps) {
  return (
    <header
      style={{
        height: 60,
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 24px",
      }}
    >

      {/* Right: User Profile */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <button
          onClick={onProfileClick}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: onProfileClick ? "pointer" : "default",
            padding: 0,
            textAlign: "left",
          }}
        >
          <AvatarPlaceholder name={currentUser?.name || "Admin"} />
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", lineHeight: 1.2 }}>
              {currentUser?.name || "Admin"}
            </span>
            {currentUser?.email && (
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400, marginTop: 2 }}>
                {currentUser.email}
              </span>
            )}
          </div>
        </button>
      </div>
    </header>
  );
}
