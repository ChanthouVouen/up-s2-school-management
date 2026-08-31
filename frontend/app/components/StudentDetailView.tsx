import React, { useEffect, useState } from "react";
import {
  fetchStudentById,
  updateStudentStatus,
  Student,
  StudentHistoryItem,
  StudentStatus,
  PaymentStatus,
} from "../services/studentService";
import {
  ArrowLeft,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Calendar,
  History,
  QrCode,
  CreditCard,
  FileText,
  Edit2,
  RefreshCw,
  MapPin,
  User,
  ShieldCheck,
} from "lucide-react";

interface StudentDetailViewProps {
  studentId: number;
  onBack: () => void;
  onEdit?: (student: Student) => void;
}

export default function StudentDetailView({ studentId, onBack, onEdit }: StudentDetailViewProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [histories, setHistories] = useState<StudentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "card" | "documents" | "history">("overview");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchStudentById(studentId);
      setStudent(data);
      setHistories(data.histories || []);
    } catch (err: any) {
      console.error("Failed to load student details:", err);
      setError("Failed to fetch student details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [studentId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!student) return;
    try {
      const updated = await updateStudentStatus(student.id, { status: newStatus });
      setStudent((prev) => (prev ? { ...prev, status: updated.status } : null));
      loadDetails();
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    if (!student) return;
    try {
      const updated = await updateStudentStatus(student.id, { paymentStatus: newPaymentStatus });
      setStudent((prev) => (prev ? { ...prev, paymentStatus: updated.paymentStatus } : null));
      loadDetails();
    } catch (err: any) {
      alert("Failed to update payment status: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#64748b", background: "#fff", borderRadius: 10 }}>
        Loading student profile details...
      </div>
    );
  }

  if (error || !student) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#ef4444", background: "#fff", borderRadius: 10 }}>
        <div>{error || "Student not found"}</div>
        <button
          onClick={onBack}
          style={{
            marginTop: 14,
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* HEADER TOP BAR */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onBack}
            style={{
              padding: "8px 12px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: "#334155",
            }}
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#0f172a" }}>{student.name}</span>
              <span
                style={{
                  padding: "3px 8px",
                  background: "#eff6ff",
                  color: "#2563eb",
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {student.studentCode}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {student.department || "General Department"} &bull; Registered {new Date(student.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={loadDetails}
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
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
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
              <Edit2 size={15} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* QUICK METRICS GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {/* Status Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Enrollment Status</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: student.status === "ENROLLED" ? "#15803d" : "#b45309",
              }}
            >
              {student.status}
            </span>
            <select
              value={student.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 12,
                color: "#0f172a",
                background: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="ENROLLED">ENROLLED</option>
              <option value="PENDING">PENDING</option>
              <option value="GRADUATED">GRADUATED</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {/* Payment Status Card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>Tuition Payment Status</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: student.paymentStatus === "PAID" ? "#3730a3" : "#991b1b",
              }}
            >
              {student.paymentStatus}
            </span>
            <select
              value={student.paymentStatus}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 12,
                color: "#0f172a",
                background: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIAL">PARTIAL</option>
            </select>
          </div>
        </div>

        {/* Audit Logs Count */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "16px 18px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>System History Records</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{histories.length} Events</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Recorded in database audit log</div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "0 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "flex",
          gap: 24,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "overview" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "overview" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <User size={15} /> Overview & Info
        </button>

        <button
          onClick={() => setActiveTab("card")}
          style={{
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "card" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "card" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CreditCard size={15} /> Student Card & QR Code
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          style={{
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "documents" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "documents" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FileText size={15} /> Documents & Applications ({student.documents?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          style={{
            padding: "14px 0",
            border: "none",
            background: "none",
            fontSize: 13,
            fontWeight: 600,
            color: activeTab === "history" ? "#2563eb" : "#64748b",
            borderBottom: activeTab === "history" ? "2px solid #2563eb" : "2px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <History size={15} /> Audit Timeline ({histories.length})
        </button>
      </div>

      {/* TAB CONTENT */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: 24,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Personal Information</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>FULL NAME</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 4 }}>{student.name}</div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>STUDENT CODE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>
                  {student.studentCode}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>EMAIL ADDRESS</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", marginTop: 4 }}>
                  {student.email || "Not provided"}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>PHONE NUMBER</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", marginTop: 4 }}>
                  {student.phone || "Not provided"}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>GENDER</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", marginTop: 4 }}>
                  {student.gender || "Not specified"}
                </div>
              </div>

              <div style={{ padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>DEPARTMENT</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginTop: 4 }}>
                  {student.department || "General"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT CARD & QR CODE PLACEHOLDER */}
        {activeTab === "card" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Student ID Card & QR Code</h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* DIGITAL STUDENT CARD PREVIEW */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  borderRadius: 14,
                  padding: 24,
                  color: "#ffffff",
                  boxShadow: "0 10px 25px -5px rgba(15,23,42,0.4)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#94a3b8" }}>
                    UNIVERSITY STUDENT ID
                  </div>
                  <ShieldCheck size={22} color="#38bdf8" />
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "#38bdf8",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 22,
                    }}
                  >
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>{student.studentCode}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#cbd5e1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <span style={{ color: "#94a3b8", display: "block", fontSize: 10 }}>DEPARTMENT</span>
                    <strong>{student.department || "CS"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#94a3b8", display: "block", fontSize: 10 }}>STATUS</span>
                    <strong style={{ color: "#4ade80" }}>{student.status}</strong>
                  </div>
                </div>
              </div>

              {/* QR CODE CONTAINER */}
              <div
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: 14,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  background: "#f8fafc",
                }}
              >
                <QrCode size={64} color="#3b82f6" style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>QR Code Verification</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, maxWidth: 220 }}>
                  Scan to verify authentic student identification & campus clearance.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS */}
        {activeTab === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Documents & Admission Files</h4>

            {(!student.documents || student.documents.length === 0) &&
            (!student.applications || student.applications.length === 0) ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                No active document submissions or application files uploaded yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {student.documents?.map((doc: any) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 13 }}>{doc.title}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>Type: {doc.type}</div>
                    </div>
                    <span
                      style={{
                        padding: "3px 9px",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: AUDIT TIMELINE */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Full Audit Timeline</h4>

            {histories.length === 0 ? (
              <div style={{ padding: "30px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                No historical logs recorded.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {histories.map((h) => (
                  <div
                    key={h.id}
                    style={{
                      padding: 14,
                      borderRadius: 8,
                      background: "#f8fafc",
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{h.action}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569" }}>{h.description}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Performed By: {h.performedBy || "Admin"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
