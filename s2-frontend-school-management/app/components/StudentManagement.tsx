import React, { useEffect, useState } from "react";
import {
  fetchStudents,
  fetchStudentById,
  createStudent,
  updateStudent,
  updateStudentStatus,
  deleteStudent,
  Student,
  StudentHistoryItem,
  StudentStatus,
  PaymentStatus,
} from "../services/studentService";
import ConfirmModal from "./ConfirmModal";
import StudentDetailView from "./StudentDetailView";
import {
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  X,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Calendar,
  History,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
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
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [viewingDetailId, setViewingDetailId] = useState<number | null>(null);

  // Custom Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string; code: string } | null>(null);

  // Toast Notification State
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Selected Student State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentHistory, setStudentHistory] = useState<StudentHistoryItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Add Form State
  const [addFormData, setAddFormData] = useState({
    studentCode: "",
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    dob: "",
    address: "",
    department: "Computer Science",
    status: StudentStatus.ENROLLED,
    paymentStatus: PaymentStatus.UNPAID,
  });

  // Edit Form State (Separate state for Edit Modal)
  const [editFormData, setEditFormData] = useState({
    studentCode: "",
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    dob: "",
    address: "",
    department: "Computer Science",
    status: StudentStatus.ENROLLED,
    paymentStatus: PaymentStatus.UNPAID,
  });

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

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter, paymentFilter, departmentFilter, page]);

  const handleOpenAddModal = () => {
    setAddFormData({
      studentCode: "",
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      department: "Computer Science",
      status: StudentStatus.ENROLLED,
      paymentStatus: PaymentStatus.UNPAID,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = async (student: Student) => {
    setSelectedStudent(student);

    setEditFormData({
      studentCode: student.studentCode || "",
      name: student.name || "",
      email: student.email || "",
      phone: student.phone || "",
      gender: student.gender || "Male",
      dob: student.dob ? new Date(student.dob).toISOString().split("T")[0] : "",
      address: student.address || "",
      department: student.department || "Computer Science",
      status: (student.status as StudentStatus) || StudentStatus.ENROLLED,
      paymentStatus: (student.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
    });
    setIsEditModalOpen(true);

    try {
      const full = await fetchStudentById(student.id);
      setSelectedStudent(full);
      setEditFormData({
        studentCode: full.studentCode || "",
        name: full.name || "",
        email: full.email || "",
        phone: full.phone || "",
        gender: full.gender || "Male",
        dob: full.dob ? new Date(full.dob).toISOString().split("T")[0] : "",
        address: full.address || "",
        department: full.department || "Computer Science",
        status: (full.status as StudentStatus) || StudentStatus.ENROLLED,
        paymentStatus: (full.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
      });
    } catch (err) {
      console.error("Error fetching full student details for edit:", err);
    }
  };

  const handleOpenDetail = (student: Student) => {
    setViewingDetailId(student.id);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name.trim()) return;

    try {
      setSubmitting(true);
      const created = await createStudent(addFormData);
      setIsAddModalOpen(false);
      loadStudents();
      showToast("success", `Student "${created.name}" registered successfully.`);
    } catch (err: any) {
      showToast("error", "Failed to create student: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !editFormData.name.trim()) return;

    try {
      setSubmitting(true);
      await updateStudent(selectedStudent.id, editFormData);
      setIsEditModalOpen(false);
      loadStudents();
      showToast("success", `Student record for "${editFormData.name}" updated successfully.`);
    } catch (err: any) {
      showToast("error", "Failed to update student: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedStudent) return;
    try {
      const updated = await updateStudentStatus(selectedStudent.id, { status: newStatus });
      setSelectedStudent((prev) => (prev ? { ...prev, status: updated.status } : null));
      loadStudents();
      const full = await fetchStudentById(selectedStudent.id);
      setStudentHistory(full.histories || []);
      showToast("success", `Status updated to ${newStatus}`);
    } catch (err: any) {
      showToast("error", "Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!selectedStudent) return;
    try {
      const updated = await updateStudentStatus(selectedStudent.id, { paymentStatus: newPaymentStatus });
      setSelectedStudent((prev) => (prev ? { ...prev, paymentStatus: updated.paymentStatus } : null));
      loadStudents();
      const full = await fetchStudentById(selectedStudent.id);
      setStudentHistory(full.histories || []);
      showToast("success", `Payment status updated to ${newPaymentStatus}`);
    } catch (err: any) {
      showToast("error", "Failed to update payment status: " + (err.response?.data?.message || err.message));
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

  const getStatusBadge = (status: string) => {
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
  };

  const getPaymentBadge = (paymentStatus: string) => {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      {/* TOAST NOTIFICATION BANNER */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 24,
            zIndex: 10000,
            background: notification.type === "success" ? "#10b981" : "#ef4444",
            color: "#ffffff",
            padding: "12px 18px",
            borderRadius: 8,
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {notification.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TOOLBAR: SEARCH & FILTERS */}
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
        {/* Search */}
        <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by code, name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 13,
              outline: "none",
              color: "#0f172a",
              background: "#ffffff",
            }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12,
              color: "#0f172a",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <option value="">All Statuses</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="PENDING">Pending</option>
            <option value="GRADUATED">Graduated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12,
              color: "#0f172a",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <option value="">All Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12,
              color: "#0f172a",
              background: "#ffffff",
              cursor: "pointer",
            }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="English">English</option>
          </select>

          <button
            onClick={loadStudents}
            style={{
              padding: "8px 12px",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            onClick={handleOpenAddModal}
            style={{
              padding: "8px 16px",
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 4px rgba(59,130,246,0.25)",
            }}
          >
            <Plus size={16} /> Add Student
          </button>
        </div>
      </div>

      {/* STUDENT TABLE CONTAINER */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "16px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#1e293b",
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Student Directory ({totalStudents})</span>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>
            Showing Page {page} of {totalPages || 1}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Loading student records...
          </div>
        ) : error ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#ef4444", fontSize: 13 }}>{error}</div>
        ) : students.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            No student records found matching your filters.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Code</th>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Student Name</th>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Department</th>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: "10px", color: "#64748b", fontWeight: 600 }}>Joined Date</th>
                  <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const sBadge = getStatusBadge(stu.status as string);
                  const pBadge = getPaymentBadge(stu.paymentStatus as string);

                  return (
                    <tr key={stu.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 10px" }}>
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
                          {stu.studentCode}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: "#e2e8f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              color: "#334155",
                              fontSize: 13,
                              flexShrink: 0,
                            }}
                          >
                            {stu.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>{stu.name}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>{stu.email || "No email"}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: "12px 10px", color: "#475569" }}>
                        {stu.department || "Unassigned"}
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "3px 9px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: sBadge.bg,
                            color: sBadge.color,
                          }}
                        >
                          {sBadge.icon}
                          {stu.status}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px" }}>
                        <span
                          style={{
                            padding: "3px 9px",
                            borderRadius: 12,
                            fontSize: 11,
                            fontWeight: 600,
                            background: pBadge.bg,
                            color: pBadge.color,
                          }}
                        >
                          {stu.paymentStatus}
                        </span>
                      </td>

                      <td style={{ padding: "12px 10px", color: "#64748b", fontSize: 12 }}>
                        {new Date(stu.createdAt).toLocaleDateString()}
                      </td>

                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <button
                            onClick={() => handleOpenDetail(stu)}
                            title="View Details"
                            style={{
                              padding: 6,
                              background: "#f1f5f9",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              color: "#3b82f6",
                            }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(stu)}
                            title="Edit Student"
                            style={{
                              padding: 6,
                              background: "#f1f5f9",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              color: "#d97706",
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => promptDeleteConfirmation(stu.id, stu.name, stu.studentCode)}
                            title="Delete Student"
                            style={{
                              padding: 6,
                              background: "#fee2e2",
                              border: "none",
                              borderRadius: 6,
                              cursor: "pointer",
                              color: "#dc2626",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 16,
            paddingTop: 12,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Showing page {page} of {totalPages || 1} ({totalStudents} total records)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: page <= 1 ? "#f8fafc" : "#fff",
                color: page <= 1 ? "#94a3b8" : "#334155",
                fontSize: 12,
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                background: page >= totalPages ? "#f8fafc" : "#fff",
                color: page >= totalPages ? "#94a3b8" : "#334155",
                fontSize: 12,
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* REUSABLE CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={confirmDeleteStudent}
        title="Delete Student Record?"
        message={
          <>
            Are you sure you want to delete student <strong>"{studentToDelete?.name}"</strong> (
            <span style={{ color: "#2563eb", fontWeight: 600 }}>{studentToDelete?.code}</span>)? This action is
            permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete Student"
        cancelText="Cancel"
        variant="danger"
        loading={submitting}
      />

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: 520,
              maxWidth: "92%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>Register New Student</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                  Student Code (Leave blank to auto-generate)
                </label>
                <input
                  type="text"
                  placeholder="e.g. STU-2026-005"
                  value={addFormData.studentCode}
                  onChange={(e) => setAddFormData({ ...addFormData, studentCode: e.target.value })}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sok Dara"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@school.edu"
                    value={addFormData.email}
                    onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="012 345 678"
                    value={addFormData.phone}
                    onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Department
                  </label>
                  <select
                    value={addFormData.department}
                    onChange={(e) => setAddFormData({ ...addFormData, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Gender
                  </label>
                  <select
                    value={addFormData.gender}
                    onChange={(e) => setAddFormData({ ...addFormData, gender: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Status
                  </label>
                  <select
                    value={addFormData.status}
                    onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value as StudentStatus })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="ENROLLED">Enrolled</option>
                    <option value="PENDING">Pending</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Payment Status
                  </label>
                  <select
                    value={addFormData.paymentStatus}
                    onChange={(e) => setAddFormData({ ...addFormData, paymentStatus: e.target.value as PaymentStatus })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Saving..." : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditModalOpen && selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: 520,
              maxWidth: "92%",
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "#1e293b" }}>
                Edit Student ({selectedStudent.studentCode})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Department
                  </label>
                  <select
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as StudentStatus })}
                    style={{
                      width: "100%",
                      padding: 8,
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 13,
                      color: "#0f172a",
                      background: "#ffffff",
                    }}
                  >
                    <option value="ENROLLED">Enrolled</option>
                    <option value="PENDING">Pending</option>
                    <option value="GRADUATED">Graduated</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 4, display: "block" }}>
                  Payment Status
                </label>
                <select
                  value={editFormData.paymentStatus}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentStatus: e.target.value as PaymentStatus })}
                  style={{
                    width: "100%",
                    padding: 8,
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#0f172a",
                    background: "#ffffff",
                  }}
                >
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: "8px 16px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Updating..." : "Update Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT DETAIL DRAWER / MODAL */}
      {isDetailDrawerOpen && selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: 620,
              maxWidth: "94%",
              padding: 24,
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{selectedStudent.name}</div>
                <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{selectedStudent.studentCode}</div>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* QUICK STATUS UPDATE CONTROLS */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 8,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Status:</span>
                <select
                  value={selectedStudent.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <option value="ENROLLED">ENROLLED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="GRADUATED">GRADUATED</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Payment:</span>
                <select
                  value={selectedStudent.paymentStatus}
                  onChange={(e) => handlePaymentStatusChange(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <option value="PAID">PAID</option>
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                </select>
              </div>
            </div>

            {/* PROFILE INFO GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
                fontSize: 13,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
                <Mail size={15} color="#94a3b8" />
                <span>{selectedStudent.email || "No email provided"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
                <Phone size={15} color="#94a3b8" />
                <span>{selectedStudent.phone || "No phone provided"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
                <Building size={15} color="#94a3b8" />
                <span>Department: {selectedStudent.department || "General"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#475569" }}>
                <Calendar size={15} color="#94a3b8" />
                <span>Joined: {new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* STUDENT HISTORY AUDIT TRAIL TIMELINE */}
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <History size={16} color="#3b82f6" />
                <span>Student History & Activity Logs</span>
              </div>

              {studentHistory.length === 0 ? (
                <div style={{ padding: "16px 0", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                  No historical activity logs recorded yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {studentHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: "#f8fafc",
                        borderLeft: "3px solid #3b82f6",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: 2,
                        }}
                      >
                        <span>{item.action}</span>
                        <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{item.description}</div>
                      {item.performedBy && (
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                          By: {item.performedBy}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
