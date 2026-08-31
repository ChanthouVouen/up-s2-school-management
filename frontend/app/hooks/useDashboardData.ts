import { useCallback, useEffect, useState } from "react";
import {
  fetchDashboardStats,
  DashboardData,
} from "../services/dashboardService";

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
      setError("Failed to connect to backend server or load database statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { dashboardData, loading, error, reload };
}
