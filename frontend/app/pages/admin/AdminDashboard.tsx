import AdminLayout from "../../layouts/AdminLayout";
import RefreshButton from "../../components/layout/RefreshButton";
import StatCardsGrid, { buildStatCards } from "../../components/dashboard/StatCardsGrid";
import EnrollmentBarChart from "../../components/dashboard/EnrollmentBarChart";
import RecentStudentsTable from "../../components/dashboard/RecentStudentsTable";
import PaymentPieChart from "../../components/dashboard/PaymentPieChart";
import RecentActivitiesList from "../../components/dashboard/RecentActivitiesList";
import { useDashboardData } from "../../hooks/useDashboardData";

export default function AdminDashboard() {
  const { dashboardData, loading, reload } = useDashboardData();

  const paymentBreakdown = dashboardData?.summary.paymentStatusBreakdown;

  return (
    <AdminLayout
      notificationCount={dashboardData?.summary.pendingApplications ?? 0}
      headerAction={<RefreshButton onClick={reload} />}
    >
      <StatCardsGrid cards={buildStatCards(dashboardData)} loading={loading} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <EnrollmentBarChart chartData={dashboardData?.chartData || []} />
          <RecentStudentsTable students={dashboardData?.recentStudents || []} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <PaymentPieChart
            paid={paymentBreakdown?.paid ?? 0}
            unpaid={paymentBreakdown?.unpaid ?? 0}
          />
          <RecentActivitiesList activities={dashboardData?.recentActivities || []} />
        </div>
      </div>
    </AdminLayout>
  );
}
