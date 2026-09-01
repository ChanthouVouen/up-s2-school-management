import api from "./api";

export enum ActivityType {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  DOCUMENT = "DOCUMENT",
  APPLICATION = "APPLICATION",
  PAYMENT = "PAYMENT",
  USER = "USER",
  ROLE = "ROLE",
  SYSTEM = "SYSTEM",
}

export interface ActivityLog {
  id: number;
  title: string;
  description: string;
  type: ActivityType | null;
  createdAt: string;
}

export interface ActivityLogQueryParams {
  search?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogListResponse {
  data: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActivityLogStats {
  total: number;
  totalToday: number;
  byType: Record<string, number>;
}

export const fetchActivityLogs = async (params?: ActivityLogQueryParams): Promise<ActivityLogListResponse> => {
  const response = await api.get("/activity-logs", { params });
  return response.data;
};

export const fetchActivityLogStats = async (): Promise<ActivityLogStats> => {
  const response = await api.get("/activity-logs/stats");
  return response.data;
};
