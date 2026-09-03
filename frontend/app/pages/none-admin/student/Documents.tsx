import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Upload, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { getMyDocuments, submitDocument, type DocumentRecord, type DocumentType } from "../../../services/documentService";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";

const DOCUMENT_TYPES: DocumentType[] = ["ID", "TRANSCRIPT", "DIPLOMA", "CERTIFICATE", "OTHER"];

const STATUS_BADGE: Record<string, { bg: string; color: string; icon: ReactNode }> = {
  PENDING: { bg: "#fef9c3", color: "#ca8a04", icon: <Clock size={12} /> },
  VERIFIED: { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle2 size={12} /> },
  REJECTED: { bg: "#fee2e2", color: "#dc2626", icon: <XCircle size={12} /> },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function StudentDocuments() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("ID");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocuments = () => {
    setLoading(true);
    getMyDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose a file to upload");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const base64 = await fileToBase64(file);
      await submitDocument({ title, type, file: base64 });
      setTitle("");
      setFile(null);
      const fileInput = document.getElementById("doc-file-input") as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      loadDocuments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed. Please try a smaller PDF or image file.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Documents</h1>
        <p className="text-sm text-slate-500">Submit your admission documents for our team to review.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Document title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High School Transcript"
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Document type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as DocumentType)}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">File (PDF, JPG, or PNG)</label>
          <input
            id="doc-file-input"
            required
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload size={15} />
          {submitting ? "Uploading…" : "Submit for Review"}
        </button>
      </form>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table<DocumentRecord>
          loading={loading}
          data={documents}
          rowKey={(row) => row.id}
          emptyMessage="You haven't submitted any documents yet."
          columns={[
            {
              key: "title",
              header: "Document",
              render: (row) => (
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-slate-400" />
                  <span className="font-medium text-slate-700">{row.title}</span>
                </div>
              ),
            },
            { key: "type", header: "Type", render: (row) => row.type },
            {
              key: "status",
              header: "Status",
              render: (row) => {
                const badge = STATUS_BADGE[row.status] ?? STATUS_BADGE.PENDING;
                return <Badge bg={badge.bg} color={badge.color} icon={badge.icon}>{row.status}</Badge>;
              },
            },
            { key: "uploadedAt", header: "Submitted", render: (row) => new Date(row.uploadedAt).toLocaleDateString() },
          ]}
        />
      </div>
    </div>
  );
}
