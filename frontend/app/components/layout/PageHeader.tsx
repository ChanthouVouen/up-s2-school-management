import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
      }}
    >
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{title}</div>
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{description}</div>
      </div>

      {action}
    </div>
  );
}
