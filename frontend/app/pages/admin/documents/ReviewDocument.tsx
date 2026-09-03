import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  DocumentRecord,
  fetchDocument,
  getDocumentUrl,
  reviewDocument,
} from "../../../services/documentService";

const ReviewDocument: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!id) return;
    fetchDocument(Number(id))
      .then(setDocument)
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load document."),
      );
  }, [id]);
  const submitReview = async (status: "VERIFIED" | "REJECTED") => {
    if (!comment.trim()) {
      setError("A review comment is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await reviewDocument(Number(id), status, comment.trim());
      navigate(`/documents/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to save review.");
    } finally {
      setSaving(false);
    }
  };
  if (error && !document)
    return (
      <AdminLayout>
        <div className="p-6 text-red-700">{error}</div>
      </AdminLayout>
    );
  if (!document)
    return (
      <AdminLayout>
        <div className="p-6">Loading document...</div>
      </AdminLayout>
    );
  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          className="mb-5 text-blue-600 hover:underline"
          onClick={() => navigate(`/documents/${id}`)}
        >
          ← Back to Document
        </button>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Document</h1>
            <p className="text-gray-500">{document.title}</p>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold">
            {document.status}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-3 text-white">
              <span className="text-sm">{document.fileName}</span>
              <button
                className="rounded bg-gray-700 px-3 py-1.5 text-xs"
                onClick={() => navigate(`/documents/${id}/preview`)}
              >
                Full Preview
              </button>
            </div>
            <iframe
              title={document.title}
              src={getDocumentUrl(document.fileUrl)}
              className="h-175 w-full"
            />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Review</h2>
            <dl className="divide-y divide-slate-100">
              {[
                ["Type", document.type],
                ["Student", document.student?.name || "-"],
                ["Uploaded", new Date(document.uploadedAt).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <label className="mb-2 mt-5 block text-sm font-semibold">
              Review Comment
            </label>
            <textarea
              rows={7}
              className="w-full rounded-lg border border-gray-300 p-3"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                disabled={saving}
                className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                onClick={() => void submitReview("REJECTED")}
              >
                Reject
              </button>
              <button
                disabled={saving}
                className="rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50"
                onClick={() => void submitReview("VERIFIED")}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default ReviewDocument;
