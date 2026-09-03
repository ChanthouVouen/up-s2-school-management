import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { FileText, CreditCard, MessageSquare, User, CheckCircle2, Clock, XCircle } from "lucide-react";
import { fetchMyProfile, type Student } from "../../../services/studentService";
import Badge from "../../../components/ui/Badge";

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

  useEffect(() => {
    fetchMyProfile()
      .then(setStudent)
      .catch(() => setError("Couldn't load your profile. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="py-16 text-center text-sm text-slate-400">Loading your profile…</p>;
  }
  if (error || !student) {
    return <p className="py-16 text-center text-sm text-red-500">{error || "Profile not found."}</p>;
  }

  const statusBadge = STATUS_BADGE[student.status as string] ?? STATUS_BADGE.PENDING;
  const paymentBadge = PAYMENT_BADGE[student.paymentStatus as string] ?? PAYMENT_BADGE.UNPAID;
  const latestApplication = student.applications?.[0];

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

        {student.status === "PENDING" && (
          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            Your application is under review. While you wait, you can submit documents and pay your enrollment
            deposit below to speed things along.
          </div>
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
    </div>
  );
}
