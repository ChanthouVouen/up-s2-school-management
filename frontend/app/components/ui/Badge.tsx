import type { ReactNode } from "react";

export interface BadgeProps {
  bg: string;
  color: string;
  icon?: ReactNode;
  children: ReactNode;
}

/** Small colored pill used for status/payment/role labels in tables. */
export default function Badge({ bg, color, icon, children }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 9px",
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
