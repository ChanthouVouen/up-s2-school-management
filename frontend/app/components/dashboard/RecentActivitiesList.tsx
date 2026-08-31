import { Clock } from "lucide-react";
import type { ActivityItem } from "../../services/dashboardService";

export interface RecentActivitiesListProps {
  activities: ActivityItem[];
}

export default function RecentActivitiesList({ activities }: RecentActivitiesListProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        flex: 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <Clock size={16} color="#3b82f6" />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>
          Recent Activities
        </span>
      </div>

      {activities.length === 0 ? (
        <div style={{ padding: "16px 0", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
          No recent system activities.
        </div>
      ) : (
        activities.map((act, index) => (
          <div
            key={act.id || index}
            style={{
              borderBottom: index < activities.length - 1 ? "1px solid #f1f5f9" : "none",
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
              {act.title}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>
              {act.description}
            </div>
            <div style={{ fontSize: 10, color: "#94a3b8" }}>
              {new Date(act.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
