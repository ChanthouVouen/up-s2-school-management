import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import ConfirmModal from "../../../components/users/ConfirmModal";
import {
  deleteDocument,
  DocumentRecord,
  DocumentStatus,
  DocumentType,
  fetchDocuments,
  formatFileSize,
} from "../../../services/documentService";

const statusLabels: Record<DocumentStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Approved",
  REJECTED: "Rejected",
};
const typeLabels: Record<DocumentType, string> = {
  DIPLOMA: "Diploma",
  ID: "ID",
  TRANSCRIPT: "Transcript",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | DocumentStatus>("");
  const [type, setType] = useState<"" | DocumentType>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetchDocuments({
        search: search || undefined,
        status: status || undefined,
        type: type || undefined,
        limit: 100,
      });
      setDocuments(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to load documents.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadDocuments();
  }, [search, status, type]);
  const stats = useMemo(
    () => ({
      total: documents.length,
      pending: documents.filter((item) => item.status === "PENDING").length,
      approved: documents.filter((item) => item.status === "VERIFIED").length,
      rejected: documents.filter((item) => item.status === "REJECTED").length,
    }),
    [documents],
  );
  const handleDelete = async () => {
    if (!documentToDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments((items) =>
        items.filter((item) => item.id !== documentToDelete.id),
      );
      setDocumentToDelete(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to delete document.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-6 flex justify-end">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => navigate("/documents/upload")}
          >
            + Upload Document
          </button>
        </div>
        {/* <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Documents", stats.total],
            ["Pending Review", stats.pending],
            ["Approved", stats.approved],
            ["Rejected", stats.rejected],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <span className="text-sm text-gray-500">{label}</span>
              <strong className="mt-2 block text-2xl font-bold text-gray-900">
                {value}
              </strong>
            </div>
          ))}
        </div> */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4.5 lg:flex-row">
            <input
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | DocumentStatus)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "" | DocumentType)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="m-4 rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {[
                    "Document",
                    "Type",
                    "Student",
                    "Date",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3.5 text-xs font-medium text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <strong className="block font-medium text-gray-900">
                          {document.title}
                        </strong>
                        <small className="text-xs text-gray-400">
                          {document.fileName} ·{" "}
                          {formatFileSize(document.fileSize)}
                        </small>
                      </td>
                      <td className="px-4 py-4">{typeLabels[document.type]}</td>
                      <td className="px-4 py-4">
                        {document.student?.name || "-"}
                      </td>
                      <td className="px-4 py-4">
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${document.status === "VERIFIED" ? "bg-green-100 text-green-700" : document.status === "REJECTED" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"}`}
                        >
                          {statusLabels[document.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            title="Preview"
                            className="rounded-md border border-gray-200 px-2 py-1 hover:bg-gray-50"
                            onClick={() =>
                              navigate(`/documents/${document.id}/preview`)
                            }
                          >
                            View
                          </button>
                          <button
                            title="Delete"
                            className="rounded-md border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                            onClick={() => setDocumentToDelete(document)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={documentToDelete !== null}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={
          <>
            Are you sure you want to delete <strong>"{documentToDelete?.title}"</strong>? This action is permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete Document"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </AdminLayout>
  );
};
export default DocumentList;
