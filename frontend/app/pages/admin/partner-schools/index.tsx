import { useRef } from "react";
import { Plus } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import PartnerSchoolManagement from "../../../components/partner-schools/PartnerSchoolManagement";
import Button from "../../../components/ui/Button";
import { useAuth } from "../../../auth/AuthContext";
import { PERMISSIONS } from "../../../types/permissions";

export default function PartnerSchoolsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.PARTNER_SCHOOL_CREATE);
  const openAddRef = useRef<(() => void) | null>(null);

  const handleOpenAdd = () => {
    if (openAddRef.current) {
      openAddRef.current();
    }
  };

  return (
    <AdminLayout
      headerAction={
        canCreate ? (
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Add Partner
          </Button>
        ) : undefined
      }
    >
      <PartnerSchoolManagement
        onRegisterAddHandler={(handler) => {
          openAddRef.current = handler;
        }}
      />
    </AdminLayout>
  );
}
