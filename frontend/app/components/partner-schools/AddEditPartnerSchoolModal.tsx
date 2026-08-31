import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import FormField, { fieldInputStyle } from "../ui/FormField";
import {
  PartnerSchool,
  CreatePartnerSchoolParams,
  UpdatePartnerSchoolParams,
  PartnerType,
} from "../../services/partnerSchoolService";

interface AddEditPartnerSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePartnerSchoolParams | UpdatePartnerSchoolParams) => Promise<void>;
  initialData?: PartnerSchool | null;
}

export const AddEditPartnerSchoolModal: React.FC<AddEditPartnerSchoolModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreatePartnerSchoolParams>({
    name: "",
    type: "HIGH_SCHOOL",
    address: "",
    website: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    status: "ACTIVE",
    notes: "",
    initialMou: {
      mouTitle: "Academic MOU & Scholarship Agreement",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      discountType: "PERCENTAGE",
      discountValue: 20,
    },
  });

  const [includeInitialMou, setIncludeInitialMou] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        type: initialData.type || "HIGH_SCHOOL",
        address: initialData.address || "",
        website: initialData.website || "",
        contactPerson: initialData.contactPerson || "",
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "",
        status: initialData.status || "ACTIVE",
        notes: initialData.notes || "",
      });
      setIncludeInitialMou(false);
    } else {
      setFormData({
        name: "",
        type: "HIGH_SCHOOL",
        address: "",
        website: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        status: "ACTIVE",
        notes: "",
        initialMou: {
          mouTitle: "Academic MOU & Scholarship Agreement",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          discountType: "PERCENTAGE",
          discountValue: 20,
        },
      });
      setIncludeInitialMou(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError("Institution / Company Name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = { ...formData };
      if (!includeInitialMou && !initialData) {
        delete payload.initialMou;
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save partner institution.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Partner Institution" : "Add Partner School / Company"}
      width={640}
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Institution / Company Name *">
            <input
              type="text"
              required
              placeholder="e.g. Preah Sisowath High School or ABA Bank"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <FormField label="Partner Type *">
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PartnerType })}
              style={fieldInputStyle}
            >
              <option value="HIGH_SCHOOL">High School</option>
              <option value="UNIVERSITY">University / College</option>
              <option value="COMPANY">Corporate Company</option>
              <option value="ORGANIZATION">NGO / Organization</option>
            </select>
          </FormField>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Address Location">
            <input
              type="text"
              placeholder="e.g. Street 184, Khan Daun Penh, Phnom Penh"
              value={formData.address || ""}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <FormField label="Website URL">
            <input
              type="text"
              placeholder="https://..."
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>
        </div>

        {/* Contact Information Box */}
        <div
          style={{
            background: "#f8fafc",
            borderRadius: 10,
            padding: 14,
            border: "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
            Primary Contact Person
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <FormField label="Name">
              <input
                type="text"
                placeholder="Mr. Sok Chea"
                value={formData.contactPerson || ""}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                style={{ ...fieldInputStyle, background: "#fff" }}
              />
            </FormField>

            <FormField label="Email">
              <input
                type="email"
                placeholder="contact@school.edu.kh"
                value={formData.contactEmail || ""}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                style={{ ...fieldInputStyle, background: "#fff" }}
              />
            </FormField>

            <FormField label="Phone">
              <input
                type="text"
                placeholder="+855 12 345 678"
                value={formData.contactPhone || ""}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                style={{ ...fieldInputStyle, background: "#fff" }}
              />
            </FormField>
          </div>
        </div>



        <FormField label="Notes & Remarks">
          <textarea
            rows={2}
            placeholder="Additional partnership details, remarks, or historical notes..."
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={{ ...fieldInputStyle, resize: "vertical" }}
          />
        </FormField>

        {/* Initial MOU Shortcut */}
        {!initialData && (
          <div
            style={{
              background: "#eff6ff",
              borderRadius: 10,
              padding: 14,
              border: "1px solid #bfdbfe",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "#1e40af", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={includeInitialMou}
                onChange={(e) => setIncludeInitialMou(e.target.checked)}
                style={{ accentColor: "#2563eb" }}
              />
              <span>Include Initial MOU Agreement & Scholarship Terms</span>
            </label>

            {includeInitialMou && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 6, borderTop: "1px solid #dbeafe" }}>
                <FormField label="MOU Title">
                  <input
                    type="text"
                    value={formData.initialMou?.mouTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialMou: { ...formData.initialMou!, mouTitle: e.target.value },
                      })
                    }
                    style={{ ...fieldInputStyle, background: "#fff" }}
                  />
                </FormField>

                <FormField label="Discount Rate (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.initialMou?.discountValue || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialMou: { ...formData.initialMou!, discountValue: Number(e.target.value) },
                      })
                    }
                    style={{ ...fieldInputStyle, background: "#fff" }}
                  />
                </FormField>

                <FormField label="Start Date">
                  <input
                    type="date"
                    value={formData.initialMou?.startDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialMou: { ...formData.initialMou!, startDate: e.target.value },
                      })
                    }
                    style={{ ...fieldInputStyle, background: "#fff" }}
                  />
                </FormField>

                <FormField label="Expiration Date">
                  <input
                    type="date"
                    value={formData.initialMou?.endDate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialMou: { ...formData.initialMou!, endDate: e.target.value },
                      })
                    }
                    style={{ ...fieldInputStyle, background: "#fff" }}
                  />
                </FormField>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : initialData ? "Update Institution" : "Save Partner Institution"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditPartnerSchoolModal;
