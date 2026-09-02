import React from "react";
import { useNavigate, useParams } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";

const DocumentPreview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

    return (
      <AdminLayout>
    <div className="min-h-screen bg-gray-200">
      {/* Top Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-300 bg-white px-6 py-[18px] sm:flex-row sm:items-center sm:gap-0">
        <div>
          <button
            className="mb-2 border-none bg-transparent p-0 text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate(`/documents/${id}`)}
          >
            ← Back
          </button>

          <h1 className="m-0 text-xl font-bold text-gray-900">
            Student Transcript 2026.pdf
          </h1>
          <p className="mt-1 text-xs text-gray-500">PDF • 2.4 MB</p>
        </div>

        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer">
          ↓ Download
        </button>
      </div>

      {/* PDF Container */}
      <div className="mx-auto my-6 max-w-[1000px] overflow-hidden rounded-lg bg-gray-700">
        {/* PDF Toolbar */}
        <div className="flex h-[55px] items-center justify-between bg-gray-800 px-[18px] text-white">
          <span className="text-sm font-medium">
            Student Transcript 2026.pdf
          </span>

          <div className="flex items-center gap-1">
            <button className="h-7 w-7 rounded border-none bg-gray-600 text-white hover:bg-gray-500 cursor-pointer">
              −
            </button>
            <span className="mx-2 text-sm">100%</span>
            <button className="h-7 w-7 rounded border-none bg-gray-600 text-white hover:bg-gray-500 cursor-pointer">
              +
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex min-h-[700px] justify-center p-2.5 overflow-x-auto sm:p-7">
          <div className="flex min-h-[900px] w-full min-w-[600px] max-w-[700px] items-center justify-center bg-white shadow-lg">
            {/* PDF Placeholder */}
            <div className="p-7 text-center text-gray-500">
              <div className="text-7xl">📄</div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                PDF Document Preview
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Your PDF document will appear here when connected to the
                backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  
    </AdminLayout>
    );
  
};

export default DocumentPreview;
