import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  DocumentRecord,
  fetchDocument,
  formatFileSize,
  getDocumentUrl,
} from "../../../services/documentService";

const DocumentPreview: React.FC = () => {
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
  const download = () => {
    if (!document) return;
    const link = window.document.createElement("a");
    link.href = getDocumentUrl(document.fileUrl);
    link.download = document.fileName;
    link.target = "_blank";
    link.click();
  };
  const canEmbed =
    document &&
    (document.fileType === "application/pdf" ||
      document.fileType.startsWith("image/"));
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-200">
        <div className="flex items-center justify-between border-b border-gray-300 bg-white px-6 py-4">
          <div>
            <button
              className="mb-2 text-blue-600 hover:underline"
              onClick={() => navigate(`/documents/${id}`)}
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold">
              {document?.title || "Document Preview"}
            </h1>
            {document && (
              <p className="text-xs text-gray-500">
                {document.fileType} · {formatFileSize(document.fileSize)}
              </p>
            )}
          </div>
          <button
            disabled={!document}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold"
            onClick={download}
          >
            Download
          </button>
        </div>
        {error ? (
          <p className="p-6 text-red-700">{error}</p>
        ) : !document ? (
          <p className="p-6">Loading document...</p>
        ) : (
          <div className="mx-auto my-6 max-w-250 overflow-hidden rounded-lg bg-gray-700 p-3">
            {canEmbed ? (
              document.fileType.startsWith("image/") ? (
                <img
                  src={getDocumentUrl(document.fileUrl)}
                  alt={document.title}
                  className="mx-auto max-h-[80vh] max-w-full object-contain"
                />
              ) : (
                <iframe
                  title={document.title}
                  src={getDocumentUrl(document.fileUrl)}
                  className="h-[80vh] w-full bg-white"
                />
              )
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center bg-white p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Preview unavailable for this file type
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Download the file to open it in Microsoft Office or another
                  compatible application.
                </p>
                <button
                  onClick={download}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Download file
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
export default DocumentPreview;
