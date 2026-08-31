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
  status: StudentStatus.ENROLLED,
  paymentStatus: PaymentStatus.UNPAID,
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

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter, paymentFilter, departmentFilter, page]);

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
    status: (student.status as StudentStatus) || StudentStatus.ENROLLED,
    paymentStatus: (student.paymentStatus as PaymentStatus) || PaymentStatus.UNPAID,
  });

  const handleOpenEditModal = async (student: Student) => {
    setSelectedStudent(student);
    setEditFormData(toEditFormData(student));
    setIsEditModalOpen(true);

    try {
      const full = await fetchStudentById(student.id);
      setSelectedStudent(full);
      setEditFormData(toEditFormData(full));
    } catch (err) {
      console.error("Error fetching full student details for edit:", err);
    }
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
          {stu.studentCode}
        </span>
      ),
    },
    {
      key: "name",
      header: "Student Name",
      render: (stu) => (
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
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (stu) => <span style={{ color: "#475569" }}>{stu.department || "Unassigned"}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (stu) => {
        const badge = getStatusBadgeStyle(stu.status as string);
        return (
          <Badge bg={badge.bg} color={badge.color} icon={badge.icon}>
            {stu.status}
          </Badge>
        );
      },
    },
    {
      key: "payment",
      header: "Payment",
      render: (stu) => {
        const badge = getPaymentBadgeStyle(stu.paymentStatus as string);
        return (
          <Badge bg={badge.bg} color={badge.color}>
            {stu.paymentStatus}
          </Badge>
        );
      },
    },
    {
      key: "joined",
      header: "Joined Date",
      render: (stu) => (
        <span style={{ color: "#64748b", fontSize: 12 }}>
          {new Date(stu.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (stu) => (
        <div style={{ display: "inline-flex", gap: 6 }}>
          <Button variant="icon" title="View Details" onClick={() => setViewingDetailId(stu.id)} style={{ color: "#3b82f6" }}>
            <Eye size={14} />
          </Button>
          {canUpdate && (
            <Button variant="icon" title="Edit Student" onClick={() => handleOpenEditModal(stu)} style={{ color: "#d97706" }}>
              <Edit2 size={14} />
            </Button>
          )}
          {canDelete && (
            <Button
              variant="icon"
              title="Delete Student"
              onClick={() => promptDeleteConfirmation(stu.id, stu.name, stu.studentCode)}
              style={{ color: "#dc2626", background: "#fee2e2" }}
            >
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
      {toast && <Toast type={toast.type} message={toast.message} />}

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
            style={{ ...fieldInputStyle, padding: "8px 12px 8px 36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{ ...fieldInputStyle, width: "auto", padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
          >
            <option value="">All Statuses</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="PENDING">Pending</option>
            <option value="GRADUATED">Graduated</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            style={{ ...fieldInputStyle, width: "auto", padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
          >
            <option value="">All Payment Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIAL">Partial</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            style={{ ...fieldInputStyle, width: "auto", padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Software Engineering">Software Engineering</option>
            <option value="English">English</option>
          </select>

          <Button variant="secondary" icon={<RefreshCw size={14} />} onClick={loadStudents}>
            Refresh
          </Button>

          {canCreate && (
            <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
              Add Student
            </Button>
          )}
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

        <Table
          columns={columns}
          data={students}
          rowKey={(stu) => stu.id}
          loading={loading}
          error={error}
          emptyMessage="No student records found matching your filters."
        />

        <Pagination page={page} totalPages={totalPages} totalItems={totalStudents} onPageChange={setPage} />
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
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register New Student">
        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Student Code (Leave blank to auto-generate)">
            <input
              type="text"
              placeholder="e.g. STU-2026-005"
              value={addFormData.studentCode}
              onChange={(e) => setAddFormData({ ...addFormData, studentCode: e.target.value })}
              style={fieldInputStyle}
            />
          </FormField>

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

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Student"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      {selectedStudent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Student (${selectedStudent.studentCode})`}
        >
          <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormField label="Full Name *">
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={fieldInputStyle}
              />
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
            </div>

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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? "Updating..." : "Update Student"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
