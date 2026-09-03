import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  DocumentRecord,
  fetchDocument,
  formatFileSize,
  getDocumentUrl,
} from "../../../services/documentService";

const DocumentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) return;
    fetchDocument(Number(id))
      .then(setDocument)
      .catch((err) =>
        setError(err.response?.data?.message || "Unable to load document."),
      );
  }, [id]);
  if (error)
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
  const download = () => {
    const link = window.document.createElement("a");
    link.href = getDocumentUrl(document.fileUrl);
    link.download = document.fileName;
    link.target = "_blank";
    link.click();
  };
  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <button
          className="mb-5 bg-transparent text-blue-600 hover:underline"
          onClick={() => navigate("/documents")}
        >
          ← Back to Documents
        </button>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
            <p className="text-gray-500">Document ID: #{document.id}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold">
            {document.status}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="flex min-h-95 flex-col items-center justify-center text-center">
              <div className="text-7xl">📄</div>
              <h2 className="mt-4 text-xl font-semibold">
                {document.fileName}
              </h2>
              <p className="mb-5 text-gray-500">
                {document.fileType} · {formatFileSize(document.fileSize)}
              </p>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white"
                onClick={() => navigate(`/documents/${document.id}/preview`)}
              >
                Preview Document
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold">Document Information</h2>
            <dl className="divide-y divide-slate-100">
              {[
                ["File Type", document.fileType],
                ["Document Type", document.type],
                ["Student", document.student?.name || "-"],
                ["File Size", formatFileSize(document.fileSize)],
                [
                  "Uploaded Date",
                  new Date(document.uploadedAt).toLocaleString(),
                ],
                [
                  "Reviewed Date",
                  document.reviewedAt
                    ? new Date(document.reviewedAt).toLocaleString()
                    : "-",
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-5 py-3.5">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="text-right font-semibold text-gray-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-500">
            {document.description || "No description provided."}
          </p>
          {document.reviewComment && (
            <p className="mt-4 rounded bg-slate-50 p-3 text-sm">
              Review comment: {document.reviewComment}
            </p>
          )}
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold"
            onClick={download}
          >
            Download
          </button>
          {document.status === "PENDING" && (
            <button
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white"
              onClick={() => navigate(`/documents/${document.id}/review`)}
            >
              Review Document
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
export default DocumentDetail;
