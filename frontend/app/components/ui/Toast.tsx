import { CheckCircle, AlertTriangle } from "lucide-react";

export interface ToastData {
  type: "success" | "error";
  message: string;
}

export default function Toast({ type, message }: ToastData) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 24,
        zIndex: 10000,
        background: type === "success" ? "#10b981" : "#ef4444",
        color: "#ffffff",
        padding: "12px 18px",
        borderRadius: 8,
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
      <span>{message}</span>
    </div>
  );
}
