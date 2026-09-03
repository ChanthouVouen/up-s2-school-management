import React, { useEffect, useState } from "react";
import {
  fetchStudents,
  fetchStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  Student,
  StudentStatus,
  PaymentStatus,
} from "../services/studentService";
import {
  fetchPartnerSchools,
  PartnerSchool,
} from "../services/partnerSchoolService";
import ConfirmModal from "./users/ConfirmModal";
import StudentDetailView from "./StudentDetailView";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import FormField, { fieldInputStyle } from "./ui/FormField";
import Table, { TableColumn } from "./ui/Table";
import Pagination from "./ui/Pagination";
import Badge from "./ui/Badge";
import Toast from "./ui/Toast";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../auth/AuthContext";
import { PERMISSIONS } from "../types/permissions";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  GraduationCap,
  Gift,
  Upload,
  Camera,
  X,
  ImageIcon,
} from "lucide-react";

const EMPTY_FORM = {
  studentCode: "",
  name: "",
  email: "",
  phone: "",
  gender: "Male",
  dob: "",
  address: "",
  department: "Computer Science",
  photoUrl: "",
  status: StudentStatus.ENROLLED,
  paymentStatus: PaymentStatus.UNPAID,
  partnerSchoolId: "",
};

function getStatusBadgeStyle(status: string) {
  switch (status) {
    case "ENROLLED":
      return { bg: "#dcfce7", color: "#15803d", icon: <UserCheck size={12} /> };
    case "PENDING":
      return { bg: "#fef3c7", color: "#b45309", icon: <Clock size={12} /> };
    case "GRADUATED":
      return { bg: "#e0e7ff", color: "#4338ca", icon: <CheckCircle2 size={12} /> };
    case "SUSPENDED":
      return { bg: "#fee2e2", color: "#b91c1c", icon: <UserX size={12} /> };
    default:
      return { bg: "#f1f5f9", color: "#475569", icon: null };
  }
}

function getPaymentBadgeStyle(paymentStatus: string) {
  switch (paymentStatus) {
    case "PAID":
      return { bg: "#e0e7ff", color: "#3730a3" };
    case "UNPAID":
      return { bg: "#fee2e2", color: "#991b1b" };
    case "PARTIAL":
      return { bg: "#ffedd5", color: "#c2410c" };
    default:
      return { bg: "#f1f5f9", color: "#475569" };
  }
}

import api, { formatImageUrl } from "../services/api";

function handlePhotoUpload(file: File, onDone: (photoUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64 = (event.target?.result as string) || "";
    api.post("/upload/image", { image: base64 })
      .then((res) => {
        onDone(res.data?.url || base64);
      })
      .catch(() => {
        onDone(base64);
      });
  };
  reader.readAsDataURL(file);
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal & Single-Page Detail States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewingDetailId, setViewingDetailId] = useState<number | null>(null);

  // Custom Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string; code: string } | null>(null);

  const { toast, showToast } = useToast();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.STUDENT_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.STUDENT_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.STUDENT_DELETE);

  // Selected Student State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [addFormData, setAddFormData] = useState(EMPTY_FORM);
  const [editFormData, setEditFormData] = useState(EMPTY_FORM);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudents({
        search,
        status: statusFilter,
        paymentStatus: paymentFilter,
        department: departmentFilter,
        page,
        limit: 8,
      });
      setStudents(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalStudents(res.pagination.total);
    } catch (err: any) {
      console.error("Failed to load students:", err);
      setError("Failed to fetch students from server.");
    } finally {
      setLoading(false);
    }
  };

  const loadPartnerSchoolsList = async () => {
    try {
      const res = await fetchPartnerSchools({ limit: 100 });
      setPartnerSchools(res.data);
    } catch (err) {
      console.error("Failed to fetch partner schools list:", err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter, paymentFilter, departmentFilter, page]);

  useEffect(() => {
    loadPartnerSchoolsList();
  }, []);

  const handleOpenAddModal = () => {
    setAddFormData(EMPTY_FORM);
    setIsAddModalOpen(true);
  };

  const toEditFormData = (student: Student) => ({
    studentCode: student.studentCode || "",
    name: student.name || "",
    email: student.email || "",
    phone: student.phone || "",
    gender: student.gender || "Male",
    dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
    address: student.address || "",
    department: student.department || "Computer Science",
    photoUrl: student.photoUrl || "",
    status: (student.status as StudentStatus) || StudentStatus.ENROLLED,
    paymentStatus: (student.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
    partnerSchoolId: student.partnerSchoolId ? String(student.partnerSchoolId) : "",
  });

  const handleOpenEditModal = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData(toEditFormData(student));
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createStudent({
        name: addFormData.name,
        studentCode: addFormData.studentCode || undefined,
        email: addFormData.email || undefined,
        phone: addFormData.phone || undefined,
        gender: addFormData.gender,
        dob: addFormData.dob || undefined,
        address: addFormData.address || undefined,
        department: addFormData.department,
        photoUrl: addFormData.photoUrl,
        status: addFormData.status,
        paymentStatus: addFormData.paymentStatus,
        partnerSchoolId: addFormData.partnerSchoolId ? Number(addFormData.partnerSchoolId) : null,
      });
      setIsAddModalOpen(false);
      showToast("success", `Student "${addFormData.name}" enrolled successfully.`);
      setAddFormData(EMPTY_FORM);
      loadStudents();
    } catch (err: any) {
      showToast("error", "Failed to register student: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      await updateStudent(selectedStudent.id, {
        name: editFormData.name,
        email: editFormData.email || undefined,
        phone: editFormData.phone || undefined,
        gender: editFormData.gender,
        dob: editFormData.dob || undefined,
        address: editFormData.address || undefined,
        department: editFormData.department,
        photoUrl: editFormData.photoUrl,
        status: editFormData.status,
        paymentStatus: editFormData.paymentStatus,
        partnerSchoolId: editFormData.partnerSchoolId ? Number(editFormData.partnerSchoolId) : null,
      });
      setIsEditModalOpen(false);
      showToast("success", `Student "${editFormData.name}" updated successfully.`);
      setSelectedStudent(null);
      loadStudents();
    } catch (err: any) {
      showToast("error", "Failed to update student: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const promptDeleteConfirmation = (id: number, name: string, code: string) => {
    setStudentToDelete({ id, name, code });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    try {
      setSubmitting(true);
      await deleteStudent(studentToDelete.id);
      setIsDeleteModalOpen(false);
      showToast("success", `Student "${studentToDelete.name}" deleted successfully.`);
      setStudentToDelete(null);
      loadStudents();
    } catch (err: any) {
      showToast("error", "Failed to delete student: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (viewingDetailId !== null) {
    return (
      <StudentDetailView
        studentId={viewingDetailId}
        onBack={() => setViewingDetailId(null)}
        onEdit={(student) => {
          setViewingDetailId(null);
          handleOpenEditModal(student);
        }}
      />
    );
  }

  const columns: TableColumn<Student>[] = [
    {
      key: "code",
      header: "Code",
      render: (stu) => (
        <span
          style={{
            padding: "3px 8px",
            background: "#eff6ff",
            color: "#2563eb",
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          {stu?.studentCode || `STU-${stu?.id || ""}`}
        </span>
      ),
    },
    {
      key: "name",
      header: "Student Name",
      render: (stu) => {
        const displayName = stu?.name || "Unnamed Student";
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                position: "relative",
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#e2e8f0",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#334155",
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              <span>{displayName.charAt(0).toUpperCase()}</span>
              {stu?.photoUrl && (
                <img
                  src={formatImageUrl(stu.photoUrl)}
                  alt={displayName}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{stu?.email || "No email"}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "scholarship",
      header: "Applied Scholarship",
      render: (stu) => {
        if (!stu || !stu.partnerSchool) {
          return <span style={{ fontSize: 11, color: "#94a3b8" }}>Standard Rate</span>;
        }
        const activeMou = Array.isArray(stu.partnerSchool.mous) && stu.partnerSchool.mous.length > 0 ? stu.partnerSchool.mous[0] : null;
        if (activeMou) {
          return (
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 20,
                background: "#f3e8ff",
                color: "#6b21a8",
                fontSize: 11,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Gift size={12} /> {activeMou.discountValue ?? 0}{activeMou.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}
            </span>
          );
        }
        return <span style={{ fontSize: 11, color: "#64748b" }}>Partner Affiliated</span>;
      },
    },
    {
      key: "department",
      header: "Department",
      render: (stu) => <span style={{ color: "#475569" }}>{stu?.department || "Unassigned"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (stu) => {
        const badge = getStatusBadgeStyle(String(stu?.status || "ENROLLED"));
        return (
          <Badge bg={badge.bg} color={badge.color} icon={badge.icon}>
            {stu?.status || "ENROLLED"}
          </Badge>
        );
      },
    },
    {
      key: "payment",
      header: "Payment",
      render: (stu) => {
        const badge = getPaymentBadgeStyle(String(stu?.paymentStatus || "UNPAID"));
        return (
          <span
            style={{
              padding: "3px 9px",
              borderRadius: 20,
              background: badge.bg,
              color: badge.color,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {stu?.paymentStatus || "UNPAID"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (stu) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button
            variant="icon"
            onClick={() => setViewingDetailId(stu.id)}
            title="View Details"
            style={{ color: "#2563eb" }}
          >
            <Eye size={15} />
          </Button>

          {canUpdate && (
            <Button
              variant="icon"
              onClick={() => handleOpenEditModal(stu)}
              title="Edit Profile"
              style={{ color: "#d97706" }}
            >
              <Edit2 size={15} />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="icon"
              onClick={() => promptDeleteConfirmation(stu.id, stu.name, stu.studentCode)}
              title="Delete Student"
              style={{ color: "#dc2626", background: "#fee2e2" }}
            >
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast {...toast} />}

      {/* FILTER & HEADER CONTROLS */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, flex: 1 }}>
          {/* SEARCH BAR */}
          <div style={{ position: "relative", minWidth: 240, flex: 1 }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="text"
              placeholder="Search code, name, email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
                background: "#f8fafc",
                color: "#0f172a",
              }}
            />
          </div>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="">All Statuses</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="PENDING">Pending</option>
            <option value="GRADUATED">Graduated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* PAYMENT FILTER */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
          </select>

          {/* DEPARTMENT FILTER */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              outline: "none",
            }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="English">English</option>
          </select>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Button variant="secondary" onClick={loadStudents} icon={<RefreshCw size={14} />} disabled={loading}>
            Refresh
          </Button>

          {canCreate && (
            <Button variant="primary" onClick={handleOpenAddModal} icon={<Plus size={14} />}>
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ padding: 14, background: "#fee2e2", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* TABLE */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Table rowKey={(stu) => stu.id} columns={columns} data={students} loading={loading} emptyMessage="No students found." />
        {!loading && students.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={totalStudents}
          />
        )}
      </div>

      {/* CUSTOM CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteStudent}
        title="Delete Student Profile"
        message={
          <>
            Are you sure you want to delete student <strong>"{studentToDelete?.name}"</strong> ({studentToDelete?.code})? This action is
            permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete Student"
        cancelText="Cancel"
        variant="danger"
        loading={submitting}
      />

      {/* ADD STUDENT MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student" width={560}>
        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* PROFILE PHOTO UPLOADER (TOP OF FORM) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1", marginBottom: 2 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                background: "#ffffff",
                border: "2px solid #e2e8f0",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {addFormData.photoUrl ? (
                <img src={formatImageUrl(addFormData.photoUrl)} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Camera size={30} color="#94a3b8" />
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <label
                style={{
                  padding: "6px 14px",
                  background: "#2563eb",
                  color: "#ffffff",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 5px rgba(37,99,235,0.2)",
                }}
              >
                <Upload size={14} /> {addFormData.photoUrl ? "Change Photo" : "Upload Photo (Optional)"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoUpload(file, (url) => {
                        setAddFormData((prev) => ({ ...prev, photoUrl: url }));
                      });
                    }
                  }}
                />
              </label>

              {addFormData.photoUrl && (
                <button
                  type="button"
                  onClick={() => setAddFormData({ ...addFormData, photoUrl: "" })}
                  style={{
                    padding: "6px 12px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              JPG, PNG, or WEBP photo from your computer (Optional)
            </span>
          </div>

          <FormField label="Full Name *">
            <input
              type="text"
              required
              placeholder="e.g. Sok Dara"
              value={addFormData.name}
              onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          {/* PARTNER SCHOOL & SCHOLARSHIP SELECTOR */}
          <FormField label="Partner Institution / Scholarship Origin">
            <select
              value={addFormData.partnerSchoolId}
              onChange={(e) => setAddFormData({ ...addFormData, partnerSchoolId: e.target.value })}
              style={fieldInputStyle}
            >
              <option value="">None (Standard Rate / Non-Affiliated Student)</option>
              {partnerSchools.map((ps) => {
                const mou = ps.mous && ps.mous.length > 0 ? ps.mous[0] : null;
                const discountText = mou ? ` (${mou.discountValue}${mou.discountType === "PERCENTAGE" ? "% Off Scholarship" : "$ Off Scholarship"})` : "";
                return (
                  <option key={ps.id} value={ps.id}>
                    {ps.name}{discountText}
                  </option>
                );
              })}
            </select>
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Email">
              <input
                type="email"
                placeholder="student@school.edu"
                value={addFormData.email}
                onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                placeholder="012 345 678"
                value={addFormData.phone}
                onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Department">
              <select
                value={addFormData.department}
                onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                style={fieldInputStyle}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="English">English</option>
              </select>
            </FormField>
            <FormField label="Gender">
              <select
                value={addFormData.gender}
                onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value })}
                style={fieldInputStyle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Status">
              <select
                value={addFormData.status}
                onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value as StudentStatus })}
                style={fieldInputStyle}
              >
                <option value="ENROLLED">Enrolled</option>
                <option value="PENDING">Pending</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </FormField>
            <FormField label="Payment Status">
              <select
                value={addFormData.paymentStatus}
                onChange={(e) => setAddFormData({ ...addFormData, paymentStatus: e.target.value as PaymentStatus })}
                style={fieldInputStyle}
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Button variant="secondary" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Registering..." : "Register Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student Profile" width={560}>
        <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* PROFILE PHOTO UPLOADER (TOP OF EDIT FORM) */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "14px", background: "#f8fafc", borderRadius: 12, border: "1px dashed #cbd5e1", marginBottom: 2 }}>
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                background: "#ffffff",
                border: "2px solid #e2e8f0",
                boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: 28,
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              {editFormData.photoUrl ? (
                <img src={formatImageUrl(editFormData.photoUrl)} alt="Student Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Camera size={30} color="#94a3b8" />
              )}
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <label
                style={{
                  padding: "6px 14px",
                  background: "#2563eb",
                  color: "#ffffff",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  boxShadow: "0 2px 5px rgba(37,99,235,0.2)",
                }}
              >
                <Upload size={14} /> {editFormData.photoUrl ? "Change Photo" : "Upload Profile Photo"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handlePhotoUpload(file, (url) => {
                        setEditFormData((prev) => ({ ...prev, photoUrl: url }));
                      });
                    }
                  }}
                />
              </label>

              {editFormData.photoUrl && (
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, photoUrl: "" })}
                  style={{
                    padding: "6px 12px",
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove Photo
                </button>
              )}
            </div>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Optional • Upload JPG/PNG file or leave blank
            </span>
          </div>

          <FormField label="Student Code">
            <input type="text" disabled value={editFormData.studentCode} style={{ ...fieldInputStyle, background: "#f1f5f9" }} />
          </FormField>

          <FormField label="Full Name *">
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

          {/* PARTNER SCHOOL & SCHOLARSHIP SELECTOR */}
          <FormField label="Partner Institution / Scholarship Origin">
            <select
              value={editFormData.partnerSchoolId}
              onChange={(e) => setEditFormData({ ...editFormData, partnerSchoolId: e.target.value })}
              style={fieldInputStyle}
            >
              <option value="">None (Standard Rate / Non-Affiliated Student)</option>
              {partnerSchools.map((ps) => {
                const mou = ps.mous && ps.mous.length > 0 ? ps.mous[0] : null;
                const discountText = mou ? ` (${mou.discountValue}${mou.discountType === "PERCENTAGE" ? "% Off Scholarship" : "$ Off Scholarship"})` : "";
                return (
                  <option key={ps.id} value={ps.id}>
                    {ps.name}{discountText}
                  </option>
                );
              })}
            </select>
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Email">
              <input
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                style={fieldInputStyle}
              />
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Department">
              <select
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                style={fieldInputStyle}
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="English">English</option>
              </select>
            </FormField>
            <FormField label="Gender">
              <select
                value={editFormData.gender}
                onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                style={fieldInputStyle}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Status">
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as StudentStatus })}
                style={fieldInputStyle}
              >
                <option value="ENROLLED">Enrolled</option>
                <option value="PENDING">Pending</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </FormField>
            <FormField label="Payment Status">
              <select
                value={editFormData.paymentStatus}
                onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value as PaymentStatus })}
                style={fieldInputStyle}
              >
                <option value="PAID">Paid</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </FormField>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
