import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  Building2,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import ConfirmModal from "../../../components/users/ConfirmModal";
import { useAuth } from "../../../auth/AuthContext";
import { PERMISSIONS } from "../../../types/permissions";
import {
  PartnerSchool,
  Mou,
  fetchPartnerSchoolById,
  updatePartnerSchool,
  addMou,
  updateMou,
  deleteMou,
  MouCreateParams,
} from "../../../services/partnerSchoolService";
import AddEditPartnerSchoolModal from "../../../components/partner-schools/AddEditPartnerSchoolModal";
import AddEditMouModal from "../../../components/partner-schools/AddEditMouModal";

export default function PartnerSchoolDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const partnerSchoolId = Number(id);

  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.PARTNER_SCHOOL_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PARTNER_SCHOOL_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PARTNER_SCHOOL_DELETE);

  const [activeTab, setActiveTab] = useState<"overview" | "mous" | "students">("overview");
  const [school, setSchool] = useState<PartnerSchool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sub-modals
  const [editSchoolModalOpen, setEditSchoolModalOpen] = useState(false);

  const [mouModalOpen, setMouModalOpen] = useState(false);
  const [editingMou, setEditingMou] = useState<Mou | null>(null);

  // Deletion confirm modal
  const [deleteMouConfirmOpen, setDeleteMouConfirmOpen] = useState(false);
  const [mouToDelete, setMouToDelete] = useState<Mou | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const loadDetail = async () => {
    if (!partnerSchoolId || isNaN(partnerSchoolId)) {
      setError("Invalid partner institution ID.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPartnerSchoolById(partnerSchoolId);
      setSchool(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load partner institution details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [partnerSchoolId]);

  // Date Parsing Helpers (prevent UTC timezone shift)
  const parseLocalDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    const datePart = String(dateStr).split("T")[0];
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return "";
    const d = parseLocalDate(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  };

  // Calculate MOU Expiration Status
  const getMouExpirationInfo = (mou: Mou) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = parseLocalDate(mou.endDate);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        bg: "#fee2e2",
        color: "#991b1b",
        icon: <AlertTriangle size={12} />,
        daysText: `Expired ${Math.abs(diffDays)} days ago`,
      };
    } else if (diffDays <= 60) {
      return {
        label: `Expiring Soon (${diffDays}d)`,
        bg: "#fef3c7",
        color: "#92400e",
        icon: <Clock size={12} />,
        daysText: `Expires in ${diffDays} days`,
      };
    } else {
      return {
        label: "Active MOU",
        bg: "#dcfce7",
        color: "#166534",
        icon: <CheckCircle2 size={12} />,
        daysText: `Valid for ${diffDays} more days`,
      };
    }
  };

  // Handlers
  const handleSaveSchool = async (data: any) => {
    if (!school) return;
    await updatePartnerSchool(school.id, data);
    loadDetail();
  };

  const handleSaveMou = async (mouData: MouCreateParams) => {
    if (!school) return;
    if (editingMou) {
      await updateMou(editingMou.id, mouData);
    } else {
      await addMou(school.id, mouData);
    }
    await loadDetail();
  };

  const confirmDeleteMou = async () => {
    if (!mouToDelete) return;
    try {
      setSubmittingDelete(true);
      await deleteMou(mouToDelete.id);
      setDeleteMouConfirmOpen(false);
      setMouToDelete(null);
      await loadDetail();
    } catch (err: any) {
      alert("Failed to delete MOU.");
    } finally {
      setSubmittingDelete(false);
    }
  };

  const latestMou = school?.mous && school.mous.length > 0 ? school.mous[0] : null;
  const mouExpiration = latestMou ? getMouExpirationInfo(latestMou) : null;

  return (
    <AdminLayout hidePageHeader={true}>
      <div style={{ marginBottom: 16 }}>
        <Button
          variant="secondary"
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate("/partner-schools")}
        >
          Back to Partner Schools
        </Button>
      </div>
      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 60,
            textAlign: "center",
            color: "#64748b",
            fontSize: 14,
            border: "1px solid #e2e8f0",
          }}
        >
          <RefreshCw size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          Loading partner institution details...
        </div>
      ) : error || !school ? (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: 12,
            padding: 24,
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: 14,
          }}
        >
          {error || "Partner institution not found."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* HEADER CARD */}
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 20,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "#e0e7ff",
                  color: "#3730a3",
                  fontWeight: 700,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {school.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{school.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Badge bg="#eff6ff" color="#1d4ed8">
                    {school.type.replace("_", " ")}
                  </Badge>
                  {school.address && (
                    <span style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={13} style={{ color: "#94a3b8" }} />
                      {school.address}
                    </span>
                  )}
                  {mouExpiration && (
                    <Badge bg={mouExpiration.bg} color={mouExpiration.color} icon={mouExpiration.icon}>
                      {mouExpiration.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                variant="secondary"
                icon={<Edit2 size={15} />}
                onClick={() => setEditSchoolModalOpen(true)}
              >
                Edit Institution Profile
              </Button>
            </div>
          </div>

          {/* MOU Expiration Warning Alert Banner */}
          {mouExpiration && (latestMou?.status === "EXPIRED" || mouExpiration.label.includes("Expiring Soon")) && (
            <div
              style={{
                padding: "12px 18px",
                borderRadius: 10,
                background: mouExpiration.bg,
                border: `1px solid ${mouExpiration.color}40`,
                color: mouExpiration.color,
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {mouExpiration.icon}
                <span>MOU Expiration Warning: {mouExpiration.daysText} ({latestMou?.mouTitle})</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("mous");
                  setEditingMou(latestMou);
                  setMouModalOpen(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  textDecoration: "underline",
                  cursor: "pointer",
                  color: "inherit",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Update / Extend MOU
              </button>
            </div>
          )}

          {/* PAGE NAVIGATION TABS */}
          <div
            style={{
              background: "#fff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              padding: "4px 8px",
              display: "flex",
              gap: 4,
            }}
          >
            {[
              { key: "overview", label: "Overview", icon: <Building2 size={16} /> },
              { key: "mous", label: `MOU Agreements (${school.mous?.length || 0})`, icon: <FileText size={16} /> },
              { key: "students", label: `Enrolled Students (${school.students?.length || 0})`, icon: <Users size={16} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 8,
                  background: activeTab === tab.key ? "#eff6ff" : "transparent",
                  color: activeTab === tab.key ? "#2563eb" : "#64748b",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT PANELS */}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* KPI Quick Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>


                <div style={{ background: "#fff", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Active MOU Expiration</div>
                  <div style={{ marginTop: 6 }}>
                    {mouExpiration ? (
                      <Badge bg={mouExpiration.bg} color={mouExpiration.color} icon={mouExpiration.icon}>
                        {mouExpiration.label}
                      </Badge>
                    ) : (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>No active MOU</span>
                    )}
                  </div>
                </div>

                <div style={{ background: "#fff", padding: 18, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>MOU Tuition Discount</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#4f46e5", marginTop: 4 }}>
                    {latestMou ? `${latestMou.discountValue}${latestMou.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}` : "Standard Rate"}
                  </div>
                </div>
              </div>

              {/* Contact Card */}
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 14 }}>
                  Contact & Location Information
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Users size={18} style={{ color: "#2563eb", marginTop: 2 }} />
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Contact Person</div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{school.contactPerson || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Mail size={18} style={{ color: "#2563eb", marginTop: 2 }} />
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Email Address</div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{school.contactEmail || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Phone size={18} style={{ color: "#2563eb", marginTop: 2 }} />
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Phone Number</div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{school.contactPhone || "N/A"}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <MapPin size={18} style={{ color: "#2563eb", marginTop: 2 }} />
                    <div>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Address Location</div>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>
                        {school.address || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>

                {school.website && (
                  <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                    <span style={{ color: "#94a3b8" }}>Website URL</span>
                    <a href={school.website} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                      {school.website} <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>

              {school.notes && (
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: 8 }}>
                    Partnership Notes & Scope
                  </div>
                  <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6 }}>{school.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* MOUS TAB */}
          {activeTab === "mous" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>MOU Agreements & Scholarship Terms</div>
                <Button
                  variant="primary"
                  icon={<Plus size={15} />}
                  onClick={() => {
                    setEditingMou(null);
                    setMouModalOpen(true);
                  }}
                >
                  Add MOU Agreement
                </Button>
              </div>

              {school.mous && school.mous.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {school.mous.map((mou) => {
                    const statusInfo = getMouExpirationInfo(mou);
                    return (
                      <div key={mou.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 18, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{mou.mouTitle}</div>
                            <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                              Effective: <strong>{formatDateOnly(mou.startDate)}</strong> — Expiration: <strong>{formatDateOnly(mou.endDate)}</strong>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Badge bg={statusInfo.bg} color={statusInfo.color} icon={statusInfo.icon}>
                              {statusInfo.label}
                            </Badge>
                            {canUpdate && (
                              <Button variant="icon" title="Edit MOU" onClick={() => { setEditingMou(mou); setMouModalOpen(true); }}>
                                <Edit2 size={15} />
                              </Button>
                            )}
                            {canDelete && (
                              <Button variant="icon" title="Delete MOU" onClick={() => { setMouToDelete(mou); setDeleteMouConfirmOpen(true); }} style={{ color: "#dc2626", background: "#fee2e2" }}>
                                <Trash2 size={15} />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, background: "#f8fafc", padding: 12, borderRadius: 10, marginTop: 12, fontSize: 12 }}>
                          <div>
                            <span style={{ color: "#94a3b8", display: "block" }}>Scholarship Discount</span>
                            <span style={{ fontWeight: 700, color: "#4f46e5", fontSize: 14 }}>
                              {mou.discountValue} {mou.discountType === "PERCENTAGE" ? "% Discount" : "$ Fixed Off"}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#94a3b8", display: "block" }}>Max Quota</span>
                            <span style={{ fontWeight: 600, color: "#334155" }}>
                              {mou.maxEligibleStudents ? `${mou.maxEligibleStudents} Students` : "Unlimited Quota"}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: "#94a3b8", display: "block" }}>Validity Status</span>
                            <span style={{ color: "#475569", fontWeight: 600 }}>{statusInfo.daysText}</span>
                          </div>
                        </div>

                        {mou.scope && (
                          <div style={{ fontSize: 13, color: "#475569", marginTop: 10 }}>
                            <strong>Agreement Scope: </strong>{mou.scope}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13, border: "1px dashed #cbd5e1", borderRadius: 12, background: "#fff" }}>
                  No MOU agreements recorded yet for this partner institution.
                </div>
              )}
            </div>
          )}

          {/* ENROLLED STUDENTS TAB */}
          {activeTab === "students" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                Enrolled Students from {school.name}
              </div>

              {school.students && school.students.length > 0 ? (
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", color: "#475569", borderBottom: "1px solid #e2e8f0", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                        <th style={{ padding: "12px 16px" }}>Student Code</th>
                        <th style={{ padding: "12px 16px" }}>Student Name</th>
                        <th style={{ padding: "12px 16px" }}>Department</th>
                        <th style={{ padding: "12px 16px" }}>Contact Info</th>
                        <th style={{ padding: "12px 16px" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {school.students.map((st) => (
                        <tr key={st.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 700, color: "#2563eb" }}>{st.studentCode}</td>
                          <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{st.name}</td>
                          <td style={{ padding: "12px 16px", color: "#475569" }}>{st.department || "General"}</td>
                          <td style={{ padding: "12px 16px", color: "#64748b" }}>{st.email || st.phone || "N/A"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <Badge bg="#dcfce7" color="#15803d">{st.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 13, border: "1px dashed #cbd5e1", borderRadius: 12, background: "#fff" }}>
                  No enrolled students linked to this partner institution yet.
                </div>
              )}
            </div>
          )}

          {/* SUB MODALS */}
          <AddEditPartnerSchoolModal
            isOpen={editSchoolModalOpen}
            onClose={() => setEditSchoolModalOpen(false)}
            onSubmit={handleSaveSchool}
            initialData={school}
          />

          <AddEditMouModal
            isOpen={mouModalOpen}
            onClose={() => setMouModalOpen(false)}
            onSubmit={handleSaveMou}
            initialData={editingMou}
            partnerSchoolName={school.name}
          />

          {/* Delete Confirm Modal */}
          <ConfirmModal
            isOpen={deleteMouConfirmOpen}
            onClose={() => setDeleteMouConfirmOpen(false)}
            onConfirm={confirmDeleteMou}
            title="Delete MOU Agreement"
            message={<>Are you sure you want to delete MOU agreement <strong>"{mouToDelete?.mouTitle}"</strong>?</>}
            confirmText="Delete MOU"
            variant="danger"
            loading={submittingDelete}
          />
        </div>
      )}
    </AdminLayout>
  );
}
