import ConfirmModal from "~/components/users/ConfirmModal";
import type { AppUser } from "~/services/userService";

interface DeleteUserModalProps {
  isOpen: boolean;
  userToDelete: AppUser | null;
  submitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  isOpen,
  userToDelete,
  submitting,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete User?"
      message={
        <>
          Are you sure you want to delete <strong>"{userToDelete?.name}"</strong>? This action is permanent and
          cannot be undone.
        </>
      }
      confirmText="Yes, Delete User"
      cancelText="Cancel"
      variant="danger"
      loading={submitting}
    />
  );
}
