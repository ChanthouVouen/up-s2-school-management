import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Printer, CheckCircle, AlertTriangle, ShieldCheck, School, Sparkles } from "lucide-react";
import { StudentWithIdCard, OrganizationInfo } from "../../../services/idCardService";
import { formatImageUrl } from "../../../services/api";

interface IdCardPreviewModalProps {
  student: StudentWithIdCard | null;
  organization?: OrganizationInfo | null;
  onClose: () => void;
  onGenerateSuccess?: () => void;
}

export const IdCardPreviewModal: React.FC<IdCardPreviewModalProps> = ({
  student,
  organization,
  onClose,
}) => {
  if (!student) return null;

  const idCard = student.idCard;
  const orgName = organization?.orgName || "UNIVERSITY POLYTECHNIC";
  const orgSlogan = organization?.slogan || "EXCELLENCE IN HIGHER EDUCATION";
  const orgLogo = organization?.logoUrl;
  const verificationUrl = idCard
    ? `${window.location.origin}/verify-card?token=${idCard.verificationToken}`
    : "";

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Sep 02, 2026";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Print Styles with Explicit Background Fill Rules */}
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
          #printable-id-card, #printable-id-card * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-id-card {
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

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Official Student ID Card
              </h2>
              <p className="text-xs text-slate-400">
                {student.name} ({student.studentCode})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {idCard && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                <Printer size={16} />
                Print / Save PDF
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/50">
          {!idCard ? (
            <div className="text-center py-12 px-4 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">No ID Card Generated Yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                This student does not have an active ID card record in the system.
              </p>
              {student.isEligible ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-medium">
                  Student is ELIGIBLE for card generation!
                </div>
              ) : (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs text-left">
                  <span className="font-semibold block mb-1">Ineligible Requirements:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {student.eligibilityReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div id="printable-id-card" className="py-2">
              {/* VERTICAL ID CARD WITH VERIFIED BADGE & COLOR PRINT CLASSES */}
              <div
                className="printable-card-bg"
                style={{
                  position: "relative",
                  width: "330px",
                  height: "500px",
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
                  {orgLogo ? (
                    <img src={orgLogo} alt="Logo" style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "10px" }} />
                  ) : (
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(99, 102, 241, 0.25)", border: "1px solid rgba(129, 140, 248, 0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc" }}>
                      <School size={20} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: 0, fontSize: "13px", fontWeight: "800", color: "#ffffff", letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1.2 }}>
                      {orgName}
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: "9px", color: "#a5b4fc", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {orgSlogan}
                    </p>
                  </div>
                </div>

                {/* Purple Banner */}
                <div className="printable-card-banner" style={{ background: "#4f46e5", padding: "4px 14px", textTransform: "uppercase", textAlign: "center", fontSize: "10.5px", fontWeight: "800", letterSpacing: "1.2px", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <Sparkles size={11} style={{ color: "#fde047" }} />
                  STUDENT IDENTIFICATION CARD
                </div>

                {/* Body Content */}
                <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, justifyContent: "space-between" }}>
                  {/* Photo */}
                  <div style={{ position: "relative", marginTop: "4px" }}>

                    <div style={{ width: "100px", height: "100px", borderRadius: "18px", border: "4px solid rgba(99, 102, 241, 0.4)", boxShadow: "0 10px 25px rgba(0,0,0,0.4)", background: "#1e293b", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "36px", fontWeight: "800" }}>
                      {student.photoUrl ? (
                        <img src={formatImageUrl(student.photoUrl)} alt={student.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        student.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* VERIFIED Badge */}
                    <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", background: "#22c55e", color: "#052e16", fontWeight: "900", fontSize: "9px", padding: "2px 9px", borderRadius: "9999px", letterSpacing: "1px", textTransform: "uppercase", boxShadow: "0 4px 6px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "3px", whiteSpace: "nowrap" }}>
                      <CheckCircle size={10} />
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
                        <span style={{ fontSize: "10px", color: "#cbd5e1", fontFamily: "monospace", fontWeight: "600", display: "block" }}>{formatDate(idCard.issueDate)}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: "8.5px", textTransform: "uppercase", color: "#94a3b8", fontWeight: "700", display: "block" }}>EXPIRY DATE</span>
                        <span style={{ fontSize: "10px", color: "#4ade80", fontFamily: "monospace", fontWeight: "700", display: "block" }}>{formatDate(idCard.expiryDate)}</span>
                      </div>
                    </div>

                    {/* Embedded QR Code */}
                    <div style={{ background: "#ffffff", padding: "5px", borderRadius: "9px", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      <QRCodeSVG value={verificationUrl} size={54} bgColor="#FFFFFF" fgColor="#0F172A" level="L" />
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="printable-card-footer" style={{ background: "#090d16", backgroundColor: "#090d16", padding: "8px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "9.5px", color: "#94a3b8", fontFamily: "monospace" }}>
                  <span>NO: {idCard.cardNumber}</span>
                  <span style={{ color: "#a5b4fc", fontWeight: "700" }}>OFFICIAL CARD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
