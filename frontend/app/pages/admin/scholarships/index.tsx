import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  RefreshCw,
  ExternalLink,
  Award,
  Tag,
  Copy,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Table, { TableColumn } from "../../../components/ui/Table";
import FormField, { fieldInputStyle } from "../../../components/ui/FormField";
import Toast from "../../../components/ui/Toast";
import { useToast } from "../../../hooks/useToast";
import {
  getScholarshipSchemes,
  getScholarshipBeneficiaries,
  createScholarshipCode,
  updateScholarshipCode,
  deleteScholarshipCode,
  revokeScholarship,
  getGradeScholarships,
  createGradeScholarship,
  updateGradeScholarship,
  deleteGradeScholarship,
  type ScholarshipScheme,
  type SpecialScholarshipCode,
  type ScholarshipBeneficiary,
  type GradeScholarship,
} from "../../../services/scholarshipService";

interface UnifiedProgram {
  id: string;
  name: string;
  subtext: string;
  track: "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER";
  discount: string;
  discountValue: number;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  usage: string;
  expiry: string;
  code?: string;
  rawCode?: SpecialScholarshipCode;
  rawGrade?: GradeScholarship;
  partnerSchoolId?: number;
}

export default function ScholarshipsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"programs" | "beneficiaries">("programs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>([]);
  const [specialCodes, setSpecialCodes] = useState<SpecialScholarshipCode[]>([]);
  const [gradeScholarships, setGradeScholarships] = useState<GradeScholarship[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<ScholarshipBeneficiary[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [trackFilter, setTrackFilter] = useState<"ALL" | "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER">("ALL");



  // Create Code Modal State
  const [isCreateCodeModalOpen, setIsCreateCodeModalOpen] = useState(false);
  const [newCodeForm, setNewCodeForm] = useState({
    code: "",
    title: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 50,
    maxUses: 20,
    expiresAt: "2027-12-31",
  });
  const [creatingCode, setCreatingCode] = useState(false);

  // Edit Code Modal State
  const [isEditCodeModalOpen, setIsEditCodeModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<SpecialScholarshipCode | null>(null);
  const [editCodeForm, setEditCodeForm] = useState({
    code: "",
    title: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 50,
    maxUses: 20,
    expiresAt: "2027-12-31",
    active: true,
  });
  const [updatingCode, setUpdatingCode] = useState(false);

  // Delete Code Modal State
  const [isDeleteCodeModalOpen, setIsDeleteCodeModalOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<SpecialScholarshipCode | null>(null);
  const [deletingCode, setDeletingCode] = useState(false);

  // Create Grade Modal State
  const [isCreateGradeModalOpen, setIsCreateGradeModalOpen] = useState(false);
  const [newGradeForm, setNewGradeForm] = useState({
    grade: "A",
    title: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 100,
    description: "",
  });
  const [creatingGrade, setCreatingGrade] = useState(false);

  // Edit Grade Modal State
  const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeScholarship | null>(null);
  const [editGradeForm, setEditGradeForm] = useState({
    grade: "A",
    title: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 100,
    description: "",
    active: true,
  });
  const [updatingGrade, setUpdatingGrade] = useState(false);

  // Delete Grade Modal State
  const [isDeleteGradeModalOpen, setIsDeleteGradeModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<GradeScholarship | null>(null);
  const [deletingGrade, setDeletingGrade] = useState(false);

  // Revoke Beneficiary Modal State
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [beneficiaryToRevoke, setBeneficiaryToRevoke] = useState<ScholarshipBeneficiary | null>(null);
  const [revoking, setRevoking] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [schemesData, beneficiariesData, gradesData] = await Promise.all([
        getScholarshipSchemes(),
        getScholarshipBeneficiaries({ search: searchQuery }),
        getGradeScholarships(),
      ]);

      setSchemes(schemesData.data);
      setSpecialCodes(schemesData.specialCodes || []);
      setGradeScholarships(gradesData.data || schemesData.gradeScholarships || []);
      setBeneficiaries(beneficiariesData.data);
    } catch (err: any) {
      console.error("Failed to load scholarship data:", err);
      setError("Failed to load scholarship information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery]);

  // Combine into unified list for the programs table
  const unifiedPrograms = useMemo<UnifiedProgram[]>(() => {
    const list: UnifiedProgram[] = [];

    gradeScholarships.forEach((g) => {
      list.push({
        id: `grade-${g.id}`,
        name: g.title,
        subtext: `National Exam Grade ${g.grade}`,
        track: "GRADE_A",
        discount: `${g.discountValue}${g.discountType === "PERCENTAGE" ? "% Waiver" : "$ Off"}`,
        discountValue: g.discountValue,
        discountType: g.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
        usage: "Open Merit",
        expiry: g.active ? "Active" : "Inactive",
        rawGrade: g,
      });
    });

    specialCodes.forEach((c) => {
      list.push({
        id: `code-${c.code}`,
        name: c.title,
        subtext: c.code,
        code: c.code,
        rawCode: c,
        track: "SPECIAL_CODE",
        discount: `${c.discountValue}${c.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}`,
        discountValue: c.discountValue,
        discountType: c.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
        usage: `${c.usedCount} / ${c.maxUses} used`,
        expiry: new Date(c.expiresAt).toLocaleDateString(),
      });
    });

    schemes.forEach((s) => {
      list.push({
        id: s.id,
        name: s.schoolName,
        subtext: s.mouTitle ? `MOU: ${s.mouTitle}` : "Feeder Agreement",
        partnerSchoolId: s.partnerSchoolId,
        track: "MOU_PARTNER",
        discount: `${s.discountValue}${s.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}`,
        discountValue: s.discountValue,
        discountType: s.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
        usage: `${s.enrolledCount} / ${s.maxEligibleStudents ?? "Unlimited"} slots`,
        expiry: new Date(s.endDate).toLocaleDateString(),
      });
    });

    return list.filter((item) => {
      const matchTrack = trackFilter === "ALL" || item.track === trackFilter;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtext.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTrack && matchSearch;
    });
  }, [schemes, specialCodes, gradeScholarships, trackFilter, searchQuery]);

  // Grade Scholarship Handlers
  const handleOpenEditGrade = (grade: GradeScholarship) => {
    setEditingGrade(grade);
    setEditGradeForm({
      grade: grade.grade,
      title: grade.title,
      discountType: grade.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
      discountValue: grade.discountValue,
      description: grade.description || "",
      active: grade.active !== false,
    });
    setIsEditGradeModalOpen(true);
  };

  const handleUpdateGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrade) return;
    if (!editGradeForm.grade.trim() || !editGradeForm.title.trim()) {
      showToast("error", "Grade letter and Title are required.");
      return;
    }
    try {
      setUpdatingGrade(true);
      await updateGradeScholarship(editingGrade.id, {
        ...editGradeForm,
        grade: editGradeForm.grade.trim().toUpperCase(),
      });
      showToast("success", `Grade ${editGradeForm.grade.toUpperCase()} scholarship updated successfully.`);
      setIsEditGradeModalOpen(false);
      setEditingGrade(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update grade scholarship.");
    } finally {
      setUpdatingGrade(false);
    }
  };

  const handleOpenDeleteGrade = (grade: GradeScholarship) => {
    setGradeToDelete(grade);
    setIsDeleteGradeModalOpen(true);
  };

  const handleDeleteGradeConfirm = async () => {
    if (!gradeToDelete) return;
    try {
      setDeletingGrade(true);
      await deleteGradeScholarship(gradeToDelete.id);
      showToast("success", `Grade scholarship "${gradeToDelete.title}" deleted.`);
      setIsDeleteGradeModalOpen(false);
      setGradeToDelete(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to delete grade scholarship.");
    } finally {
      setDeletingGrade(false);
    }
  };

  const handleCreateGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGradeForm.grade.trim() || !newGradeForm.title.trim()) {
      showToast("error", "Grade letter and Title are required.");
      return;
    }
    try {
      setCreatingGrade(true);
      await createGradeScholarship({
        ...newGradeForm,
        grade: newGradeForm.grade.trim().toUpperCase(),
      });
      showToast("success", `Grade ${newGradeForm.grade.toUpperCase()} scholarship scheme created.`);
      setIsCreateGradeModalOpen(false);
      setNewGradeForm({
        grade: "A",
        title: "",
        discountType: "PERCENTAGE",
        discountValue: 100,
        description: "",
      });
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create grade scholarship.");
    } finally {
      setCreatingGrade(false);
    }
  };

  const handleOpenEditCode = (code: SpecialScholarshipCode) => {
    setEditingCode(code);
    setEditCodeForm({
      code: code.code,
      title: code.title,
      discountType: code.discountType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
      discountValue: code.discountValue,
      maxUses: code.maxUses || 25,
      expiresAt: code.expiresAt ? code.expiresAt.split("T")[0] : "2027-12-31",
      active: code.active !== false,
    });
    setIsEditCodeModalOpen(true);
  };

  const handleUpdateCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCode) return;
    if (!editCodeForm.code.trim() || !editCodeForm.title.trim()) {
      showToast("error", "Code and Title are required.");
      return;
    }
    try {
      setUpdatingCode(true);
      await updateScholarshipCode(editingCode.id, {
        ...editCodeForm,
        code: editCodeForm.code.trim().toUpperCase(),
      });
      showToast("success", `Promo code "${editCodeForm.code.toUpperCase()}" updated successfully.`);
      setIsEditCodeModalOpen(false);
      setEditingCode(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to update code.");
    } finally {
      setUpdatingCode(false);
    }
  };

  const handleOpenDeleteCode = (code: SpecialScholarshipCode) => {
    setCodeToDelete(code);
    setIsDeleteCodeModalOpen(true);
  };

  const handleDeleteCodeConfirm = async () => {
    if (!codeToDelete) return;
    try {
      setDeletingCode(true);
      await deleteScholarshipCode(codeToDelete.id);
      showToast("success", `Promo code "${codeToDelete.code}" deleted successfully.`);
      setIsDeleteCodeModalOpen(false);
      setCodeToDelete(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to delete code.");
    } finally {
      setDeletingCode(false);
    }
  };

  const handleOpenRevokeModal = (beneficiary: ScholarshipBeneficiary) => {
    setBeneficiaryToRevoke(beneficiary);
    setIsRevokeModalOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!beneficiaryToRevoke) return;
    try {
      setRevoking(true);
      await revokeScholarship(beneficiaryToRevoke.rawId);
      showToast("success", `Scholarship removed for ${beneficiaryToRevoke.name}.`);
      setIsRevokeModalOpen(false);
      setBeneficiaryToRevoke(null);
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to remove scholarship.");
    } finally {
      setRevoking(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => { });
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const programColumns: TableColumn<UnifiedProgram>[] = [
    {
      key: "name",
      header: "Program / Code",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{row.name}</div>
          <div style={{ color: "#64748b", fontSize: 11, fontFamily: row.code ? "monospace" : "inherit" }}>
            {row.subtext}
          </div>
        </div>
      ),
    },
    {
      key: "track",
      header: "Category",
      render: (row) => {
        if (row.track === "GRADE_A") {
          const label = row.rawGrade ? `Grade ${row.rawGrade.grade} Merit` : "Grade Merit";
          return <Badge bg="#fef3c7" color="#b45309">{label}</Badge>;
        }
        if (row.track === "SPECIAL_CODE") return <Badge bg="#e0e7ff" color="#4338ca">Promo Code</Badge>;
        return <Badge bg="#f3e8ff" color="#7e22ce">Partner MOU</Badge>;
      },
    },
    {
      key: "discount",
      header: "Discount",
      render: (row) => (
        <Badge bg="#dcfce7" color="#15803d">
          {row.discount}
        </Badge>
      ),
    },
    {
      key: "usage",
      header: "Capacity / Quota",
      render: (row) => <span style={{ color: "#475569", fontSize: 12 }}>{row.usage}</span>,
    },
    {
      key: "expiry",
      header: "Validity",
      render: (row) => <span style={{ color: "#64748b", fontSize: 12 }}>{row.expiry}</span>,
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (row) => {
        if (row.track === "SPECIAL_CODE" && row.code) {
          return (
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <Button
                variant="secondary"
                style={{ padding: "6px 8px" }}
                icon={copiedCode === row.code ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                onClick={() => handleCopy(row.code!)}
                title={copiedCode === row.code ? "Copied promo code" : "Copy promo code"}
              />
              <Button
                variant="secondary"
                style={{ padding: "6px 8px" }}
                icon={<Edit2 size={14} />}
                onClick={() => row.rawCode && handleOpenEditCode(row.rawCode)}
                title="Edit promo code"
              />
              <Button
                variant="danger"
                style={{ padding: "6px 8px" }}
                icon={<Trash2 size={14} />}
                onClick={() => row.rawCode && handleOpenDeleteCode(row.rawCode)}
                title="Delete promo code"
              />
            </div>
          );
        }
        if (row.track === "MOU_PARTNER" && row.partnerSchoolId) {
          return (
            <Button
              variant="secondary"
              style={{ padding: "5px 10px", fontSize: 12 }}
              icon={<ExternalLink size={13} />}
              onClick={() => navigate(`/partner-schools/${row.partnerSchoolId}`)}
            >
              Partner
            </Button>
          );
        }
        if (row.track === "GRADE_A") {
          return (
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              {row.rawGrade && (
                <>
                  <Button
                    variant="secondary"
                    style={{ padding: "6px 8px" }}
                    icon={<Edit2 size={14} />}
                    onClick={() => handleOpenEditGrade(row.rawGrade!)}
                    title="Edit grade scheme"
                  />
                  <Button
                    variant="danger"
                    style={{ padding: "6px 8px" }}
                    icon={<Trash2 size={14} />}
                    onClick={() => handleOpenDeleteGrade(row.rawGrade!)}
                    title="Delete grade scheme"
                  />
                </>
              )}
            </div>
          );
        }
        return null;
      },
    },
  ];

  const handleCreateCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeForm.code || !newCodeForm.title) {
      showToast("error", "Code and Title are required.");
      return;
    }

    try {
      setCreatingCode(true);
      await createScholarshipCode(newCodeForm);
      showToast("success", `Code ${newCodeForm.code} generated successfully.`);
      setIsCreateCodeModalOpen(false);
      setNewCodeForm({
        code: "",
        title: "",
        discountType: "PERCENTAGE",
        discountValue: 50,
        maxUses: 20,
        expiresAt: "2027-12-31",
      });
      loadData();
    } catch (err: any) {
      showToast("error", err.response?.data?.message || "Failed to create code.");
    } finally {
      setCreatingCode(false);
    }
  };

  const beneficiaryColumns: TableColumn<ScholarshipBeneficiary>[] = [
    {
      key: "candidate",
      header: "Candidate / Student",
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{row.name}</div>
          <div style={{ color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{row.code}</div>
          {row.email && <div style={{ color: "#94a3b8", fontSize: 11 }}>{row.email}</div>}
        </div>
      ),
    },
    {
      key: "track",
      header: "Track",
      render: (row) => {
        if (row.track === "GRADE_A") return <Badge bg="#fef3c7" color="#b45309">Grade A Merit</Badge>;
        if (row.track === "SPECIAL_CODE") return <Badge bg="#e0e7ff" color="#4338ca">Promo Code</Badge>;
        return <Badge bg="#f3e8ff" color="#7e22ce">Partner MOU</Badge>;
      },
    },
    {
      key: "kind",
      header: "Type",
      render: (row) => (
        <Badge bg={row.kind === "STUDENT" ? "#e0f2fe" : "#f1f5f9"} color={row.kind === "STUDENT" ? "#0369a1" : "#475569"}>
          {row.kind === "STUDENT" ? "Student" : "Applicant"}
        </Badge>
      ),
    },
    {
      key: "program",
      header: "Program",
      render: (row) => <span style={{ color: "#334155" }}>{row.program}</span>,
    },
    {
      key: "discount",
      header: "Award Terms",
      render: (row) => <span style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>{row.discountLabel}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const isEnrolled = row.status === "ENROLLED" || row.status === "APPROVED";
        return (
          <Badge bg={isEnrolled ? "#ecfdf5" : "#fffbeb"} color={isEnrolled ? "#059669" : "#b45309"}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <Button
            variant="secondary"
            style={{ padding: "6px 8px" }}
            icon={<ExternalLink size={14} />}
            onClick={() => {
              if (row.kind === "STUDENT") navigate("/students");
              else navigate(`/applications/${row.rawId}`);
            }}
            title="View details"
          />
          {row.kind === "STUDENT" && (
            <Button
              variant="danger"
              style={{ padding: "6px 8px" }}
              icon={<Trash2 size={14} />}
              onClick={() => handleOpenRevokeModal(row)}
              title="Remove scholarship"
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      pageDescription="Manage scholarship schemes, promo codes, and student awardees."
      headerAction={
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={loadData}>
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={<Award size={14} />}
            onClick={() => setIsCreateGradeModalOpen(true)}
          >
            New Grade Scheme
          </Button>
          <Button
            variant="secondary"
            icon={<Tag size={14} />}
            onClick={() => setIsCreateCodeModalOpen(true)}
          >
            New Promo Code
          </Button>
        </div>
      }
    >
      {/* TABS HEADER */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: 16,
          gap: 24,
        }}
      >
        <button
          onClick={() => setActiveTab("programs")}
          style={{
            padding: "8px 2px",
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "programs" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "programs" ? "2px solid #2563eb" : "2px solid transparent",
          }}
        >
          Programs & Codes ({unifiedPrograms.length})
        </button>
        <button
          onClick={() => setActiveTab("beneficiaries")}
          style={{
            padding: "8px 2px",
            border: "none",
            background: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "beneficiaries" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "beneficiaries" ? "2px solid #2563eb" : "2px solid transparent",
          }}
        >
          Awarded Students ({beneficiaries.length})
        </button>
      </div>

      {/* FILTER TOOLBAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder={
              activeTab === "programs"
                ? "Search programs, partner schools, codes..."
                : "Search candidate, student code, major..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              ...fieldInputStyle,
              paddingLeft: 34,
              height: 36,
              fontSize: 13,
            }}
          />
        </div>

        {activeTab === "programs" && (
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as any)}
            style={{
              ...fieldInputStyle,
              width: "auto",
              minWidth: 160,
              height: 36,
              fontSize: 13,
            }}
          >
            <option value="ALL">All Options</option>
            <option value="GRADE_A">Grade Merit</option>
            <option value="SPECIAL_CODE">Special Codes</option>
            <option value="MOU_PARTNER">Partner MOUs</option>
          </select>
        )}
      </div>

      {/* DATA TABLES */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {activeTab === "programs" ? (
          <Table<UnifiedProgram>
            loading={loading}
            error={error}
            data={unifiedPrograms}
            rowKey={(row) => row.id}
            emptyMessage="No scholarship programs found."
            columns={programColumns}
          />
        ) : (
          <Table<ScholarshipBeneficiary>
            loading={loading}
            error={error}
            data={beneficiaries}
            rowKey={(row) => row.id}
            emptyMessage="No scholarship beneficiaries found."
            columns={beneficiaryColumns}
          />
        )}
      </div>



      {/* CREATE PROMO CODE MODAL */}
      <Modal
        isOpen={isCreateCodeModalOpen}
        onClose={() => setIsCreateCodeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag size={18} color="#2563eb" />
            <span>New Scholarship Code</span>
          </div>
        }
        width={460}
      >
        <form onSubmit={handleCreateCodeSubmit}>
          <FormField label="Code *">
            <input
              required
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={newCodeForm.code}
              onChange={(e) => setNewCodeForm({ ...newCodeForm, code: e.target.value.toUpperCase() })}
              style={{
                ...fieldInputStyle,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            />
          </FormField>

          <FormField label="Title *">
            <input
              required
              type="text"
              autoComplete="off"
              value={newCodeForm.title}
              onChange={(e) => setNewCodeForm({ ...newCodeForm, title: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Type">
              <select
                value={newCodeForm.discountType}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, discountType: e.target.value as any })}
                style={fieldInputStyle}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed ($)</option>
              </select>
            </FormField>

            <FormField label="Discount Value *">
              <input
                required
                type="number"
                min={1}
                value={newCodeForm.discountValue}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, discountValue: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Quota Limit">
              <input
                type="number"
                min={1}
                value={newCodeForm.maxUses}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, maxUses: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>

            <FormField label="Expiry Date">
              <input
                type="date"
                value={newCodeForm.expiresAt}
                onChange={(e) => setNewCodeForm({ ...newCodeForm, expiresAt: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateCodeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creatingCode}>
              {creatingCode ? "Saving..." : "Save Code"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT SCHOLARSHIP CODE MODAL */}
      <Modal
        isOpen={isEditCodeModalOpen}
        onClose={() => setIsEditCodeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Edit2 size={18} color="#2563eb" />
            <span>Edit Promo Code</span>
          </div>
        }
        width={480}
      >
        <form onSubmit={handleUpdateCodeSubmit}>
          <FormField label="Promo Code *">
            <input
              required
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={editCodeForm.code}
              onChange={(e) => setEditCodeForm({ ...editCodeForm, code: e.target.value.toUpperCase() })}
              style={{
                ...fieldInputStyle,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: 600,
              }}
            />
          </FormField>

          <FormField label="Grant / Program Title *">
            <input
              required
              type="text"
              autoComplete="off"
              value={editCodeForm.title}
              onChange={(e) => setEditCodeForm({ ...editCodeForm, title: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Discount Type">
              <select
                value={editCodeForm.discountType}
                onChange={(e) => setEditCodeForm({ ...editCodeForm, discountType: e.target.value as any })}
                style={fieldInputStyle}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed ($)</option>
              </select>
            </FormField>

            <FormField label="Discount Value *">
              <input
                required
                type="number"
                min={1}
                value={editCodeForm.discountValue}
                onChange={(e) => setEditCodeForm({ ...editCodeForm, discountValue: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Quota Limit (Max Uses)">
              <input
                type="number"
                min={1}
                value={editCodeForm.maxUses}
                onChange={(e) => setEditCodeForm({ ...editCodeForm, maxUses: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>

            <FormField label="Expiry Date">
              <input
                type="date"
                value={editCodeForm.expiresAt}
                onChange={(e) => setEditCodeForm({ ...editCodeForm, expiresAt: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <FormField label="Status">
            <select
              value={editCodeForm.active ? "ACTIVE" : "INACTIVE"}
              onChange={(e) => setEditCodeForm({ ...editCodeForm, active: e.target.value === "ACTIVE" })}
              style={fieldInputStyle}
            >
              <option value="ACTIVE">Active (Available for Student Use)</option>
              <option value="INACTIVE">Inactive / Disabled</option>
            </select>
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setIsEditCodeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updatingCode}>
              {updatingCode ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CREATE GRADE SCHOLARSHIP MODAL */}
      <Modal
        isOpen={isCreateGradeModalOpen}
        onClose={() => setIsCreateGradeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Award size={18} color="#2563eb" />
            <span>New Grade Scholarship Scheme</span>
          </div>
        }
        width={460}
      >
        <form onSubmit={handleCreateGradeSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
            <FormField label="Grade *">
              <input
                required
                type="text"
                autoComplete="off"
                maxLength={4}
                value={newGradeForm.grade}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, grade: e.target.value.toUpperCase() })}
                style={{
                  ...fieldInputStyle,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              />
            </FormField>

            <FormField label="Scheme Title *">
              <input
                required
                type="text"
                autoComplete="off"
                value={newGradeForm.title}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, title: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Discount Type">
              <select
                value={newGradeForm.discountType}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, discountType: e.target.value as any })}
                style={fieldInputStyle}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed ($)</option>
              </select>
            </FormField>

            <FormField label="Discount Value *">
              <input
                required
                type="number"
                min={1}
                value={newGradeForm.discountValue}
                onChange={(e) => setNewGradeForm({ ...newGradeForm, discountValue: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <FormField label="Description (Optional)">
            <input
              type="text"
              autoComplete="off"
              value={newGradeForm.description}
              onChange={(e) => setNewGradeForm({ ...newGradeForm, description: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={creatingGrade}>
              {creatingGrade ? "Creating..." : "Save Scheme"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT GRADE SCHOLARSHIP MODAL */}
      <Modal
        isOpen={isEditGradeModalOpen}
        onClose={() => setIsEditGradeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Edit2 size={18} color="#2563eb" />
            <span>Edit Grade Scholarship Scheme</span>
          </div>
        }
        width={460}
      >
        <form onSubmit={handleUpdateGradeSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
            <FormField label="Grade *">
              <input
                required
                type="text"
                autoComplete="off"
                maxLength={4}
                value={editGradeForm.grade}
                onChange={(e) => setEditGradeForm({ ...editGradeForm, grade: e.target.value.toUpperCase() })}
                style={{
                  ...fieldInputStyle,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              />
            </FormField>

            <FormField label="Scheme Title *">
              <input
                required
                type="text"
                autoComplete="off"
                value={editGradeForm.title}
                onChange={(e) => setEditGradeForm({ ...editGradeForm, title: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Discount Type">
              <select
                value={editGradeForm.discountType}
                onChange={(e) => setEditGradeForm({ ...editGradeForm, discountType: e.target.value as any })}
                style={fieldInputStyle}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed ($)</option>
              </select>
            </FormField>

            <FormField label="Discount Value *">
              <input
                required
                type="number"
                min={1}
                value={editGradeForm.discountValue}
                onChange={(e) => setEditGradeForm({ ...editGradeForm, discountValue: Number(e.target.value) })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <FormField label="Description (Optional)">
            <input
              type="text"
              autoComplete="off"
              value={editGradeForm.description}
              onChange={(e) => setEditGradeForm({ ...editGradeForm, description: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          <FormField label="Status">
            <select
              value={editGradeForm.active ? "ACTIVE" : "INACTIVE"}
              onChange={(e) => setEditGradeForm({ ...editGradeForm, active: e.target.value === "ACTIVE" })}
              style={fieldInputStyle}
            >
              <option value="ACTIVE">Active (Available for Awarding)</option>
              <option value="INACTIVE">Inactive / Disabled</option>
            </select>
          </FormField>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <Button type="button" variant="secondary" onClick={() => setIsEditGradeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={updatingGrade}>
              {updatingGrade ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE GRADE SCHOLARSHIP CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteGradeModalOpen}
        onClose={() => setIsDeleteGradeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
            <AlertTriangle size={18} />
            <span>Delete Grade Scheme</span>
          </div>
        }
        width={420}
      >
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Are you sure you want to delete Grade <strong style={{ color: "#0f172a" }}>{gradeToDelete?.grade}</strong> scholarship scheme ({gradeToDelete?.title})?
          <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            This tier will no longer appear in the scholarship catalog or award options. Existing awarded students will retain their records.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Button type="button" variant="secondary" onClick={() => setIsDeleteGradeModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={deletingGrade} onClick={handleDeleteGradeConfirm}>
            {deletingGrade ? "Deleting..." : "Delete Scheme"}
          </Button>
        </div>
      </Modal>

      {/* DELETE PROMO CODE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteCodeModalOpen}
        onClose={() => setIsDeleteCodeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
            <AlertTriangle size={18} />
            <span>Delete Promo Code</span>
          </div>
        }
        width={420}
      >
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Are you sure you want to delete promo code <strong style={{ color: "#0f172a" }}>{codeToDelete?.code}</strong> ({codeToDelete?.title})?
          <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            This action cannot be undone. Students and applicants will no longer be able to use this code.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Button type="button" variant="secondary" onClick={() => setIsDeleteCodeModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={deletingCode} onClick={handleDeleteCodeConfirm}>
            {deletingCode ? "Deleting..." : "Delete Code"}
          </Button>
        </div>
      </Modal>

      {/* REVOKE SCHOLARSHIP CONFIRMATION MODAL */}
      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#dc2626" }}>
            <AlertTriangle size={18} />
            <span>Revoke Scholarship</span>
          </div>
        }
        width={420}
      >
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
          Are you sure you want to revoke the scholarship for{" "}
          <strong style={{ color: "#0f172a" }}>{beneficiaryToRevoke?.name}</strong> ({beneficiaryToRevoke?.code})?
          <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
            Their tuition rate will return to the standard fee and this action will be logged in the student history.
          </p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Button type="button" variant="secondary" onClick={() => setIsRevokeModalOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={revoking} onClick={handleRevokeConfirm}>
            {revoking ? "Revoking..." : "Revoke Scholarship"}
          </Button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </AdminLayout>
  );
}
