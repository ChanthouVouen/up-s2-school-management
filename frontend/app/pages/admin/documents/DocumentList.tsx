import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";

interface DocumentItem {
  id: number;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedDate: string;
  status: "Pending" | "Approved" | "Rejected";
  size: string;
}

const documents: DocumentItem[] = [
  {
    id: 1,
    name: "Student Transcript 2026.pdf",
    type: "PDF",
    category: "Academic",
    uploadedBy: "Admin",
    uploadedDate: "31 Aug 2026",
    status: "Pending",
    size: "2.4 MB",
  },
  {
    id: 2,
    name: "Student ID Card.pdf",
    type: "PDF",
    category: "Student Records",
    uploadedBy: "Chanthou",
    uploadedDate: "30 Aug 2026",
    status: "Approved",
    size: "1.2 MB",
  },
  {
    id: 3,
    name: "Academic Report.xlsx",
    type: "Excel",
    category: "Academic",
    uploadedBy: "Sran",
    uploadedDate: "29 Aug 2026",
    status: "Approved",
    size: "3.8 MB",
  },
  {
    id: 4,
    name: "Student Agreement.pdf",
    type: "PDF",
    category: "Administration",
    uploadedBy: "K'dit",
    uploadedDate: "28 Aug 2026",
    status: "Rejected",
    size: "980 KB",
  },
];

const DocumentList: React.FC = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch =
        document.name.toLowerCase().includes(search.toLowerCase()) ||
        document.category.toLowerCase().includes(search.toLowerCase()) ||
        document.uploadedBy.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || document.status === statusFilter;

      const matchesType = typeFilter === "All" || document.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [search, statusFilter, typeFilter]);

  const getStatusClass = (status: DocumentItem["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        {/* Page Header */}
        <div className="mb-6 flex flex-col items-start justify-end gap-4 sm:flex-row sm:items-center">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            onClick={() => navigate("/documents/upload")}
          >
            + Upload Document
          </button>
        </div>

        {/* Stats Grid */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-[18px]">
            <span className="text-sm text-gray-500">Total Documents</span>
            <strong className="mt-2 block text-2xl font-bold text-gray-900">
              {documents.length}
            </strong>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-[18px]">
            <span className="text-sm text-gray-500">Pending Review</span>
            <strong className="mt-2 block text-2xl font-bold text-gray-900">
              {documents.filter((item) => item.status === "Pending").length}
            </strong>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-[18px]">
            <span className="text-sm text-gray-500">Approved</span>
            <strong className="mt-2 block text-2xl font-bold text-gray-900">
              {documents.filter((item) => item.status === "Approved").length}
            </strong>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-[18px]">
            <span className="text-sm text-gray-500">Rejected</span>
            <strong className="mt-2 block text-2xl font-bold text-gray-900">
              {documents.filter((item) => item.status === "Rejected").length}
            </strong>
          </div>
        </div>

        {/* Main Document Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-gray-200 p-[18px] lg:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2">
              <span className="text-gray-400">⌕</span>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none"
            >
              <option value="All">All Types</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
            </select>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Document
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Type
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Uploaded By
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            📄
                          </div>
                          <div>
                            <strong className="block font-medium text-gray-900">
                              {document.name}
                            </strong>
                            <small className="block text-xs text-gray-400">
                              {document.size}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">{document.type}</td>
                      <td className="px-4 py-4">{document.category}</td>
                      <td className="px-4 py-4">{document.uploadedBy}</td>
                      <td className="px-4 py-4">{document.uploadedDate}</td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                            document.status,
                          )}`}
                        >
                          {document.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            title="Preview"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            onClick={() =>
                              navigate(`/documents/${document.id}/preview`)
                            }
                          >
                            👁
                          </button>

                          <button
                            title="Details"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            onClick={() =>
                              navigate(`/documents/${document.id}`)
                            }
                          >
                            ⋮
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-10 text-center text-sm text-gray-400"
                    >
                      No documents found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DocumentList;
