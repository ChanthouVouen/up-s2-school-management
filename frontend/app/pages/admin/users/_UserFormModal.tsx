import type { FormEvent } from "react";
import Button from "~/components/ui/Button";
import FormField, { fieldInputStyle } from "~/components/ui/FormField";
import Modal from "~/components/ui/Modal";
import type { AppUser, Role } from "~/services/userService";

export type UserFormData = {
  name: string;
  email: string;
  password: string;
  roleId: string;
};

interface UserFormModalProps {
  isOpen: boolean;
  editingUser: AppUser | null;
  roles: Role[];
  formData: UserFormData;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormDataChange: (next: UserFormData) => void;
}

export default function UserFormModal({
  isOpen,
  editingUser,
  roles,
  formData,
  submitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: UserFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? `Edit User (${editingUser.name})` : "Add New User"}
    >
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FormField label="Full Name *">
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            style={fieldInputStyle}
          />
        </FormField>

        <FormField label="Email *">
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
            style={fieldInputStyle}
          />
        </FormField>

        <FormField label={editingUser ? "New Password (leave blank to keep unchanged)" : "Password *"}>
          <input
            type="password"
            required={!editingUser}
            minLength={8}
            placeholder="At least 8 characters"
            value={formData.password}
            onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
            style={fieldInputStyle}
          />
        </FormField>

        <FormField label="Role *">
          <select
            required
            value={formData.roleId}
            onChange={(e) => onFormDataChange({ ...formData, roleId: e.target.value })}
            style={fieldInputStyle}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </FormField>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : editingUser ? "Update User" : "Save User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
