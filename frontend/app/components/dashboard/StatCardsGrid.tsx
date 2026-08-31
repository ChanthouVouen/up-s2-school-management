import type { ReactNode } from "react";
import {
  Users,
  UserPlus,
  FileText,
  ClipboardList,
  UserCheck,
  Banknote,
} from "lucide-react";
import type { DashboardData } from "../../services/dashboardService";

export interface StatCard {
  label: string;
  value: string | number;
  change: string;
  color: string;
  bg: string;
  icon: ReactNode;
}

export function buildStatCards(dashboardData: DashboardData | null): StatCard[] {
  const summary = dashboardData?.summary;

  return [
    {
      label: "Total Students",
      value: summary?.totalStudents ?? 0,
      change: "All registered students",
      color: "#3b82f6",
      bg: "#eff6ff",
      icon: <Users size={22} color="#3b82f6" />,
    },
    {
      label: "Students Today",
      value: summary?.studentsToday ?? 0,
      change: "Registered today",
      color: "#10b981",
      bg: "#ecfdf5",
      icon: <UserPlus size={22} color="#10b981" />,
    },
    {
      label: "Pending Documents",
      value: summary?.pendingDocuments ?? 0,
      change: "Needs review",
      color: "#f59e0b",
      bg: "#fffbeb",
      icon: <FileText size={22} color="#f59e0b" />,
    },
    {
      label: "Pending Applications",
      value: summary?.pendingApplications ?? 0,
      change: "Awaiting approval",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      icon: <ClipboardList size={22} color="#8b5cf6" />,
    },
    {
      label: "Enrolled Students",
      value: summary?.enrolledStudents ?? 0,
      change: "Active enrollments",
      color: "#06b6d4",
      bg: "#ecfeff",
      icon: <UserCheck size={22} color="#0891b2" />,
    },
    {
      label: "Paid / Unpaid Students",
      value: `${summary?.paymentStatusBreakdown.paid ?? 0} / ${summary?.paymentStatusBreakdown.unpaid ?? 0}`,
      change: "Paid vs Unpaid count",
      color: "#ec4899",
      bg: "#fce7f3",
      icon: <Banknote size={22} color="#db2777" />,
    },
  ];
}

export interface StatCardsGridProps {
  cards: StatCard[];
  loading: boolean;
}

export default function StatCardsGrid({ cards, loading }: StatCardsGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 14,
        marginBottom: 20,
      }}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              background: card.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {card.icon}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 500, marginBottom: 3 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b", lineHeight: 1.1 }}>
              {loading ? "..." : card.value}
            </div>
            <div style={{ fontSize: 11, color: "#10b981", marginTop: 3 }}>
              {card.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
