export interface RefreshButtonProps {
  onClick: () => void;
}

export default function RefreshButton({ onClick }: RefreshButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        background: "#ffffff",
        border: "1px solid #cbd5e1",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        color: "#334155",
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span>🔄</span> Refresh Data
    </button>
  );
}
