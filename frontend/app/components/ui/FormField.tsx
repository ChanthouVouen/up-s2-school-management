import type { CSSProperties, ReactNode } from "react";

export const fieldInputStyle: CSSProperties = {
  width: "100%",
  padding: 8,
  border: "1px solid #cbd5e1",
  borderRadius: 6,
  fontSize: 13,
  color: "#0f172a",
  background: "#ffffff",
};

export interface FormFieldProps {
  label: ReactNode;
  children: ReactNode;
}

/** Label + control wrapper for modal forms. Give the input/select `style={fieldInputStyle}` to match. */
export default function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
