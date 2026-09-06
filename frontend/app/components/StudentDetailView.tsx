import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  fetchStudentById,
  updateStudentStatus,
  Student,
  StudentHistoryItem,
  StudentStatus,
  PaymentStatus,
} from "../services/studentService";
import {
  fetchIdCardByStudentId,
  generateIdCard,
} from "../services/idCardService";
import { formatImageUrl } from "../services/api";
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
  ExternalLink,
  PlusCircle,
  School,
  Sparkles,
  Printer,
  Download,
  Lock,
  XCircle,
  Award,
  Tag,
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
  const [activeTab, setActiveTab] = useState<"overview" | "card" | "qr" | "documents">("overview");

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
      {/* HEADER CONTROL BAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "7px 14px",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: "#334155",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <ArrowLeft size={15} /> Back to Directory
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={loadDetails}
            style={{
              padding: "7px 14px",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              style={{
                padding: "7px 16px",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 5px rgba(37,99,235,0.25)",
              }}
            >
              <Edit2 size={14} /> Edit Profile
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

              <div style={{ padding: 16, background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe", gridColumn: "span 2" }}>
                <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Awarded Scholarship & Partner Information</div>
                {(() => {
                  const scholarshipHistory = student.histories?.find((h: any) => h.action === "SCHOLARSHIP_AWARDED");
                  const awardDesc = scholarshipHistory?.description || student.applications?.[0]?.scholarshipDetails || "";

                  if (awardDesc.includes("Grade A")) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: 6 }}>
                          <Award size={18} style={{ color: "#d97706" }} />
                          <span>🏆 National Exam Grade A Merit Scholarship</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#166534", fontWeight: 600 }}>
                          100% Full Tuition Waiver Granted
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          {awardDesc}
                        </div>
                      </div>
                    );
                  }

                  if (awardDesc.includes("Special") || awardDesc.includes("Code") || awardDesc.includes("🎟️")) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#3730a3", display: "flex", alignItems: "center", gap: 6 }}>
                          <Tag size={18} style={{ color: "#4f46e5" }} />
                          <span>🎟️ Special Scholarship / Voucher Code</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          {awardDesc}
                        </div>
                      </div>
                    );
                  }

                  if (student.partnerSchool) {
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                          <Building size={18} style={{ color: "#2563eb" }} />
                          <span>{student.partnerSchool.name}</span>
                        </div>

                        {student.partnerSchool.mous && student.partnerSchool.mous.length > 0 ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, marginTop: 2 }}>
                            <span style={{ fontWeight: 700, color: "#4f46e5", display: "flex", alignItems: "center", gap: 4 }}>
                              🎁 MOU Scholarship: {student.partnerSchool.mous[0].discountValue}
                              {student.partnerSchool.mous[0].discountType === "PERCENTAGE" ? "% Tuition Discount" : "$ Fixed Off"}
                            </span>
                            <span style={{ color: "#64748b" }}>({student.partnerSchool.mous[0].mouTitle})</span>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: "#64748b" }}>Affiliated institution with standard rates.</div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                      Standard Non-Affiliated Student (No scholarship applied).
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT CARD (Card with small QR inside) */}
        {activeTab === "card" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {student.status !== "ENROLLED" || student.paymentStatus !== "PAID" ? (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: 16,
                  padding: "36px 24px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 14,
                  maxWidth: 540,
                  margin: "10px auto",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "#fef3c7",
                    color: "#d97706",
                    border: "1px solid #fde68a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={32} />
                </div>

                <div>
                  <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
                    ID Card Generation Locked
                  </h3>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                    Official Student ID Cards & QR verification codes are issued exclusively to students who have completed enrollment and tuition payments.
                  </p>
                </div>

                {/* Requirements Checklist */}
                <div
                  style={{
                    width: "100%",
                    background: "#f8fafc",
                    borderRadius: 12,
                    padding: "14px 18px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 4,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#475569" }}>1. Enrollment Status (Must be ENROLLED):</span>
                    {student.status === "ENROLLED" ? (
                      <span style={{ color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> Enrolled
                      </span>
                    ) : (
                      <span style={{ color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={16} /> {student.status}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ fontWeight: 600, color: "#475569" }}>2. Tuition Payment Status (Must be PAID):</span>
                    {student.paymentStatus === "PAID" ? (
                      <span style={{ color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> Paid
                      </span>
                    ) : (
                      <span style={{ color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <XCircle size={16} /> {student.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  💡 Change status to <strong>ENROLLED</strong> and payment status to <strong>PAID</strong> above to issue card.
                </div>
              </div>
            ) : (
              <React.Fragment>
                {/* Print CSS */}
            <style>{`
              @media print {
                @page {
                  margin: 15mm;
                  size: auto;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                body * {
                  visibility: hidden;
                }
                #student-id-card-printable, #student-id-card-printable * {
                  visibility: visible;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #student-id-card-printable {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 20px;
                  background: transparent !important;
                }
                .printable-card-bg {
                  background-color: #0f172a !important;
                  background-image: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%) !important;
                  border: 2px solid #6366f1 !important;
                }
                .printable-card-header {
                  background-color: #1e1b4b !important;
                  background-image: linear-gradient(90deg, #1e1b4b 0%, #312e81 100%) !important;
                }
                .printable-card-banner {
                  background-color: #4f46e5 !important;
                  color: #ffffff !important;
                }
                .printable-card-box {
                  background-color: #0f172a !important;
                  border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                .printable-card-footer {
                  background-color: #090d16 !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}</style>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Official Student ID Card</h4>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "7px 16px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Printer size={15} /> Print / Export PDF
                </button>

                {(student as any).idCard?.verificationToken && (
                  <a
                    href={`/verify-card?token=${(student as any).idCard.verificationToken}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#2563eb",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      textDecoration: "none",
                    }}
                  >
                    Verify Online <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            <div id="student-id-card-printable" style={{ display: "flex", justifyContent: "center", width: "100%", padding: "10px 0" }}>
            {/* EXACT VERTICAL STUDENT ID CARD MATCHING SCREENSHOT */}
            <div
              className="printable-card-bg"
              style={{
                position: "relative",
                width: "330px",
                height: "510px",
                background: "#0f172a",
                backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
                borderRadius: "20px",
                border: "2px solid rgba(99, 102, 241, 0.35)",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                userSelect: "none",
                WebkitPrintColorAdjust: "exact",
                printColorAdjust: "exact",
              } as React.CSSProperties}
            >
              {/* Top Header */}
              <div className="printable-card-header" style={{ background: "#1e1b4b", backgroundImage: "linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)", padding: "14px 18px", borderBottom: "1px solid rgba(99, 102, 241, 0.3)", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.25)", border: "1px solid rgba(129, 140, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc" }}>
                  <School size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1.2 }}>
                    UNIVERSITY POLYTECHNIC
                  </h3>
                  <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#a5b4fc", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    EXCELLENCE IN HIGHER EDUCATION
                  </p>
                </div>
              </div>

              {/* Purple Banner */}
              <div className="printable-card-banner" style={{ background: "#4f46e5", padding: "4px 14px", textTransform: "uppercase", textAlign: "center", fontSize: "10.5px", fontWeight: "800", letterSpacing: "1.2px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <Sparkles size={11} style={{ color: "#fde047" }} />
                STUDENT IDENTIFICATION CARD
              </div>

              {/* Body Content */}
              <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, justifyContent: "space-between" }}>
                {/* Photo */}
                <div style={{ position: "relative", marginTop: "2px" }}>
                  <div
                    onClick={() => onEdit && onEdit(student)}
                    title={onEdit ? "Click to change profile picture" : undefined}
                    style={{
                      width: "104px",
                      height: "104px",
                      borderRadius: "18px",
                      border: "4px solid rgba(99, 102, 241, 0.4)",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                      background: "#1e293b",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#94a3b8",
                      fontSize: "36px",
                      fontWeight: "800",
                      cursor: onEdit ? "pointer" : "default",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    {student.photoUrl ? (
                      <img src={formatImageUrl(student.photoUrl)} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      student.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {/* VERIFIED Badge */}
                  <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#052e16", fontWeight: "900", fontSize: "9px", padding: "2px 9px", borderRadius: "9999px", letterSpacing: "1px", textTransform: "uppercase", boxShadow: "0 4px 6px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                    <CheckCircle2 size={10} />
                    VERIFIED
                  </div>
                </div>

                {/* Identity Info */}
                <div style={{ width: "100%", marginTop: "12px", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.3px" }}>
                    {student.name}
                  </h4>
                  <div style={{ display: "inline-block", marginTop: "4px", background: "rgba(99, 102, 241, 0.2)", border: "1px solid rgba(99, 102, 241, 0.4)", padding: "2.5px 11px", borderRadius: "9999px", color: "#c7d2fe", fontSize: "11px", fontFamily: "monospace", fontWeight: "700" }}>
                    {student.studentCode}
                  </div>
                </div>

                {/* Bottom Details + QR Code 2x2 Grid Box */}
                <div className="printable-card-box" style={{ width: "100%", background: "#0f172a", backgroundColor: "#0f172a", padding: "12px 14px", borderRadius: "14px", border: "1px solid rgba(255, 255, 255, 0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", textAlign: "left", flex: 1 }}>
                    <div>
                      <span style={{ fontSize: "8.5px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block" }}>DEPARTMENT</span>
                      <span style={{ fontSize: "11px", color: "#ffffff", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{student.department || "Computer Science"}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "8.5px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block" }}>GENDER</span>
                      <span style={{ fontSize: "11px", color: "#ffffff", fontWeight: "700", display: "block" }}>{student.gender || "Female"}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "8.5px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block" }}>ISSUE DATE</span>
                      <span style={{ fontSize: "10px", color: "#cbd5e1", fontFamily: "monospace", fontWeight: "600", display: "block" }}>Sep 02, 2026</span>
                    </div>
                    <div>
                      <span style={{ fontSize: "8.5px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block" }}>EXPIRY DATE</span>
                      <span style={{ fontSize: "10px", color: "#4ade80", fontFamily: "monospace", fontWeight: "700", display: "block" }}>Sep 02, 2030</span>
                    </div>
                  </div>

                  {/* Embedded QR Code */}
                  {(student as any).idCard?.verificationToken ? (
                    <div style={{ background: "#ffffff", padding: "5px", borderRadius: "9px", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      <QRCodeSVG value={`${window.location.origin}/verify-card?token=${(student as any).idCard.verificationToken}`} size={54} bgColor="#FFFFFF" fgColor="#0F172A" level="L" />
                    </div>
                  ) : (
                    <div style={{ background: "#ffffff", padding: "5px", borderRadius: "9px", flexShrink: 0 }}>
                      <QRCodeSVG value={`${window.location.origin}/verify-card?token=demo`} size={54} bgColor="#FFFFFF" fgColor="#0F172A" level="L" />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Bar */}
              <div className="printable-card-footer" style={{ background: "#090d16", backgroundColor: "#090d16", padding: "8px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "9.5px", color: "#94a3b8", fontFamily: "monospace" }}>
                <span>NO: {(student as any).idCard?.cardNumber || "IDC-2026-" + student.studentCode}</span>
                <span style={{ color: "#a5b4fc", fontWeight: "700" }}>OFFICIAL CARD</span>
              </div>
            </div>
            </div>
          </React.Fragment>
        )}
          </div>
        )}

        {/* TAB 3: STANDALONE QR CODE */}
        {activeTab === "qr" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Student Verification QR Code</h4>
            </div>

            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 16,
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  background: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                  maxWidth: 400,
                  width: "100%",
                }}
              >
                {(student as any).idCard?.verificationToken ? (
                  <>
                    <div style={{ background: "#ffffff", padding: 16, borderRadius: 16, border: "2px solid #e2e8f0", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", marginBottom: 16 }}>
                      <QRCodeSVG
                        value={`${window.location.origin}/verify-card?token=${(student as any).idCard.verificationToken}`}
                        size={180}
                        bgColor="#FFFFFF"
                        fgColor="#0F172A"
                        level="H"
                      />
                    </div>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>{student.name}</div>
                    <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, marginTop: 2 }}>{student.studentCode}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, fontFamily: "monospace" }}>
                      {(student as any).idCard.verificationToken}
                    </div>
                    <a
                      href={`/verify-card?token=${(student as any).idCard.verificationToken}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        marginTop: 16,
                        padding: "8px 18px",
                        background: "#2563eb",
                        color: "#ffffff",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <QrCode size={14} /> Scan & Verify Online
                    </a>
                  </>
                ) : (
                  <>
                    <QrCode size={56} color="#94a3b8" style={{ marginBottom: 14 }} />
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 14 }}>No QR Code Generated</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, maxWidth: 260 }}>
                      Generate an official Student ID Card to issue a scannable verification QR code.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTS */}
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
      </div>
    </div>
  );
}
