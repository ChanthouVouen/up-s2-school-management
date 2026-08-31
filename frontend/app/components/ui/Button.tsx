import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    boxShadow: "0 2px 4px rgba(59,130,246,0.25)",
    padding: "8px 16px",
    borderRadius: 8,
  },
  secondary: {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "8px 16px",
    borderRadius: 8,
  },
  danger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 6px -1px rgba(220,38,38,0.25)",
    padding: "8px 16px",
    borderRadius: 8,
  },
  icon: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    padding: 6,
    borderRadius: 6,
  },
};

/** Shared button used across admin pages — pass `style` to override per-instance colors (e.g. icon tint). */
export default function Button({ variant = "secondary", icon, children, disabled, style, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
