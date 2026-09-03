import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { GraduationCap, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { submitPublicApplication, type ApplyResponse } from "../../../services/applicationService";
import { fetchPublicPartnerSchools } from "../../../services/partnerSchoolService";
import { PROGRAMS } from "../../../constants/programs";

export default function ApplyPage() {
  const [form, setForm] = useState({
    applicantName: "",
    email: "",
    phone: "",
    dob: "",
    program: PROGRAMS[0],
    partnerSchoolId: "",
    scholarshipRequested: false,
    scholarshipDetails: "",
    notes: "",
  });
  const [partnerSchools, setPartnerSchools] = useState<{ id: number; name: string; city: string | null }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApplyResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (form.scholarshipRequested && partnerSchools.length === 0) {
      fetchPublicPartnerSchools()
        .then(setPartnerSchools)
        .catch(() => setPartnerSchools([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.scholarshipRequested]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await submitPublicApplication({
        ...form,
        partnerSchoolId: form.partnerSchoolId ? Number(form.partnerSchoolId) : null,
      });
      setResult(response);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.credentials.tempPassword).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={28} />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Application Submitted!</h1>
            <p className="mt-2 text-sm text-slate-500">
              Reference <span className="font-semibold text-slate-700">{result.applicationCode}</span> · Student code{" "}
              <span className="font-semibold text-slate-700">{result.studentCode}</span>
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="mb-3 text-sm font-semibold text-blue-800">
              We've created your Student Portal — log in now to track your application, submit documents, and pay fees.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{result.credentials.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                <span className="text-slate-500">Temporary password</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-800">{result.credentials.tempPassword}</span>
                  <button type="button" onClick={copyPassword} className="text-blue-600 hover:text-blue-700" aria-label="Copy password">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              {copied && <p className="text-xs font-medium text-emerald-600">Copied to clipboard!</p>}
            </div>
            <p className="mt-3 text-xs text-blue-700">
              Save this password — you can change it after logging in. Keep an eye on your email for updates from admissions.
            </p>
          </div>

          <Link
            to="/login"
            className="mt-6 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Log In to Student Portal
          </Link>
          <Link to="/" className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700">
            <ArrowLeft size={14} /> Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link to="/" className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft size={14} /> Back to homepage
        </Link>

        <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={20} />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Apply for Admission</h1>
              <p className="text-sm text-slate-500">Takes about 2 minutes — no office visit needed.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
              <input
                required
                value={form.applicantName}
                onChange={(e) => setForm((f) => ({ ...f, applicantName: e.target.value }))}
                placeholder="e.g. Sophea Chan"
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">This becomes your Student Portal login.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone (optional)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+855 ..."
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date of birth</label>
              <input
                required
                type="date"
                value={form.dob}
                onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                max={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Desired program</label>
              <select
                value={form.program}
                onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              >
                {PROGRAMS.map((program) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="scholarship"
                type="checkbox"
                checked={form.scholarshipRequested}
                onChange={(e) => setForm((f) => ({ ...f, scholarshipRequested: e.target.checked }))}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="scholarship" className="text-sm text-slate-600">
                I'd like to be considered for a scholarship
              </label>
            </div>

            {form.scholarshipRequested && (
              <div className="space-y-3 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Your current / partner school
                  </label>
                  <select
                    value={form.partnerSchoolId}
                    onChange={(e) => setForm((f) => ({ ...f, partnerSchoolId: e.target.value }))}
                    className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                  >
                    <option value="">Not affiliated with a partner school</option>
                    {partnerSchools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}{school.city ? `, ${school.city}` : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Applicants from our partner schools may be eligible for a partnership discount.
                  </p>
                </div>
                <textarea
                  rows={2}
                  placeholder="Briefly tell us why you're applying for a scholarship"
                  value={form.scholarshipDetails}
                  onChange={(e) => setForm((f) => ({ ...f, scholarshipDetails: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Anything else? (optional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Questions or notes for our admissions team"
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Application"}
            </button>
            <p className="text-center text-xs text-slate-400">
              Already applied? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Log in to your portal</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
