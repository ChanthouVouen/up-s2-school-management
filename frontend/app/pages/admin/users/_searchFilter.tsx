import { Search } from "lucide-react";
import { fieldInputStyle } from "~/components/ui/FormField";
import type { Role } from "~/services/userService";

interface SearchFilterProps {
  search: string;
  roleFilter: string;
  roles: Role[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export default function SearchFilter({
  search,
  roleFilter,
  roles,
  onSearchChange,
  onRoleChange,
}: SearchFilterProps) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "16px 20px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
        <Search
          size={16}
          color="#94a3b8"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ ...fieldInputStyle, padding: "8px 12px 8px 36px" }}
        />
      </div>

      <select
        value={roleFilter}
        onChange={(e) => onRoleChange(e.target.value)}
        style={{ ...fieldInputStyle, width: "auto", padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
      >
        <option value="">All Roles</option>
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
    </div>
  );
}