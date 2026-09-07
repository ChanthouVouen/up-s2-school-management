import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { FileText, CreditCard, MessageSquare, User, CheckCircle2, Clock, XCircle, Award, Tag, Building } from "lucide-react";
import { fetchMyProfile, type Student } from "../../../services/studentService";
import { reapplyApplication } from "../../../services/applicationService";
import { fetchPublicPartnerSchools } from "../../../services/partnerSchoolService";
import { PROGRAMS } from "../../../constants/programs";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";

const STATUS_BADGE: Record<string, { bg: string; color: string; icon: ReactNode }> = {
  ENROLLED: { bg: "#dcfce7", color: "#16a34a", icon: <CheckCircle2 size={12} /> },
  PENDING: { bg: "#fef9c3", color: "#ca8a04", icon: <Clock size={12} /> },
  GRADUATED: { bg: "#dbeafe", color: "#2563eb", icon: <CheckCircle2 size={12} /> },
  SUSPENDED: { bg: "#fee2e2", color: "#dc2626", icon: <XCircle size={12} /> },
};

const PAYMENT_BADGE: Record<string, { bg: string; color: string }> = {
  PAID: { bg: "#dcfce7", color: "#16a34a" },
  UNPAID: { bg: "#fee2e2", color: "#dc2626" },
  PARTIAL: { bg: "#fef9c3", color: "#ca8a04" },
};

export default function StudentOverview() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reapplyOpen, setReapplyOpen] = useState(false);
  const [reapplyForm, setReapplyForm] = useState({ program: PROGRAMS[0], scholarshipRequested: false, notes: "" });
  const [scholarshipTrack, setScholarshipTrack] = useState<"GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER">("GRADE_A");
  const [partnerSchoolId, setPartnerSchoolId] = useState("");
  const [specialCode, setSpecialCode] = useState("");
  const [partnerSchools, setPartnerSchools] = useState<{ id: number; name: string; city: string | null }[]>([]);
  const [reapplySubmitting, setReapplySubmitting] = useState(false);
  const [reapplyError, setReapplyError] = useState<string | null>(null);

  const loadProfile = () => {
    setLoading(true);
    fetchMyProfile()
      .then(setStudent)
      .catch(() => setError("Couldn't load your profile. Please try again shortly."))
      .finally(() => setLoading(false));
  };

  useEffect(loadProfile, []);

  useEffect(() => {
    if (reapplyOpen && scholarshipTrack === "MOU_PARTNER" && partnerSchools.length === 0) {
      fetchPublicPartnerSchools().then(setPartnerSchools).catch(() => setPartnerSchools([]));
    }
  }, [reapplyOpen, scholarshipTrack]);

  const openReapply = () => {
    setReapplyError(null);
    setReapplyForm({ program: PROGRAMS[0], scholarshipRequested: false, notes: "" });
    setScholarshipTrack("GRADE_A");
    setPartnerSchoolId("");
    setSpecialCode("");
    setReapplyOpen(true);
  };

  const submitReapply = async (event: FormEvent) => {
    event.preventDefault();
    setReapplySubmitting(true);
    setReapplyError(null);
    try {
      await reapplyApplication({
        program: reapplyForm.program,
        scholarshipRequested: reapplyForm.scholarshipRequested,
        scholarshipTrack: reapplyForm.scholarshipRequested ? scholarshipTrack : undefined,
        partnerSchoolId: reapplyForm.scholarshipRequested && scholarshipTrack === "MOU_PARTNER" && partnerSchoolId ? Number(partnerSchoolId) : undefined,
        specialCode: reapplyForm.scholarshipRequested && scholarshipTrack === "SPECIAL_CODE" ? specialCode.trim().toUpperCase() : undefined,
        notes: reapplyForm.notes || undefined,
      });
      setReapplyOpen(false);
      loadProfile();
    } catch (err: any) {
      setReapplyError(err?.response?.data?.message || "Failed to submit your application. Please try again.");
    } finally {
      setReapplySubmitting(false);
    }
  };

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-400">Loading your profile…</p>;
  }
  if (error || !student) {
    return <p className="py-16 text-center text-sm text-red-500">{error || "Profile not found."}</p>;
  }

  const statusBadge = STATUS_BADGE[student.status as string] ?? STATUS_BADGE.PENDING;
  const paymentBadge = PAYMENT_BADGE[student.paymentStatus as string] ?? PAYMENT_BADGE.UNPAID;
  const latestApplication = student.applications?.[0];
  const isRejected = latestApplication?.status === "REJECTED";
  const isApproved = latestApplication?.status === "SCHOOL_APPROVED" || latestApplication?.status === "APPROVED";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User size={26} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Welcome, {student.name.split(" ")[0]}</h1>
              <p className="text-sm text-slate-500">Student code: {student.studentCode}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge bg={statusBadge.bg} color={statusBadge.color} icon={statusBadge.icon}>{student.status}</Badge>
            <Badge bg={paymentBadge.bg} color={paymentBadge.color}>{student.paymentStatus}</Badge>
          </div>
        </div>

        {latestApplication && (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Latest Application</p>
            <p className="mt-1 text-sm text-slate-700">
              <span className="font-semibold">{latestApplication.program}</span> — status:{" "}
              <span className="font-semibold text-blue-600">{latestApplication.status.replaceAll("_", " ")}</span>
            </p>
          </div>
        )}

        {latestApplication && (
          isRejected ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              <p>{latestApplication.approvalResult || "Your application was not approved."}</p>
              <button
                type="button"
                onClick={openReapply}
                className="mt-2 rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Apply Again
              </button>
            </div>
          ) : isApproved ? (
            <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
              Your application has been approved! Pay your tuition balance below to complete enrollment.
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
              Your application is under review. While you wait, you can submit documents and pay your enrollment
              deposit below to speed things along.
            </div>
          )
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/student/documents" className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileText size={18} />
          </span>
          <p className="text-sm font-bold text-slate-900">Submit Documents</p>
          <p className="mt-1 text-xs text-slate-500">{student._count?.documents ?? 0} document(s) submitted for review</p>
        </Link>
        <Link to="/student/payments" className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CreditCard size={18} />
          </span>
          <p className="text-sm font-bold text-slate-900">Pay Fees Online</p>
          <p className="mt-1 text-xs text-slate-500">{student._count?.payments ?? 0} payment(s) made</p>
        </Link>
        <Link to="/student/requests" className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <MessageSquare size={18} />
          </span>
          <p className="text-sm font-bold text-slate-900">Request Information</p>
          <p className="mt-1 text-xs text-slate-500">Ask admissions a question anytime</p>
        </Link>
      </div>

      <Modal isOpen={reapplyOpen} onClose={() => setReapplyOpen(false)} title="Apply Again">
        <form onSubmit={submitReapply} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Desired program</label>
            <select
              value={reapplyForm.program}
              onChange={(e) => setReapplyForm((f) => ({ ...f, program: e.target.value }))}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              {PROGRAMS.map((program) => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          <div className="flex items-start gap-2">
            <input
              id="reapply-scholarship"
              type="checkbox"
              checked={reapplyForm.scholarshipRequested}
              onChange={(e) => setReapplyForm((f) => ({ ...f, scholarshipRequested: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="reapply-scholarship" className="text-sm text-slate-600">
              I'd like to be considered for a scholarship
            </label>
          </div>

          {reapplyForm.scholarshipRequested && (
            <div className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScholarshipTrack("GRADE_A")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                    scholarshipTrack === "GRADE_A" ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm" : "border-slate-200 bg-white/70 text-slate-600"
                  }`}
                >
                  <Award size={18} className={scholarshipTrack === "GRADE_A" ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-xs">Grade A Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScholarshipTrack("SPECIAL_CODE")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                    scholarshipTrack === "SPECIAL_CODE" ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm" : "border-slate-200 bg-white/70 text-slate-600"
                  }`}
                >
                  <Tag size={18} className={scholarshipTrack === "SPECIAL_CODE" ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-xs">Special Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScholarshipTrack("MOU_PARTNER")}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                    scholarshipTrack === "MOU_PARTNER" ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm" : "border-slate-200 bg-white/70 text-slate-600"
                  }`}
                >
                  <Building size={18} className={scholarshipTrack === "MOU_PARTNER" ? "text-blue-600" : "text-slate-400"} />
                  <span className="text-xs">Partner School</span>
                </button>
              </div>

              {scholarshipTrack === "SPECIAL_CODE" && (
                <input
                  type="text"
                  placeholder="Scholarship code"
                  value={specialCode}
                  onChange={(e) => setSpecialCode(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs uppercase tracking-wider text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                />
              )}

              {scholarshipTrack === "MOU_PARTNER" && (
                <select
                  value={partnerSchoolId}
                  onChange={(e) => setPartnerSchoolId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                >
                  <option value="">-- Choose affiliated school / university --</option>
                  {partnerSchools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}{school.city ? `, ${school.city}` : ""}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Anything else? (optional)</label>
            <textarea
              rows={2}
              value={reapplyForm.notes}
              onChange={(e) => setReapplyForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          {reapplyError && <p className="text-sm font-medium text-red-600">{reapplyError}</p>}

          <button
            type="submit"
            disabled={reapplySubmitting}
            className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reapplySubmitting ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
