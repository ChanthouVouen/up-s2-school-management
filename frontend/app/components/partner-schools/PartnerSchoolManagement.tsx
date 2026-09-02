import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  RefreshCw,
} from "lucide-react";
import {
  PartnerSchool,
  PartnerSchoolStats,
  fetchPartnerSchools,
  deletePartnerSchool,
  createPartnerSchool,
  updatePartnerSchool,
} from "../../services/partnerSchoolService";
import AddEditPartnerSchoolModal from "./AddEditPartnerSchoolModal";
import ConfirmModal from "../users/ConfirmModal";
import Button from "../ui/Button";

interface PartnerSchoolManagementProps {
  onRegisterAddHandler?: (handler: () => void) => void;
}

export const PartnerSchoolManagement: React.FC<PartnerSchoolManagementProps> = ({
  onRegisterAddHandler,
}) => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState<PartnerSchool[]>([]);
  const [stats, setStats] = useState<PartnerSchoolStats>({
    totalPartners: 0,
    activeMousCount: 0,
    expiringMousCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<PartnerSchool | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadSchools = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPartnerSchools({
        search,
        type: typeFilter,
        status: statusFilter,
        page,
        limit: 10,
      });

      setSchools(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load partner schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    if (onRegisterAddHandler) {
      onRegisterAddHandler(() => {
        setEditingSchool(null);
        setAddEditModalOpen(true);
      });
    }
  }, [onRegisterAddHandler]);

  const promptDelete = (id: number, name: string) => {
    setSchoolToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteSchool = async () => {
    if (!schoolToDelete) return;
    try {
      setDeleting(true);
      await deletePartnerSchool(schoolToDelete.id);
      setDeleteConfirmOpen(false);
      setSchoolToDelete(null);
      loadSchools();
    } catch (err: any) {
      alert("Failed to delete partner school.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSavePartnerSchool = async (data: any) => {
    if (editingSchool) {
      await updatePartnerSchool(editingSchool.id, data);
    } else {
      await createPartnerSchool(data);
    }
    loadSchools();
  };

  // Helper to format MOU Expiration Status Badge
  const getMouBadge = (mou: any) => {
    if (!mou) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const datePart = String(mou.endDate).split("T")[0];
    const [y, m, d] = datePart.split("-").map(Number);
    const endDate = new Date(y, m - 1, d);
    endDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 20,
            background: "#fee2e2",
            color: "#991b1b",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <AlertTriangle size={12} />
          <span>Expired</span>
        </span>
      );
    } else if (diffDays <= 60) {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 20,
            background: "#fef3c7",
            color: "#92400e",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <Clock size={12} />
          <span>Expiring in {diffDays}d</span>
        </span>
      );
    } else {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 20,
            background: "#dcfce7",
            color: "#166534",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={12} />
          <span>Active MOU</span>
        </span>
      );
    }
  };

  const getPartnerTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "HIGH_SCHOOL":
        return { bg: "#eff6ff", color: "#1d4ed8" };
      case "UNIVERSITY":
        return { bg: "#f3e8ff", color: "#7e22ce" };
      case "COMPANY":
        return { bg: "#dcfce7", color: "#15803d" };
      default:
        return { bg: "#ffedd5", color: "#c2410c" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI STATS OVERVIEW CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {/* Total Partners */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>Total Partners</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
              {stats.totalPartners}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>High Schools & Companies</div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#e0e7ff",
              color: "#3730a3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={22} />
          </div>
        </div>

        {/* Active MOUs */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>Active MOUs</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#16a34a", marginTop: 2 }}>
              {stats.activeMousCount}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>Contracts with discount terms</div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#dcfce7",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={22} />
          </div>
        </div>

        {/* Expiring MOUs */}
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b" }}>Expiring MOUs (&lt;60d)</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#d97706", marginTop: 2 }}>
              {stats.expiringMousCount}
            </div>
            <div style={{ fontSize: 11, color: "#d97706", marginTop: 4, fontWeight: 500 }}>
              Requires renewal attention
            </div>
          </div>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "14px 18px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, flexWrap: "wrap" }}>
          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
            <Search
              size={15}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}
            />
            <input
              type="text"
              placeholder="Search partner name, contact, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: "100%",
                padding: "8px 12px 8px 34px",
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                outline: "none",
                background: "#f8fafc",
                color: "#0f172a",
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              outline: "none",
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Partner Types</option>
            <option value="HIGH_SCHOOL">High Schools</option>
            <option value="UNIVERSITY">Universities</option>
            <option value="COMPANY">Corporate Companies</option>
            <option value="ORGANIZATION">NGO / Organizations</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            style={{
              padding: "8px 12px",
              fontSize: 12,
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              outline: "none",
              fontWeight: 500,
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_RENEWAL">PENDING RENEWAL</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f1f5f9", padding: 3, borderRadius: 8 }}>
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "none",
              background: viewMode === "table" ? "#fff" : "transparent",
              color: viewMode === "table" ? "#2563eb" : "#64748b",
              boxShadow: viewMode === "table" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "none",
              background: viewMode === "grid" ? "#fff" : "transparent",
              color: viewMode === "grid" ? "#2563eb" : "#64748b",
              boxShadow: viewMode === "grid" ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* CONTENT: TABLE OR GRID */}
      {loading ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 40,
            border: "1px solid #e2e8f0",
            textAlign: "center",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 8px" }} />
          Loading partner schools...
        </div>
      ) : error ? (
        <div
          style={{
            background: "#fef2f2",
            borderRadius: 12,
            padding: 16,
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : schools.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: 48,
            border: "1px dashed #cbd5e1",
            textAlign: "center",
          }}
        >
          <Building2 size={36} style={{ color: "#cbd5e1", margin: "0 auto 8px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>No Partner Institutions Found</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>Try adjusting your search query or filters.</div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>Partner Name</th>
                <th style={{ padding: "12px 16px" }}>Type</th>
                <th style={{ padding: "12px 16px" }}>Address</th>
                <th style={{ padding: "12px 16px" }}>Contact Person</th>
                <th style={{ padding: "12px 16px" }}>Active MOU Expiration</th>
                <th style={{ padding: "12px 16px" }}>Discount Terms</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => {
                const latestMou = school.mous && school.mous.length > 0 ? school.mous[0] : null;
                const typeStyle = getPartnerTypeBadgeStyle(school.type);

                return (
                  <tr
                    key={school.id}
                    style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            background: "#e0e7ff",
                            color: "#3730a3",
                            fontWeight: 700,
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {school.name.charAt(0)}
                        </div>
                        <div
                          onClick={() => navigate(`/partner-schools/${school.id}`)}
                          style={{ fontWeight: 600, color: "#1e293b", cursor: "pointer" }}
                        >
                          {school.name}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: typeStyle.bg,
                          color: typeStyle.color,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {school.type.replace("_", " ")}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      {school.address || school.city || "—"}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#334155" }}>{school.contactPerson || "—"}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{school.contactPhone || school.contactEmail}</div>
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      {latestMou ? getMouBadge(latestMou) : <span style={{ fontSize: 11, color: "#94a3b8" }}>No active MOU</span>}
                    </td>

                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#4f46e5" }}>
                      {latestMou
                        ? `${latestMou.discountValue}${latestMou.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}`
                        : "Standard Rate"}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <Button
                          variant="icon"
                          title="View Detail Page"
                          onClick={() => navigate(`/partner-schools/${school.id}`)}
                          style={{ color: "#2563eb" }}
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          variant="icon"
                          title="Edit School Profile"
                          onClick={() => {
                            setEditingSchool(school);
                            setAddEditModalOpen(true);
                          }}
                          style={{ color: "#d97706" }}
                        >
                          <Edit2 size={15} />
                        </Button>
                        <Button
                          variant="icon"
                          title="Delete School"
                          onClick={() => promptDelete(school.id, school.name)}
                          style={{ color: "#dc2626", background: "#fee2e2" }}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {schools.map((school) => {
            const latestMou = school.mous && school.mous.length > 0 ? school.mous[0] : null;
            const typeStyle = getPartnerTypeBadgeStyle(school.type);

            return (
              <div
                key={school.id}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: 18,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "#e0e7ff",
                          color: "#3730a3",
                          fontWeight: 700,
                          fontSize: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {school.name.charAt(0)}
                      </div>
                      <div>
                        <div
                          onClick={() => navigate(`/partner-schools/${school.id}`)}
                          style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}
                        >
                          {school.name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: typeStyle.bg,
                          color: typeStyle.color,
                          fontSize: 10,
                          fontWeight: 600,
                        }}
                      >
                        {school.type.replace("_", " ")}
                      </span>
                      {getMouBadge(latestMou) || <span style={{ fontSize: 11, color: "#94a3b8" }}>No active MOU</span>}
                    </div>

                    {(school.address || school.city) && (
                      <div style={{ color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                        <MapPin size={13} style={{ color: "#94a3b8" }} />
                        <span>{school.address || school.city}</span>
                      </div>
                    )}

                    {school.contactPerson && (
                      <div style={{ color: "#334155", display: "flex", alignItems: "center", gap: 4 }}>
                        <Users size={13} style={{ color: "#94a3b8" }} />
                        <span>{school.contactPerson} ({school.contactPhone || school.contactEmail || "N/A"})</span>
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>MOU Discount</span>
                      <span style={{ fontWeight: 700, color: "#4f46e5" }}>
                        {latestMou
                          ? `${latestMou.discountValue}${latestMou.discountType === "PERCENTAGE" ? "% Off" : "$ Off"}`
                          : "Standard Rate"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <button
                    onClick={() => navigate(`/partner-schools/${school.id}`)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#2563eb",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span>View Detail Page & MOUs</span>
                    <ExternalLink size={12} />
                  </button>

                  <div style={{ display: "flex", gap: 4 }}>
                    <Button
                      variant="icon"
                      title="Edit"
                      onClick={() => {
                        setEditingSchool(school);
                        setAddEditModalOpen(true);
                      }}
                      style={{ color: "#d97706" }}
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="icon"
                      title="Delete"
                      onClick={() => promptDelete(school.id, school.name)}
                      style={{ color: "#dc2626", background: "#fee2e2" }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINATION BAR */}
      {totalPages > 1 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            padding: "10px 16px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          <div>
            Page <strong style={{ color: "#0f172a" }}>{page}</strong> of{" "}
            <strong style={{ color: "#0f172a" }}>{totalPages}</strong> (Total {totalCount} partners)
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Previous
            </Button>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddEditPartnerSchoolModal
        isOpen={addEditModalOpen}
        onClose={() => setAddEditModalOpen(false)}
        onSubmit={handleSavePartnerSchool}
        initialData={editingSchool}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteSchool}
        title="Delete Partner Institution"
        message={
          <>
            Are you sure you want to delete partner institution{" "}
            <strong>"{schoolToDelete?.name}"</strong>? This will also remove associated MOUs.
          </>
        }
        confirmText="Delete Partner"
        cancelText="Cancel"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default PartnerSchoolManagement;
