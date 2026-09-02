import React from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";

const DocumentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

    return (
      <AdminLayout>
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Back Button */}
      <button
        className="mb-5 bg-transparent text-blue-600 font-medium hover:underline cursor-pointer"
        onClick={() => navigate("/documents")}
      >
        ← Back to Documents
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-gray-900">
            Student Transcript 2026
          </h1>
          <p className="m-0 text-gray-500">Document ID: #{id}</p>
        </div>

        <span className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-700">
          Pending
        </span>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        {/* Preview Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
            <div className="text-7xl">📄</div>
            <h2 className="mb-1 mt-4 text-xl font-semibold text-gray-900">
              Student Transcript 2026.pdf
            </h2>
            <p className="mb-5 text-gray-500">PDF • 2.4 MB</p>

            <button
              className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
              onClick={() => navigate(`/documents/${id}/preview`)}
            >
              👁 Preview Document
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mt-0 text-lg font-semibold text-gray-900">
            Document Information
          </h2>

          <div className="divide-y divide-slate-100">
            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">Document Name</span>
              <strong className="text-right text-gray-900">
                Student Transcript 2026
              </strong>
            </div>

            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">File Type</span>
              <strong className="text-right text-gray-900">PDF</strong>
            </div>

            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">Category</span>
              <strong className="text-right text-gray-900">Academic</strong>
            </div>

            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">File Size</span>
              <strong className="text-right text-gray-900">2.4 MB</strong>
            </div>

            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">Uploaded By</span>
              <strong className="text-right text-gray-900">Admin</strong>
            </div>

            <div className="flex justify-between gap-5 py-3.5">
              <span className="text-gray-500">Uploaded Date</span>
              <strong className="text-right text-gray-900">31 Aug 2026</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="mt-5 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mt-0 text-lg font-semibold text-gray-900">
          Description
        </h2>
        <p className="mt-2 text-gray-500 leading-relaxed">
          Student academic transcript for academic year 2026. This document
          contains the student's academic results and information.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex justify-end gap-2.5">
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">
          ↓ Download
        </button>

        <button
          className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 cursor-pointer"
          onClick={() => navigate(`/documents/${id}/review`)}
        >
          Review Document
        </button>
      </div>
    </div>
            </AdminLayout>
            );
};

export default DocumentDetail;
