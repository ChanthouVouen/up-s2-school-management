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
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid #f1f5f9",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b" }}>
        Showing page {page} of {totalPages || 1} ({totalItems} total records)
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          style={{ padding: "6px 12px", fontWeight: 400 }}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ padding: "6px 12px", fontWeight: 400 }}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
