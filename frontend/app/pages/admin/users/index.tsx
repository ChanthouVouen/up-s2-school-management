import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "~/layouts/AdminLayout";
import Button from "~/components/ui/Button";
import Toast from "~/components/ui/Toast";
import { useToast } from "~/hooks/useToast";
import { useDebouncedValue } from "~/hooks/useDebouncedValue";
import { useAuth } from "~/auth/AuthContext";
import { PERMISSIONS } from "~/types/permissions";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  fetchRoles,
  AppUser,
  Role,
} from "~/services/userService";
import SearchFilter from "./_searchFilter";
import UserFormModal, { type UserFormData } from "./_UserFormModal";
import DeleteUserModal from "./_DeleteUserModal";
import UsersTableSection from "./_UsersTableSection";
import { getUserTableColumns } from "./userTableColumns";

const EMPTY_FORM: UserFormData = { name: "", email: "", password: "", roleId: "" };

export default function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput);
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  const { toast, showToast } = useToast();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.USER_CREATE);
  const canEdit = hasPermission(PERMISSIONS.USER_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USER_DELETE);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchUsers({ search, roleId: roleFilter, page, limit: 5 });
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalUsers(res.pagination.total);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError("Failed to fetch users from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch((err) => console.error("Failed to load roles:", err));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ ...EMPTY_FORM, roleId: roles[0]?.id ?? "" });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (user: AppUser) => {
    const role = roles.find((r) => r.name === user.role);
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: "", roleId: role?.id ?? "" });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.roleId) return;

    try {
      setSubmitting(true);
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
          ...(formData.password ? { password: formData.password } : {}),
        });
        showToast("success", `User "${formData.name}" updated successfully.`);
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId,
        });
        showToast("success", `User "${formData.name}" added successfully.`);
      }
      setIsFormModalOpen(false);
      loadUsers();
    } catch (err: any) {
      showToast("error", "Failed to save user: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (user: AppUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      setSubmitting(true);
      await deleteUser(userToDelete.id);
      showToast("success", `User "${userToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      showToast("error", "Failed to delete user: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = getUserTableColumns({
    onEdit: handleOpenEdit,
    onDelete: promptDelete,
    canEdit,
    canDelete,
  });

  return (
    <AdminLayout
      headerAction={
        canCreate ? (
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd} disabled={roles.length === 0}>
            Add User
          </Button>
        ) : undefined
      }
    >
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* TOOLBAR: SEARCH & FILTERS */}
        <SearchFilter
          search={searchInput}
          roleFilter={roleFilter}
          roles={roles}
          onSearchChange={setSearchInput}
          onRoleChange={setRoleFilter}
        />

        {/* USERS TABLE */}
        <UsersTableSection
          users={users}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          totalUsers={totalUsers}
          columns={columns}
          onPageChange={setPage}
        />
      </div>

      <DeleteUserModal
        isOpen={isDeleteModalOpen}
        userToDelete={userToDelete}
        submitting={submitting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
      />

      <UserFormModal
        isOpen={isFormModalOpen}
        editingUser={editingUser}
        roles={roles}
        formData={formData}
        submitting={submitting}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </AdminLayout>
  );
}
