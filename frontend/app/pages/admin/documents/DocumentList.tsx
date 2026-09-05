import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Check,
  Download,
  Eye,
  FileImage,
  FilePenLine,
  FileSpreadsheet,
  FileText,
  FileType,
  MoreVertical,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import ConfirmModal from "../../../components/users/ConfirmModal";
import {
  deleteDocument,
  DocumentRecord,
  DocumentStatus,
  DocumentType,
  fetchDocuments,
  formatFileSize,
  getDocumentUrl,
  reviewDocument,
  updateDocument,
} from "../../../services/documentService";

const typeLabels: Record<DocumentType, string> = {
  DIPLOMA: "Diploma",
  ID: "ID",
  TRANSCRIPT: "Transcript",
  CERTIFICATE: "Certificate",
  OTHER: "Other",
};

const learningLabels: Record<DocumentStatus, string> = {
  PENDING: "Pending",
  VERIFIED: "Completed",
  REJECTED: "Failed",
};

const menuItemClass =
  "flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50";

const getDocumentIcon = (document: DocumentRecord) => {
  const fileType = document.fileType.toLowerCase();
  const fileName = document.fileName.toLowerCase();
  if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
    return <FileType size={18} className="shrink-0 text-red-500" />;
  }
  if (
    fileType.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/.test(fileName)
  ) {
    return <FileImage size={18} className="shrink-0 text-blue-500" />;
  }
  if (fileType.includes("sheet") || /\.(xls|xlsx|csv)$/.test(fileName)) {
    return <FileSpreadsheet size={18} className="shrink-0 text-green-600" />;
  }
  if (fileType.includes("word") || /\.(doc|docx)$/.test(fileName)) {
    return <FileText size={18} className="shrink-0 text-blue-600" />;
  }
  return <FileText size={18} className="shrink-0 text-slate-400" />;
};

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | DocumentStatus>("");
  const [type, setType] = useState<"" | DocumentType>("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<DocumentRecord | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"VERIFIED" | "REJECTED">(
    "VERIFIED",
  );
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<DocumentRecord | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState<DocumentType>("OTHER");
  const [savingEdit, setSavingEdit] = useState(false);

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

  const users = useMemo(
    () =>
      documents
        .filter((document) => document.student)
        .map((document) => document.student!)
        .filter(
          (student, index, students) =>
            students.findIndex((item) => item.id === student.id) === index,
        )
        .sort((first, second) => first.name.localeCompare(second.name)),
    [documents],
  );

  const visibleDocuments = useMemo(
    () =>
      studentId
        ? documents.filter(
            (document) => String(document.student?.id) === studentId,
          )
        : documents,
    [documents, studentId],
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

  const submitReview = async () => {
    if (!reviewTarget || !reviewComment.trim()) {
      setError("A review comment is required.");
      return;
    }
    setReviewing(true);
    try {
      const updated = await reviewDocument(
        reviewTarget.id,
        reviewStatus,
        reviewComment.trim(),
      );
      setDocuments((items) =>
        items.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
      setReviewTarget(null);
      setReviewComment("");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to save review.");
    } finally {
      setReviewing(false);
    }
  };

  const downloadDocument = (document: DocumentRecord) => {
    const link = window.document.createElement("a");
    link.href = getDocumentUrl(document.fileUrl);
    link.download = document.fileName;
    link.target = "_blank";
    link.click();
    setOpenMenuId(null);
  };

  const openEdit = (document: DocumentRecord) => {
    setEditTarget(document);
    setEditTitle(document.title);
    setEditDescription(document.description || "");
    setEditType(document.type);
    setOpenMenuId(null);
  };

  const saveEdit = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const updated = await updateDocument(editTarget.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        type: editType,
      });
      setDocuments((items) =>
        items.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item,
        ),
      );
      setEditTarget(null);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to update document.");
    } finally {
      setSavingEdit(false);
    }
  };

  const shareDocument = async (document: DocumentRecord) => {
    const link = `${window.location.origin}/documents/${document.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setError("Document link copied to clipboard.");
    } catch {
      setError(`Share link: ${link}`);
    }
    setOpenMenuId(null);
  };

  const retrainDocument = (document: DocumentRecord) => {
    setOpenMenuId(null);
    setError(`AI learning retry queued for "${document.title}".`);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mb-6 flex justify-end">
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            onClick={() => navigate("/documents/upload")}
          >
            <Plus size={16} /> Upload Document
          </button>
        </div>
        {/* <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[["Total Documents", stats.total], ["Pending Review", stats.pending], ["Approved", stats.approved], ["Rejected", stats.rejected]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
              <span className="text-sm text-gray-500">{label}</span>
              <strong className="mt-2 block text-2xl font-bold text-gray-900">{value}</strong>
            </div>
          ))}
        </div> */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4.5 lg:flex-row">
            <input
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
              placeholder="Search documents..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              aria-label="Filter by category"
              value={type}
              onChange={(event) =>
                setType(event.target.value as "" | DocumentType)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by user"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "" | DocumentStatus)
              }
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="VERIFIED">Approved</option>
              <option value="REJECTED">Rejected</option>
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
                    "Document Name",
                    "Document Type",
                    "Uploaded By",
                    "Uploaded On",
                    "AI Learning",
                    "",
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
                ) : visibleDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  visibleDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <div className="flex min-w-55 items-center gap-3">
                          {getDocumentIcon(document)}
                          <div className="min-w-0">
                            <strong className="block truncate font-medium text-gray-900">
                              {document.title}
                            </strong>
                            <small className="text-xs text-gray-400">
                              {document.fileName} ·{" "}
                              {formatFileSize(document.fileSize)}
                            </small>
                          </div>
                        </div>
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
                          className={`inline-flex items-center gap-2 text-xs font-medium ${document.status === "VERIFIED" ? "text-green-700" : document.status === "REJECTED" ? "text-red-600" : "text-amber-700"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${document.status === "VERIFIED" ? "bg-green-500" : document.status === "REJECTED" ? "bg-red-500" : "bg-amber-500"}`}
                          />
                          {learningLabels[document.status]}
                        </span>
                      </td>
                      <td className="relative px-4 py-4 text-right">
                        <button
                          aria-label={`Actions for ${document.title}`}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === document.id ? null : document.id,
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </button>
                        {openMenuId === document.id && (
                          <div className="absolute right-4 top-12 z-20 w-52 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg">
                            <button
                              className={menuItemClass}
                              onClick={() => {
                                navigate(`/documents/${document.id}/preview`);
                                setOpenMenuId(null);
                              }}
                            >
                              <Eye size={15} /> View / Preview
                            </button>
                            <button
                              className={menuItemClass}
                              onClick={() => downloadDocument(document)}
                            >
                              <Download size={15} /> Download
                            </button>
                            <button
                              className={menuItemClass}
                              onClick={() => openEdit(document)}
                            >
                              <FilePenLine size={15} /> Edit Details
                            </button>
                            {/* <button className={menuItemClass} onClick={() => void shareDocument(document)}><Share2 size={15} /> Copy Share Link</button> */}
                            {document.status === "PENDING" && (
                              <>
                                <button
                                  className={`${menuItemClass} text-green-700 hover:bg-green-50`}
                                  onClick={() => {
                                    setReviewTarget(document);
                                    setReviewStatus("VERIFIED");
                                    setReviewComment("");
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Check size={15} /> Approve
                                </button>
                                <button
                                  className={`${menuItemClass} text-red-600 hover:bg-red-50`}
                                  onClick={() => {
                                    setReviewTarget(document);
                                    setReviewStatus("REJECTED");
                                    setReviewComment("");
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <X size={15} /> Reject
                                </button>
                              </>
                            )}
                            {/* <button className={menuItemClass} onClick={() => retrainDocument(document)}><RefreshCw size={15} /> Retrain AI</button> */}
                            <button
                              className={`${menuItemClass} text-red-600 hover:bg-red-50`}
                              onClick={() => {
                                setDocumentToDelete(document);
                                setOpenMenuId(null);
                              }}
                            >
                              <Trash2 size={15} /> Delete
                            </button>
                          </div>
                        )}
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
            Are you sure you want to delete{" "}
            <strong>"{documentToDelete?.title}"</strong>? This action is
            permanent and cannot be undone.
          </>
        }
        confirmText="Yes, Delete Document"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {reviewStatus === "VERIFIED" ? "Approve" : "Reject"} document
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {reviewTarget.title}
                </p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700"
                onClick={() => setReviewTarget(null)}
                aria-label="Close review dialog"
              >
                <X size={18} />
              </button>
            </div>
            <label
              className="mt-5 block text-sm font-semibold text-slate-700"
              htmlFor="list-review-comment"
            >
              Review comment
            </label>
            <textarea
              id="list-review-comment"
              rows={4}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder={
                reviewStatus === "REJECTED"
                  ? "Explain what needs to be corrected..."
                  : "Add a note about this approval..."
              }
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setReviewTarget(null)}
                disabled={reviewing}
              >
                Cancel
              </button>
              <button
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${reviewStatus === "VERIFIED" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                onClick={() => void submitReview()}
                disabled={reviewing || !reviewComment.trim()}
              >
                {reviewing
                  ? "Saving..."
                  : reviewStatus === "VERIFIED"
                    ? "Approve document"
                    : "Reject document"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Edit document details
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update the information shown in the repository.
                </p>
              </div>
              <button
                onClick={() => setEditTarget(null)}
                className="text-slate-400 hover:text-slate-700"
                aria-label="Close edit dialog"
              >
                <X size={18} />
              </button>
            </div>
            <label
              className="mt-5 block text-sm font-semibold text-slate-700"
              htmlFor="edit-document-title"
            >
              Document name
            </label>
            <input
              id="edit-document-title"
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <label
              className="mt-4 block text-sm font-semibold text-slate-700"
              htmlFor="edit-document-type"
            >
              Document type
            </label>
            <select
              id="edit-document-type"
              value={editType}
              onChange={(event) =>
                setEditType(event.target.value as DocumentType)
              }
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            <label
              className="mt-4 block text-sm font-semibold text-slate-700"
              htmlFor="edit-document-description"
            >
              Description
            </label>
            <textarea
              id="edit-document-description"
              rows={4}
              value={editDescription}
              onChange={(event) => setEditDescription(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setEditTarget(null)}
                disabled={savingEdit}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void saveEdit()}
                disabled={savingEdit || !editTitle.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DocumentList;
