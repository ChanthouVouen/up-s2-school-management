import { useState } from "react";
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
// import TeacherPage from "../teachers/TeacherPage";
// import Department from "../departments/DepartmentPage";
// import DepartmentPage from "../departments/DepartmentPage";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
//navigation
const NAV_ITEMS = [
  { icon: "🏠", label: "Dashboard" },
  { icon: "🏢", label: "Departments" },
  { icon: "👨‍🏫", label: "Teachers" },
  { icon: "👨‍🎓", label: "Students" },
  { icon: "📚", label: "Subjects" },
  { icon: "🏫", label: "Classes" },
  { icon: "📝", label: "Enrollments" },
  { icon: "📋", label: "Attendance" },
  { icon: "📊", label: "Reports" },
  { icon: "👥", label: "User Management" },
  { icon: "⚙️", label: "Settings" },
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

  const handleNavigation = (label: string) => {
    setActiveNav(label);

    // Later you can replace this with React Router navigation
    console.log(`Navigate to: ${label}`);
  };
  const handleLogout = () => {
    console.log("User logged out");
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
      {/* sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        activeNav={activeNav}
        handleNavigation={handleNavigation}
        navItems={NAV_ITEMS}
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
          notificationCount={3}
          onNotificationClick={() => console.log("Open Notifications")}
          onProfileClick={() => console.log("Open Profile Menu")}
        />


        {/* body */}
        <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          
          <>
            {/* Page Header */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>
                Dashboard
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                Welcome back, Admin! Here's what's happening in your school.
              </div>
            </div>

            {/* STAT CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {STAT_CARDS.map((card) => (
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
                      fontSize: 21,
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
                      {card.value}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: card.changeType === "up" ? "#10b981" : "#94a3b8",
                        marginTop: 3,
                      }}
                    >
                      {card.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* QUICK ACTIONS */}
            <div
              style={{
                background: "#fff",
                borderRadius: 10,
                padding: "16px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: 14,
                }}
              >
                Quick Actions
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => console.log(action.title)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: `${action.color}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {action.icon}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      {action.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* chart and notices */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 300px",
                gap: 14,
                marginBottom: 20,
              }}
            >
              {/* student and teacher chart */}
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
                  Students & Teachers Overview
                </div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={BAR_DATA}>
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
                      dataKey="Teachers"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance Chart */}
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
                  Attendance Summary
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <PieChart width={180} height={190}>
                      <Pie
                        data={ATTENDANCE_DATA}
                        cx={85}
                        cy={90}
                        innerRadius={55}
                        outerRadius={75}
                        dataKey="value"
                        strokeWidth={2}
                      >
                        {ATTENDANCE_DATA.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 700,
                          color: "#1e293b",
                        }}
                      >
                        84%
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        Attendance
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      flex: 1,
                    }}
                  >
                    {ATTENDANCE_DATA.map((item) => (
                      <div
                        key={item.name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: item.color,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#334155",
                            }}
                          >
                            {item.name}
                          </div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {item.pct} ({item.value})
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notices */}
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
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  <span style={{ fontSize: 16 }}>📢</span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    Important Notices
                  </span>
                </div>
                {NOTICES.map((notice, index) => (
                  <div
                    key={index}
                    style={{
                      borderBottom:
                        index < NOTICES.length - 1
                          ? "1px solid #f1f5f9"
                          : "none",
                      paddingBottom: index < NOTICES.length - 1 ? 12 : 0,
                      marginBottom: index < NOTICES.length - 1 ? 12 : 0,
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
                      {notice.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginBottom: 4,
                      }}
                    >
                      {notice.desc}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      {notice.date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        </main>
      </div>
    </div>
  );
}
