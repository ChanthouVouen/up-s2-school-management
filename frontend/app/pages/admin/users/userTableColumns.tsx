import { Edit2, Trash2 } from "lucide-react";
import Badge from "~/components/ui/Badge";
import Button from "~/components/ui/Button";
import { type TableColumn } from "~/components/ui/Table";
import type { AppUser } from "~/services/userService";
import { getRoleBadgeStyle } from "~/utils/userUtils";

interface GetUserTableColumnsOptions {
  onEdit: (user: AppUser) => void;
  onDelete: (user: AppUser) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function getUserTableColumns({ onEdit, onDelete, canEdit, canDelete }: GetUserTableColumnsOptions): TableColumn<AppUser>[] {
  return [
    {
      key: "name",
      header: "Name",
      render: (user) => <span style={{ fontWeight: 600, color: "#1e293b" }}>{user.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <span style={{ color: "#64748b" }}>{user.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => {
        const badge = getRoleBadgeStyle(user.role);
        return (
          <Badge bg={badge.bg} color={badge.color}>
            {user.role}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (user) => (
        <div style={{ display: "inline-flex", gap: 6 }}>
          {canEdit && (
            <Button variant="icon" title="Edit User" onClick={() => onEdit(user)} style={{ color: "#d97706" }}>
              <Edit2 size={14} />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="icon"
              title="Delete User"
              onClick={() => onDelete(user)}
              style={{ color: "#dc2626", background: "#fee2e2" }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];
}
