import type { StudentItem } from "../../services/dashboardService";

export interface RecentStudentsTableProps {
  students: StudentItem[];
}

export default function RecentStudentsTable({ students }: RecentStudentsTableProps) {
  return (
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

      {students.length === 0 ? (
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
              {students.map((stu) => (
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
  );
}
