import api from "./api";

export interface DashboardSummary {
  totalStudents: number;
  studentsToday: number;
  pendingDocuments: number;
  pendingApplications: number;
  enrolledStudents: number;
  paymentStatusBreakdown: {
    paid: number;
    unpaid: number;
  };
}

export interface ChartDataItem {
  name: string;
  Students: number;
  Applications: number;
}

export interface StudentItem {
  id: number;
  studentCode: string;
  name: string;
  email?: string;
  status: string;
  paymentStatus: string;
  department?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: number;
  title: string;
  description: string;
  type?: string;
  createdAt: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  chartData: ChartDataItem[];
  recentStudents: StudentItem[];
  recentActivities: ActivityItem[];
}

export const fetchDashboardStats = async (): Promise<DashboardData> => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    // Fallback to /api/dashboard/stats if direct endpoint varies
    const fallbackResponse = await api.get("/api/dashboard/stats");
    return fallbackResponse.data;
  }
};
