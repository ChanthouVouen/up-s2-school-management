import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { getDocuments, updateDocumentStatus, type StudentDocument, type DocumentStatus } from "../../../services/documentService";
import { formatImageUrl } from "../../../services/api";

const STATUS_BADGE: Record<DocumentStatus, { bg: string; color: string; icon: ReactNode }> = {
  PENDING: { bg: "#fef9c3", color: "#ca8a04", icon: <Clock size={12} /> },
  VERIFIED: { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle2 size={12} /> },
  REJECTED: { bg: "#fee2e2", color: "#dc2626", icon: <XCircle size={12} /> },
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [status, setStatus] = useState<DocumentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      setDocuments(await getDocuments(status ? { status } : undefined));
      setError("");
    } catch {
      setError("Documents could not be loaded. Check that the API is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const setDocStatus = async (id: number, next: DocumentStatus) => {
    await updateDocumentStatus(id, next);
    load();
  };

  return (
    <AdminLayout>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as DocumentStatus | "")}
          style={{ minWidth: 180, border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <Table<StudentDocument>
          loading={loading}
          error={error || null}
          data={documents}
          rowKey={(row) => row.id}
          emptyMessage="No documents submitted yet."
          columns={[
            {
              key: "title",
              header: "Document",
              render: (row) =>
                row.fileUrl ? (
                  <a href={formatImageUrl(row.fileUrl)} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, color: "#1d4ed8", fontWeight: 600 }}>
                    <FileText size={15} /> {row.title}
                  </a>
                ) : (
                  <span style={{ fontWeight: 600 }}>{row.title}</span>
                ),
            },
            { key: "type", header: "Type", render: (row) => row.type },
            {
              key: "student",
              header: "Student",
              render: (row) => (
                <div>
                  <strong>{row.student?.name ?? "—"}</strong>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{row.student?.studentCode}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row) => {
                const badge = STATUS_BADGE[row.status];
                return <Badge bg={badge.bg} color={badge.color} icon={badge.icon}>{row.status}</Badge>;
              },
            },
            { key: "createdAt", header: "Submitted", render: (row) => new Date(row.createdAt).toLocaleDateString() },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (row) =>
                row.status === "PENDING" ? (
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <Button variant="danger" onClick={() => setDocStatus(row.id, "REJECTED")}>Reject</Button>
                    <Button variant="primary" onClick={() => setDocStatus(row.id, "VERIFIED")}>Verify</Button>
                  </div>
                ) : null,
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
