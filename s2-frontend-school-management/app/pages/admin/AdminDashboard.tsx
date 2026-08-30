import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutGrid,
  Users,
  ClipboardList,
  FileText,
  GraduationCap,
  Banknote,
  CreditCard,
  IdCard,
  UserCog,
  ShieldCheck,
  BarChart3,
  History,
  Settings,
  UserCheck,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import StudentManagement from "../../components/StudentManagement";
import {
  fetchDashboardStats,
  DashboardData,
} from "../../services/dashboardService";

// navigation items organized by categories for a clean sidebar structure
const NAV_CATEGORIES = [
  {
    items: [{ icon: <LayoutGrid size={18} />, label: "Dashboard" }],
  },
  {
    title: "Academics & Admission",
    items: [
      { icon: <Users size={18} />, label: "Students" },
      { icon: <ClipboardList size={18} />, label: "Applications" },
      { icon: <FileText size={18} />, label: "Documents" },
      { icon: <GraduationCap size={18} />, label: "Partner Schools" },
    ],
  },
  {
    title: "Finance & Services",
    items: [
      { icon: <Banknote size={18} />, label: "Scholarships" },
      { icon: <CreditCard size={18} />, label: "Payments" },
      { icon: <IdCard size={18} />, label: "ID Cards" },
    ],
  },
  {
    title: "Access & Security",
    items: [
      { icon: <UserCog size={18} />, label: "User Management" },
      { icon: <ShieldCheck size={18} />, label: "Roles & Permissions" },
    ],
  },
  {
    title: "System & Reports",
    items: [
      { icon: <BarChart3 size={18} />, label: "Reports" },
      { icon: <History size={18} />, label: "Activity Logs" },
      { icon: <Settings size={18} />, label: "Settings" },
    ],
  },
];

//static
const STAT_CARDS = [
  {
    label: "Total Students",
    value: "1,248",
    change: "↑ 5.4% from last year",
    changeType: "up",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: "👨‍🎓",
  },
  {
    label: "Total Teachers",
    value: "86",
    change: "↑ 8 new this year",
    changeType: "up",
    color: "#10b981",
    bg: "#ecfdf5",
    icon: "👨‍🏫",
  },
  {
    label: "Total Subjects",
    value: "42",
    change: "↑ 4 new subjects",
    changeType: "up",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: "📚",
  },
  {
    label: "Departments",
    value: "8",
    change: "— No change",
    changeType: "neutral",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: "🏢",
  },
];

//bar chart
const BAR_DATA = [
  {
    name: "Jan",
    Students: 1050,
    Teachers: 70,
  },
  {
    name: "Feb",
    Students: 1100,
    Teachers: 74,
  },
  {
    name: "Mar",
    Students: 1140,
    Teachers: 77,
  },
  {
    name: "Apr",
    Students: 1180,
    Teachers: 81,
  },
  {
    name: "May",
    Students: 1248,
    Teachers: 86,
  },
];
//attendance data
const ATTENDANCE_DATA = [
  {
    name: "Present",
    value: 1050,
    pct: "84%",
    color: "#10b981",
  },
  {
    name: "Late",
    value: 100,
    pct: "8%",
    color: "#f59e0b",
  },
  {
    name: "Absent",
    value: 98,
    pct: "8%",
    color: "#ef4444",
  },
];

//recent activity
const RECENT_ACTIVITIES = [
  {
    title: "New student registered",
    description: "Student S-1024 was added to the system.",
    date: "Today, 09:30 AM",
    icon: "👨‍🎓",
    color: "#3b82f6",
  },
  {
    title: "Teacher added",
    description: "Mr. Sok Dara was added as a teacher.",
    date: "Today, 09:10 AM",
    icon: "👨‍🏫",
    color: "#10b981",
  },
  {
    title: "New subject created",
    description: "Database Management was added.",
    date: "Yesterday, 04:30 PM",
    icon: "📚",
    color: "#f59e0b",
  },
  {
    title: "Department updated",
    description: "Computer Science department was updated.",
    date: "Yesterday, 02:15 PM",
    icon: "🏢",
    color: "#8b5cf6",
  },
];

//upcoming events
const UPCOMING_EVENTS = [
  {
    day: "20",
    month: "AUG",
    title: "Teacher Meeting",
    description: "Monthly teacher meeting",
    time: "09:00 AM",
  },
  {
    day: "22",
    month: "AUG",
    title: "Student Enrollment",
    description: "Enrollment deadline",
    time: "04:00 PM",
  },
  {
    day: "25",
    month: "AUG",
    title: "Attendance Review",
    description: "Monthly attendance review",
    time: "10:00 AM",
  },
];

//notices
const NOTICES = [
  {
    title: "Enrollment Deadline",
    desc: "Student enrollment for the new semester is ending soon.",
    date: "20 Aug 2026",
    badge: "Important",
    color: "#ef4444",
  },
  {
    title: "Teacher Meeting",
    desc: "Monthly teacher meeting will be held this week.",
    date: "22 Aug 2026",
    color: "#3b82f6",
  },
  {
    title: "Attendance Report",
    desc: "Monthly attendance reports are now available.",
    date: "25 Aug 2026",
    color: "#10b981",
  },
];

//quick action
const QUICK_ACTIONS = [
  {
    title: "Add Student",
    icon: "👨‍🎓",
    color: "#3b82f6",
  },
  {
    title: "Add Teacher",
    icon: "👨‍🏫",
    color: "#10b981",
  },
  {
    title: "Add Subject",
    icon: "📚",
    color: "#f59e0b",
  },
  {
    title: "Add Department",
    icon: "🏢",
    color: "#8b5cf6",
  },
];

//dashboard component
export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setDashboardData(data);
    } catch (err: any) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to connect to backend server or load database statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleNavigation = (label: string) => {
    setActiveNav(label);
  };

  const handleLogout = () => {
    console.log("User logged out");
  };

  // Dynamic stat cards constructed from database response
  const dynamicStatCards = [
    {
      label: "Total Students",
      value: dashboardData?.summary.totalStudents ?? 0,
      change: "All registered students",
      color: "#3b82f6",
      bg: "#eff6ff",
      icon: <Users size={22} color="#3b82f6" />,
    },
    {
      label: "Students Today",
      value: dashboardData?.summary.studentsToday ?? 0,
      change: "Registered today",
      color: "#10b981",
      bg: "#ecfdf5",
      icon: <UserPlus size={22} color="#10b981" />,
    },
    {
      label: "Pending Documents",
      value: dashboardData?.summary.pendingDocuments ?? 0,
      change: "Needs review",
      color: "#f59e0b",
      bg: "#fffbeb",
      icon: <FileText size={22} color="#f59e0b" />,
    },
    {
      label: "Pending Applications",
      value: dashboardData?.summary.pendingApplications ?? 0,
      change: "Awaiting approval",
      color: "#8b5cf6",
      bg: "#f5f3ff",
      icon: <ClipboardList size={22} color="#8b5cf6" />,
    },
    {
      label: "Enrolled Students",
      value: dashboardData?.summary.enrolledStudents ?? 0,
      change: "Active enrollments",
      color: "#06b6d4",
      bg: "#ecfeff",
      icon: <UserCheck size={22} color="#0891b2" />,
    },
    {
      label: "Paid / Unpaid Students",
      value: `${dashboardData?.summary.paymentStatusBreakdown.paid ?? 0} / ${dashboardData?.summary.paymentStatusBreakdown.unpaid ?? 0}`,
      change: "Paid vs Unpaid count",
      color: "#ec4899",
      bg: "#fce7f3",
      icon: <Banknote size={22} color="#db2777" />,
    },
  ];

  const paymentBreakdownData = [
    {
      name: "Paid",
      value: dashboardData?.summary.paymentStatusBreakdown.paid ?? 0,
      color: "#10b981",
    },
    {
      name: "Unpaid",
      value: dashboardData?.summary.paymentStatusBreakdown.unpaid ?? 0,
      color: "#ef4444",
    },
  ];

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
      {/* sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeNav={activeNav}
        handleNavigation={handleNavigation}
        navCategories={NAV_CATEGORIES}
        onLogout={handleLogout}
      />

      {/* main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Header
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
          notificationCount={dashboardData?.summary.pendingApplications ?? 0}
          onNotificationClick={() => console.log("Open Notifications")}
          onProfileClick={() => console.log("Open Profile Menu")}
        />

        {/* body */}
        <main className="custom-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <>
            {/* Page Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                  {activeNav}
                </div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                  {activeNav === "Dashboard"
                    ? "Welcome back, Admin! Here's real-time dynamic data from your school database."
                    : activeNav === "Students"
                      ? "Manage student profiles, enrollments, and academic records."
                      : activeNav === "Applications"
                        ? "Review and process new student admission applications."
                        : activeNav === "Documents"
                          ? "Upload, view, and manage school documents and records."
                          : activeNav === "Partner Schools"
                            ? "Manage affiliated partner schools and educational institutions."
                            : activeNav === "Scholarships"
                              ? "Track scholarship programs, eligibility, and awarded students."
                              : activeNav === "Payments"
                                ? "View tuition fee payments, invoices, and financial transactions."
                                : activeNav === "ID Cards"
                                  ? "Generate, issue, and manage student and staff ID cards."
                                  : activeNav === "User Management"
                                    ? "Manage user accounts, admin staff, teachers, and system access."
                                    : activeNav === "Roles & Permissions"
                                      ? "Configure user roles, system permissions, and security access controls."
                                      : activeNav === "Reports"
                                        ? "Generate administrative analytics and performance reports."
                                        : activeNav === "Activity Logs"
                                          ? "Monitor system activity, audit trails, and user logs."
                                          : activeNav === "Settings"
                                            ? "Configure system preferences and portal settings."
                                            : `Overview and management portal for ${activeNav.toLowerCase()}.`}
                </div>
              </div>

              {activeNav === "Dashboard" && (
                <button
                  type="button"
                  onClick={loadDashboardData}
                  style={{
                    padding: "8px 14px",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#334155",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>🔄</span> Refresh Data
                </button>
              )}
            </div>

            {activeNav === "Students" && <StudentManagement />}

            {/* Render full dashboard widgets only on Dashboard tab */}
            {activeNav === "Dashboard" && (
              <>
                {/* DYNAMIC STAT CARDS GRID */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  {dynamicStatCards.map((card) => (
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
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            fontWeight: 500,
                            marginBottom: 3,
                          }}
                        >
                          {card.label}
                        </div>
                        <div
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#1e293b",
                            lineHeight: 1.1,
                          }}
                        >
                          {loading ? "..." : card.value}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#10b981",
                            marginTop: 3,
                          }}
                        >
                          {card.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CHARTS AND RECENT ACTIVITY GRID */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 340px",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  {/* Left Column: Bar Chart & Recent Students Table */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* BAR CHART */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "16px 18px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 12,
                        }}
                      >
                        Daily Enrollment Trends (Last 7 Days)
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={dashboardData?.chartData || []}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "#94a3b8" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              fontSize: 12,
                              borderRadius: 8,
                              border: "none",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: 12 }}
                          />
                          <Bar
                            dataKey="Students"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="Applications"
                            fill="#8b5cf6"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* RECENT STUDENTS TABLE */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "16px 18px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Recent Students</span>
                        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>
                          Live Database Records
                        </span>
                      </div>

                      {(!dashboardData?.recentStudents || dashboardData.recentStudents.length === 0) ? (
                        <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                          No student records available in database.
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr style={{ borderBottom: "1px solid #f1f5f9", textAlign: "left" }}>
                                <th style={{ padding: "8px 10px", color: "#64748b", fontWeight: 600 }}>Code</th>
                                <th style={{ padding: "8px 10px", color: "#64748b", fontWeight: 600 }}>Name</th>
                                <th style={{ padding: "8px 10px", color: "#64748b", fontWeight: 600 }}>Department</th>
                                <th style={{ padding: "8px 10px", color: "#64748b", fontWeight: 600 }}>Status</th>
                                <th style={{ padding: "8px 10px", color: "#64748b", fontWeight: 600 }}>Payment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dashboardData.recentStudents.map((stu) => (
                                <tr key={stu.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                  <td style={{ padding: "10px", fontWeight: 600, color: "#3b82f6" }}>
                                    {stu.studentCode}
                                  </td>
                                  <td style={{ padding: "10px", color: "#1e293b", fontWeight: 500 }}>
                                    {stu.name}
                                  </td>
                                  <td style={{ padding: "10px", color: "#64748b" }}>
                                    {stu.department || "General"}
                                  </td>
                                  <td style={{ padding: "10px" }}>
                                    <span
                                      style={{
                                        padding: "3px 8px",
                                        borderRadius: 12,
                                        fontSize: 10,
                                        fontWeight: 600,
                                        background: stu.status === "ENROLLED" ? "#dcfce7" : "#fef3c7",
                                        color: stu.status === "ENROLLED" ? "#15803d" : "#b45309",
                                      }}
                                    >
                                      {stu.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: "10px" }}>
                                    <span
                                      style={{
                                        padding: "3px 8px",
                                        borderRadius: 12,
                                        fontSize: 10,
                                        fontWeight: 600,
                                        background: stu.paymentStatus === "PAID" ? "#e0e7ff" : "#fee2e2",
                                        color: stu.paymentStatus === "PAID" ? "#4338ca" : "#dc2626",
                                      }}
                                    >
                                      {stu.paymentStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Payment Pie & Recent Activities */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* PAID / UNPAID PIE CHART */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "16px 18px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 8,
                        }}
                      >
                        Paid vs Unpaid Students
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PieChart width={200} height={180}>
                          <Pie
                            data={paymentBreakdownData}
                            cx={100}
                            cy={85}
                            innerRadius={50}
                            outerRadius={70}
                            dataKey="value"
                            strokeWidth={2}
                          >
                            {paymentBreakdownData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-around",
                          marginTop: 4,
                          fontSize: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                          <span style={{ color: "#334155", fontWeight: 600 }}>
                            Paid ({dashboardData?.summary.paymentStatusBreakdown.paid ?? 0})
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                          <span style={{ color: "#334155", fontWeight: 600 }}>
                            Unpaid ({dashboardData?.summary.paymentStatusBreakdown.unpaid ?? 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* RECENT ACTIVITIES */}
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 10,
                        padding: "16px 18px",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          marginBottom: 14,
                        }}
                      >
                        <Clock size={16} color="#3b82f6" />
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1e293b",
                          }}
                        >
                          Recent Activities
                        </span>
                      </div>

                      {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) ? (
                        <div style={{ padding: "16px 0", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                          No recent system activities.
                        </div>
                      ) : (
                        dashboardData.recentActivities.map((act, index) => (
                          <div
                            key={act.id || index}
                            style={{
                              borderBottom:
                                index < dashboardData.recentActivities.length - 1
                                  ? "1px solid #f1f5f9"
                                  : "none",
                              paddingBottom: 10,
                              marginBottom: 10,
                            }}
                          >
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: 2,
                              }}
                            >
                              {act.title}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                marginBottom: 4,
                              }}
                            >
                              {act.description}
                            </div>
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>
                              {new Date(act.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        </main>
      </div>
    </div>
  );
}

