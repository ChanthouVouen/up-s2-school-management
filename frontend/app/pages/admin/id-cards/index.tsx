import React, { useEffect, useState } from "react";
import {
  IdCard,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  PlusCircle,
  Ban,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import {
  fetchIdCards,
  generateIdCard,
  revokeIdCard,
  StudentWithIdCard,
  IdCardsResponse,
  OrganizationInfo,
} from "../../../services/idCardService";
import { IdCardPreviewModal } from "./IdCardPreviewModal";
import { Link } from "react-router";

export default function IdCardsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IdCardsResponse | null>(null);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [department, setDepartment] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  // Modals & Action States
  const [previewStudent, setPreviewStudent] = useState<StudentWithIdCard | null>(null);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [revokingId, setRevokingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadIdCards = async () => {
    setLoading(true);
    try {
      const res = await fetchIdCards({
        search,
        statusFilter,
        department,
        page,
        limit: 10,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load ID cards:", err);
      setActionMessage({ type: "error", text: err.response?.data?.message || "Failed to load ID cards data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdCards();
  }, [search, statusFilter, department, page]);

  const handleGenerate = async (student: StudentWithIdCard) => {
    if (!student.isEligible) return;
    setGeneratingId(student.id);
    setActionMessage(null);
    try {
      await generateIdCard(student.id);
      setActionMessage({
        type: "success",
        text: `Successfully generated ID Card for ${student.name}!`,
      });
      await loadIdCards();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to generate ID card.";
      const reasons = err.response?.data?.reasons?.join(" ") || "";
      setActionMessage({ type: "error", text: `${msg} ${reasons}` });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleRevoke = async (student: StudentWithIdCard) => {
    if (!student.idCard) return;
    if (!window.confirm(`Are you sure you want to REVOKE the ID Card for ${student.name}?`)) return;

    setRevokingId(student.id);
    setActionMessage(null);
    try {
      await revokeIdCard(student.id);
      setActionMessage({
        type: "success",
        text: `Revoked ID Card for ${student.name}.`,
      });
      await loadIdCards();
    } catch (err: any) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to revoke ID card.",
      });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 pb-12">
        {/* Status Toast Notification */}
        {actionMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
              actionMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>
        )}

        {/* Filter and Control Bar */}
        <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Left: Search & Department Filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto flex-1">
            {/* Search Input */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search code, name, department..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Department Selector */}
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="English">English</option>
            </select>
          </div>

          {/* Right: Public QR Verification link */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <Link
              to="/verify-card"
              target="_blank"
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck size={15} className="text-blue-600" />
              Public QR Scanner
              <ExternalLink size={12} className="text-slate-400" />
            </Link>

            <button
              onClick={loadIdCards}
              disabled={loading}
              className="p-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-slate-600 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: "ALL", label: "All Students" },
            { id: "GENERATED", label: "Active Cards" },
            { id: "ELIGIBLE", label: "Eligible Pending" },
            { id: "INELIGIBLE", label: "Ineligible" },
            { id: "REVOKED", label: "Revoked" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <RefreshCw size={16} className="animate-spin text-blue-600" />
              Loading ID card records...
            </div>
          ) : !data || data.data.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No student ID card records match your search or filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Academic Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Eligibility</th>
                    <th className="py-3 px-4">ID Card Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.data.map((student) => {
                    const hasCard = !!student.idCard;
                    const cardActive = hasCard && student.idCard?.status === "ACTIVE";
                    const cardRevoked = hasCard && student.idCard?.status === "REVOKED";

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student Details */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{student.name}</div>
                              <div className="font-mono text-[11px] text-slate-500">{student.studentCode}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {student.department || "General"}
                        </td>

                        {/* Academic Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              student.status === "ENROLLED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              student.paymentStatus === "PAID"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {student.paymentStatus}
                          </span>
                        </td>

                        {/* Eligibility */}
                        <td className="py-3 px-4">
                          {student.isEligible ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                              <CheckCircle2 size={13} />
                              Eligible
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-rose-700 text-xs font-semibold cursor-help"
                              title={student.eligibilityReasons.join(" | ")}
                            >
                              <XCircle size={13} />
                              Ineligible
                            </span>
                          )}
                        </td>

                        {/* Card Status */}
                        <td className="py-3 px-4">
                          {cardActive ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-block font-mono">
                              ISSUED ({student.idCard?.cardNumber})
                            </span>
                          ) : cardRevoked ? (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 inline-block">
                              REVOKED
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Not Generated</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview Card Button */}
                            <button
                              onClick={() => setPreviewStudent(student)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-all"
                              title="Preview ID Card"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Generate Button */}
                            {(!cardActive || cardRevoked) && (
                              <button
                                onClick={() => handleGenerate(student)}
                                disabled={!student.isEligible || generatingId === student.id}
                                className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center gap-1 transition-all ${
                                  student.isEligible
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                }`}
                                title={student.isEligible ? "Generate Card" : student.eligibilityReasons.join(" ")}
                              >
                                {generatingId === student.id ? (
                                  <RefreshCw size={13} className="animate-spin" />
                                ) : (
                                  <PlusCircle size={13} />
                                )}
                                Generate
                              </button>
                            )}

                            {/* Revoke Button */}
                            {cardActive && (
                              <button
                                onClick={() => handleRevoke(student)}
                                disabled={revokingId === student.id}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-all"
                                title="Revoke ID Card"
                              >
                                {revokingId === student.id ? (
                                  <RefreshCw size={15} className="animate-spin" />
                                ) : (
                                  <Ban size={15} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} students)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium rounded-md"
                >
                  Previous
                </button>
                <button
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-medium rounded-md"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Preview Modal */}
      {previewStudent && (
        <IdCardPreviewModal
          student={previewStudent}
          organization={organization}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </AdminLayout>
  );
}
