import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { GraduationCap, CheckCircle2, Copy, ArrowLeft, Award, Tag, Building, Sparkles, Check, Loader2 } from "lucide-react";
import { submitPublicApplication, type ApplyResponse } from "../../../services/applicationService";
import { fetchPublicPartnerSchools } from "../../../services/partnerSchoolService";
import { validateScholarshipCode } from "../../../services/scholarshipService";
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

  // 3 Scholarship Tracks State
  const [scholarshipTrack, setScholarshipTrack] = useState<"GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER">("GRADE_A");
  const [gradeAHighSchool, setGradeAHighSchool] = useState("");
  const [gradeARollNumber, setGradeARollNumber] = useState("");
  const [specialCode, setSpecialCode] = useState("");
  const [specialCodeStatus, setSpecialCodeStatus] = useState<{
    verifying: boolean;
    verified: boolean;
    message: string;
    discountInfo?: string;
  } | null>(null);

  useEffect(() => {
    if (form.scholarshipRequested && scholarshipTrack === "MOU_PARTNER" && partnerSchools.length === 0) {
      fetchPublicPartnerSchools()
        .then(setPartnerSchools)
        .catch(() => setPartnerSchools([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.scholarshipRequested, scholarshipTrack]);

  const handleVerifyCode = async () => {
    if (!specialCode.trim()) return;
    setSpecialCodeStatus({ verifying: true, verified: false, message: "Validating code..." });
    try {
      const res = await validateScholarshipCode(specialCode);
      if (res.valid) {
        setSpecialCodeStatus({
          verifying: false,
          verified: true,
          message: res.message,
          discountInfo: `${res.data?.discountValue}${res.data?.discountType === "PERCENTAGE" ? "%" : "$"} Off`,
        });
      } else {
        setSpecialCodeStatus({
          verifying: false,
          verified: false,
          message: res.message || "Invalid code",
        });
      }
    } catch (err: any) {
      setSpecialCodeStatus({
        verifying: false,
        verified: false,
        message: err?.response?.data?.message || "Invalid or inactive promo code",
      });
    }
  };

  const handleSelectTrack = (track: "GRADE_A" | "SPECIAL_CODE" | "MOU_PARTNER") => {
    setScholarshipTrack(track);
    if (track === "GRADE_A") {
      setSpecialCode("");
      setSpecialCodeStatus(null);
      setForm((f) => ({ ...f, partnerSchoolId: "" }));
    } else if (track === "SPECIAL_CODE") {
      setGradeAHighSchool("");
      setGradeARollNumber("");
      setForm((f) => ({ ...f, partnerSchoolId: "" }));
    } else {
      setGradeAHighSchool("");
      setGradeARollNumber("");
      setSpecialCode("");
      setSpecialCodeStatus(null);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let finalScholarshipDetails = "";
      let finalPartnerSchoolId: number | null = null;

      if (form.scholarshipRequested) {
        if (scholarshipTrack === "GRADE_A") {
          finalScholarshipDetails = `Grade A National Exam Merit: 100% Tuition Waiver (High School: ${gradeAHighSchool || "National Exam"}, Certificate/Roll: ${gradeARollNumber || "Pending Verification"})`;
        } else if (scholarshipTrack === "SPECIAL_CODE") {
          const trimmedCode = specialCode.trim().toUpperCase();
          if (!trimmedCode) {
            setError("Please enter a valid scholarship code.");
            setSubmitting(false);
            return;
          }
          if (specialCodeStatus && !specialCodeStatus.verified) {
            setError(specialCodeStatus.message || "Please enter a valid active scholarship code.");
            setSubmitting(false);
            return;
          }
          finalScholarshipDetails = `Special Scholarship Code: ${trimmedCode} (${specialCodeStatus?.discountInfo || "Voucher Applied"})`;
        } else {
          if (!form.partnerSchoolId) {
            setError("Please select your partner institution.");
            setSubmitting(false);
            return;
          }
          finalPartnerSchoolId = Number(form.partnerSchoolId);
          const selectedSchool = partnerSchools.find((s) => String(s.id) === String(form.partnerSchoolId));
          finalScholarshipDetails = `MOU Partner School: ${selectedSchool?.name || "Partner Institution"}`;
        }
      }

      const response = await submitPublicApplication({
        ...form,
        scholarshipDetails: finalScholarshipDetails || form.scholarshipDetails,
        partnerSchoolId: finalPartnerSchoolId,
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
              <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-blue-900">
                      Select Scholarship Option
                    </label>
                    <span className="text-[11px] font-medium text-slate-500">1 option per student</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectTrack("GRADE_A")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        scholarshipTrack === "GRADE_A"
                          ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <Award size={18} className={scholarshipTrack === "GRADE_A" ? "text-blue-600" : "text-slate-400"} />
                      <span className="text-xs">Grade A Student</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTrack("SPECIAL_CODE")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        scholarshipTrack === "SPECIAL_CODE"
                          ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <Tag size={18} className={scholarshipTrack === "SPECIAL_CODE" ? "text-blue-600" : "text-slate-400"} />
                      <span className="text-xs">Special Code</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectTrack("MOU_PARTNER")}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-all ${
                        scholarshipTrack === "MOU_PARTNER"
                          ? "border-blue-600 bg-white font-semibold text-blue-700 shadow-sm ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      <Building size={18} className={scholarshipTrack === "MOU_PARTNER" ? "text-blue-600" : "text-slate-400"} />
                      <span className="text-xs">Partner School</span>
                    </button>
                  </div>
                </div>

                {/* TRACK 1: GRADE A */}
                {scholarshipTrack === "GRADE_A" && (
                  <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                      <Sparkles size={14} className="text-emerald-600" />
                      100% Tuition Waiver for National Exam Grade A Achievers
                    </div>
                    <p className="text-xs text-emerald-700/80">
                      Upload or present your official Grade A BacII exam diploma during document verification to activate your full scholarship.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Graduating High School Name"
                        value={gradeAHighSchool}
                        onChange={(e) => setGradeAHighSchool(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Exam Roll or Cert No. (optional)"
                        value={gradeARollNumber}
                        onChange={(e) => setGradeARollNumber(e.target.value)}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* TRACK 2: SPECIAL CODE */}
                {scholarshipTrack === "SPECIAL_CODE" && (
                  <div className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900">
                      <Tag size={14} className="text-indigo-600" />
                      Enter Scholarship Voucher or Promo Code
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        value={specialCode}
                        onChange={(e) => {
                          setSpecialCode(e.target.value);
                          setSpecialCodeStatus(null);
                        }}
                        className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs uppercase tracking-wider text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={!specialCode.trim() || specialCodeStatus?.verifying}
                        className="rounded-md bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {specialCodeStatus?.verifying ? <Loader2 size={13} className="animate-spin" /> : "Apply Code"}
                      </button>
                    </div>

                    {specialCodeStatus && (
                      <div
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium ${
                          specialCodeStatus.verified
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border border-red-200 bg-red-50 text-red-700"
                        }`}
                      >
                        {specialCodeStatus.verified ? <Check size={14} className="text-emerald-600" /> : null}
                        <span>{specialCodeStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* TRACK 3: MOU PARTNER SCHOOL */}
                {scholarshipTrack === "MOU_PARTNER" && (
                  <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3.5">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-700">
                        Select Your Partner Institution
                      </label>
                      <select
                        value={form.partnerSchoolId}
                        onChange={(e) => setForm((f) => ({ ...f, partnerSchoolId: e.target.value }))}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
                      >
                        <option value="">-- Choose affiliated school / university --</option>
                        {partnerSchools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.name}{school.city ? `, ${school.city}` : ""}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Applicants from recognized partner institutions are automatically granted agreement discount rates.
                      </p>
                    </div>
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder="Additional notes about your scholarship request (optional)"
                  value={form.scholarshipDetails}
                  onChange={(e) => setForm((f) => ({ ...f, scholarshipDetails: e.target.value }))}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
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
