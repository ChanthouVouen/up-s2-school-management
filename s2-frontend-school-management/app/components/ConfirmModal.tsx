import React from "react";
import { AlertTriangle, Info, CheckCircle, HelpCircle, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconBg: "#fee2e2",
          iconColor: "#dc2626",
          btnBg: "#dc2626",
          btnShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.25)",
          icon: <AlertTriangle size={26} />,
        };
      case "warning":
        return {
          iconBg: "#fef3c7",
          iconColor: "#d97706",
          btnBg: "#d97706",
          btnShadow: "0 4px 6px -1px rgba(217, 119, 6, 0.25)",
          icon: <AlertTriangle size={26} />,
        };
      case "success":
        return {
          iconBg: "#dcfce7",
          iconColor: "#16a34a",
          btnBg: "#16a34a",
          btnShadow: "0 4px 6px -1px rgba(22, 163, 74, 0.25)",
          icon: <CheckCircle size={26} />,
        };
      case "info":
      default:
        return {
          iconBg: "#dbeafe",
          iconColor: "#2563eb",
          btnBg: "#2563eb",
          btnShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.25)",
          icon: <Info size={26} />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 14,
          width: 440,
          maxWidth: "92%",
          padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#94a3b8",
          }}
        >
          <X size={18} />
        </button>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: styles.iconBg,
            color: styles.iconColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px auto",
          }}
        >
          {styles.icon}
        </div>

        <h3 style={{ margin: "0 0 8px 0", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{title}</h3>

        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, margin: "0 0 20px 0" }}>{message}</div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#475569",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px 16px",
              background: styles.btnBg,
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: styles.btnShadow,
            }}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
