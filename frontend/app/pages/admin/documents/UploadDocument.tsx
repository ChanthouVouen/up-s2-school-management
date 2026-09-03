import React, { useState } from "react";
import { useNavigate } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  uploadDocument,
  DocumentType,
} from "../../../services/documentService";

const UploadDocument: React.FC = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<DocumentType>("OTHER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);

    if (!documentName) {
      setDocumentName(selectedFile.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a document.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const formData = new FormData();
    formData.append("title", documentName);
    formData.append("type", type);
    formData.append("description", description);
    formData.append("file", file);
    try {
      await uploadDocument(formData);
      navigate("/documents");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to upload document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            className="mb-[15px] border-none bg-transparent p-0 text-sm font-medium text-blue-600 transition-colors hover:underline cursor-pointer"
            onClick={() => navigate("/documents")}
          >
            ← Back
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="max-w-[fit] rounded-xl border border-gray-200 bg-white p-7 shadow-sm"
        >
          {/* Document Name */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Document Name
            </label>
            <input
              type="text"
              placeholder="Enter document name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
            />
          </div>

          {/* Row: Document Type & Category */}
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2">
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Document Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="DIPLOMA">Diploma</option>
                <option value="ID">ID</option>
                <option value="TRANSCRIPT">Transcript</option>
                <option value="CERTIFICATE">Certificate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="Academic">Academic</option>
                <option value="Student Records">Student Records</option>
                <option value="Administration">Administration</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
          </div>

          {/* Drop Zone */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Upload File
            </label>

            <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-500 transition-colors hover:border-blue-400 hover:bg-slate-50">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />

              {!file ? (
                <>
                  <div className="mb-2.5 text-4xl">📁</div>
                  <strong className="mb-1 text-blue-600">
                    Click to upload
                  </strong>
                  <span className="text-sm">
                    or drag and drop your file here
                  </span>
                  <small className="mt-2 text-xs text-gray-400">
                    PDF, DOCX, XLSX, JPG, PNG
                  </small>
                </>
              ) : (
                <>
                  <div className="mb-2.5 text-4xl">📄</div>
                  <strong className="text-gray-800">{file.name}</strong>
                  <span className="text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <small className="mt-2 text-xs text-gray-400">
                    Click to choose another file
                  </small>
                </>
              )}
            </label>
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Enter document description..."
              className="w-full resize-y rounded-lg border border-gray-300 p-3 font-sans text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && (
            <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {/* Form Actions */}
          <div className="flex justify-end gap-2.5 border-t border-gray-200 pt-[10px]">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-[18px] py-[11px] text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/documents")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg border-none bg-blue-600 px-[18px] py-[11px] text-sm font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
            >
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UploadDocument;
