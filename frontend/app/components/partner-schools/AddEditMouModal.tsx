import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField, { fieldInputStyle } from "../ui/FormField";
import {
  Mou,
  MouCreateParams,
  DiscountType,
} from "../../services/partnerSchoolService";

interface AddEditMouModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MouCreateParams) => Promise<void>;
  initialData?: Mou | null;
  partnerSchoolName?: string;
}

export const AddEditMouModal: React.FC<AddEditMouModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  partnerSchoolName,
}) => {
  const [formData, setFormData] = useState<MouCreateParams>({
    mouTitle: "",
    signDate: new Date().toISOString().split("T")[0],
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "ACTIVE",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxEligibleStudents: undefined,
    mouDocumentUrl: "",
    scope: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        mouTitle: initialData.mouTitle || "",
        signDate: initialData.signDate ? new Date(initialData.signDate).toISOString().split("T")[0] : "",
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split("T")[0] : "",
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split("T")[0] : "",
        status: initialData.status || "ACTIVE",
        discountType: initialData.discountType || "PERCENTAGE",
        discountValue: initialData.discountValue || 0,
        maxEligibleStudents: initialData.maxEligibleStudents || undefined,
        mouDocumentUrl: initialData.mouDocumentUrl || "",
        scope: initialData.scope || "",
        notes: initialData.notes || "",
      });
    } else {
      setFormData({
        mouTitle: "",
        signDate: new Date().toISOString().split("T")[0],
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "ACTIVE",
        discountType: "PERCENTAGE",
        discountValue: 0,
        maxEligibleStudents: undefined,
        mouDocumentUrl: "",
        scope: "",
        notes: "",
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mouTitle || !formData.startDate || !formData.endDate) {
      setError("Title, Start Date, and Expiration End Date are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save MOU agreement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit MOU Agreement" : "Add New MOU Agreement"}
      width={560}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}

        {partnerSchoolName && (
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Partner: <strong style={{ color: "#0f172a" }}>{partnerSchoolName}</strong>
          </div>
        )}

        <FormField label="MOU Agreement Title *">
          <input
            type="text"
            required
            placeholder="e.g. Academic Exchange & Scholarship MOU"
            value={formData.mouTitle}
            onChange={(e) => setFormData({ ...formData, mouTitle: e.target.value })}
            style={fieldInputStyle}
          />
        </FormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <FormField label="Signing Date">
            <input
              type="date"
              value={formData.signDate}
              onChange={(e) => setFormData({ ...formData, signDate: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <FormField label="Start Date *">
            <input
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <FormField label="Expiration Date *">
            <input
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Discount Type">
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
              style={fieldInputStyle}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
            </select>
          </FormField>

          <FormField label={`Discount Value (${formData.discountType === "PERCENTAGE" ? "%" : "$"})`}>
            <input
              type="number"
              min="0"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              style={fieldInputStyle}
            />
          </FormField>
        </div>

        <FormField label="Max Quota (Optional)">
          <input
            type="number"
            min="1"
            placeholder="Leave empty for unlimited quota"
            value={formData.maxEligibleStudents || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxEligibleStudents: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            style={fieldInputStyle}
          />
        </FormField>

        <FormField label="Agreement Scope / Purpose">
          <textarea
            rows={2}
            placeholder="Key terms, eligibility criteria, or program scope..."
            value={formData.scope || ""}
            onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
            style={{ ...fieldInputStyle, resize: "vertical" }}
          />
        </FormField>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Agreement" : "Save MOU Agreement"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditMouModal;
