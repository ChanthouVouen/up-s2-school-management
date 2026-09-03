import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { getInquiries, respondToInquiry, type Inquiry } from "../../../services/inquiryService";

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  OPEN: { bg: "#fef9c3", color: "#ca8a04" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb" },
  RESOLVED: { bg: "#dcfce7", color: "#16a34a" },
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Inquiry | null>(null);
  const [response, setResponse] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setInquiries(await getInquiries());
      setError("");
    } catch {
      setError("Requests could not be loaded. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openInquiry = (inquiry: Inquiry) => {
    setActive(inquiry);
    setResponse(inquiry.response || "");
  };

  const sendResponse = async () => {
    if (!active) return;
    await respondToInquiry(active.id, { response, status: "RESOLVED" });
    setActive(null);
    load();
  };

  return (
    <AdminLayout>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading requests...</p>
        ) : error ? (
          <p style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>{error}</p>
        ) : inquiries.length === 0 ? (
          <p style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No requests yet.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                {["From", "Subject", "Status", "Received", ""].map((h) => (
                  <th key={h} style={{ padding: "13px 16px", color: "#64748b", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => {
                const badge = STATUS_BADGE[inquiry.status] ?? STATUS_BADGE.OPEN;
                return (
                  <tr key={inquiry.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: 16 }}>
                      <strong>{inquiry.name}</strong>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{inquiry.email}</div>
                    </td>
                    <td style={{ padding: 16 }}>{inquiry.subject}</td>
                    <td style={{ padding: 16 }}>
                      <Badge bg={badge.bg} color={badge.color}>{inquiry.status.replace("_", " ")}</Badge>
                    </td>
                    <td style={{ padding: 16, color: "#64748b" }}>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 16, textAlign: "right" }}>
                      <Button variant="secondary" onClick={() => openInquiry(inquiry)}>
                        {inquiry.response ? "View" : "Respond"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={!!active} onClose={() => setActive(null)} title={active?.subject || "Request"}>
        {active && (
          <div>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>
              From {active.name} ({active.email}){active.student ? ` — ${active.student.studentCode}` : ""}
            </p>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: 12, marginBottom: 14, fontSize: 13, color: "#334155" }}>
              {active.message}
            </div>
            <label style={{ display: "block", marginBottom: 14, color: "#334155", fontSize: 13, fontWeight: 600 }}>
              Your response
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 6, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 7, fontWeight: 400 }}
              />
            </label>
            <Button variant="primary" icon={<Send size={15} />} onClick={sendResponse} style={{ width: "100%" }}>
              Send &amp; Mark Resolved
            </Button>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
