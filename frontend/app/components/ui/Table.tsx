import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

/** Generic data table: pass column definitions + rows, get consistent styling and loading/error/empty states. */
export default function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
}: TableProps<T>) {
  if (loading) {
    return <StatusMessage color="#64748b">Loading records...</StatusMessage>;
  }

  if (error) {
    return <StatusMessage color="#ef4444">{error}</StatusMessage>;
  }

  if (data.length === 0) {
    return <StatusMessage color="#94a3b8">{emptyMessage}</StatusMessage>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: "14px 18px",
                  color: "#475569",
                  fontSize: 11,
                  textTransform: "uppercase",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  textAlign: column.align ?? "left",
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{ padding: "14px 18px", textAlign: column.align ?? "left", verticalAlign: "middle" }}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusMessage({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div style={{ padding: "48px", textAlign: "center", color, fontSize: 13 }}>{children}</div>
  );
}
