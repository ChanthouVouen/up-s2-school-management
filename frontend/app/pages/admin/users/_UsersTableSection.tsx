import Pagination from "~/components/ui/Pagination";
import Table, { type TableColumn } from "~/components/ui/Table";
import type { AppUser } from "~/services/userService";

interface UsersTableSectionProps {
  users: AppUser[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalUsers: number;
  columns: TableColumn<AppUser>[];
  onPageChange: (page: number) => void;
}

export default function UsersTableSection({
  users,
  loading,
  error,
  page,
  totalPages,
  totalUsers,
  columns,
  onPageChange,
}: UsersTableSectionProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "16px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#1e293b",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>User Directory ({totalUsers})</span>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>
          Showing Page {page} of {totalPages || 1}
        </span>
      </div>

      <Table
        columns={columns}
        data={users}
        rowKey={(user) => user.id}
        loading={loading}
        error={error}
        emptyMessage="No users found matching your search."
      />

      <Pagination page={page} totalPages={totalPages} totalItems={totalUsers} onPageChange={onPageChange} />
    </div>
  );
}
