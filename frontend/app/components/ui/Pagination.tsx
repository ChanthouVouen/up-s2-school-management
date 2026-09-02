import Button from "./Button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalItems, onPageChange }: PaginationProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderTop: "1px solid #e2e8f0",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>
        Showing page <strong style={{ color: "#0f172a" }}>{page}</strong> of{" "}
        <strong style={{ color: "#0f172a" }}>{totalPages || 1}</strong> ({totalItems} total records)
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          style={{ padding: "6px 14px", fontSize: 12 }}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ padding: "6px 14px", fontSize: 12 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
