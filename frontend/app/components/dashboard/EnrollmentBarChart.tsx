import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataItem } from "../../services/dashboardService";

export interface EnrollmentBarChartProps {
  chartData: ChartDataItem[];
}

export default function EnrollmentBarChart({ chartData }: EnrollmentBarChartProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>
        Daily Enrollment Trends (Last 7 Days)
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
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
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Students" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Applications" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
