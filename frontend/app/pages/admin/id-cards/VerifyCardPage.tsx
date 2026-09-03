import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  School,
  ArrowLeft,
  RefreshCw,
  QrCode,
} from "lucide-react";
import {
  verifyIdCardToken,
  VerificationResponse,
} from "../../../services/idCardService";

export const VerifyCardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [inputToken, setInputToken] = useState<string>(tokenFromUrl);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [searchedToken, setSearchedToken] = useState<string>("");

  const handleVerify = async (tokenToVerify: string) => {
    if (!tokenToVerify.trim()) return;
    setLoading(true);
    setSearchedToken(tokenToVerify.trim());
    try {
      const res = await verifyIdCardToken(tokenToVerify.trim());
      setResult(res);
    } catch (err: any) {
      if (err.response?.data) {
        setResult(err.response.data);
      } else {
        setResult({
          valid: false,
          status: "NOT_FOUND",
          message: "Unable to verify ID card token. Connection error or server unavailable.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(inputToken);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <QrCode size={14} />
            Official Security Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Student ID Verification
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
            Scan or enter a Student ID Card QR verification token to inspect official academic credentials.
          </p>
        </div>

        {/* Token Input Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="Enter or paste verification token (UUID)..."
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputToken.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25"
            >
              {loading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Verify Token
                </>
              )}
            </button>
          </form>
        </div>

        {/* Verification Result Section */}
        {loading && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center shadow-xl animate-pulse">
            <RefreshCw size={36} className="animate-spin text-indigo-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-slate-300">Checking verification token status in school database...</p>
          </div>
        )}

        {!loading && result && (
          <div className="space-y-6">
            {/* VALID STATUS CARD */}
            {result.valid && result.status === "ACTIVE" && (
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Banner */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-emerald-300">
                      AUTHENTIC & VALID ID CARD
                    </h2>
                    <p className="text-xs text-emerald-400/90 font-medium">
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Organization Header */}
                <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-800">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <School size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wide">
                      {result.organization?.orgName || "UNIVERSITY POLYTECHNIC"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {result.organization?.slogan || "Official Academic Credential Audit"}
                    </p>
                  </div>
                </div>

                {/* Student Details Grid */}
                {result.student && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-28 h-28 rounded-2xl bg-slate-800 border-4 border-emerald-500/30 shadow-xl flex items-center justify-center text-3xl font-bold text-slate-300">
                        {result.student.name.charAt(0)}
                      </div>
                      <span className="mt-3 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                        STATUS: ENROLLED
                      </span>
                    </div>

                    {/* Details */}
                    <div className="sm:col-span-2 space-y-3 text-sm">
                      <div>
                        <span className="text-xs text-slate-500 uppercase font-semibold block">Full Name</span>
                        <span className="text-lg font-bold text-white">{result.student.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block">Student Code</span>
                          <span className="font-mono text-indigo-400 font-bold">{result.student.studentCode}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block">Department</span>
                          <span className="text-slate-200 font-medium">{result.student.department || "General"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block">Card Number</span>
                          <span className="font-mono text-slate-300">{result.idCard?.cardNumber}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 uppercase font-semibold block">Expires On</span>
                          <span className="font-mono text-emerald-400 font-semibold">{formatDate(result.idCard?.expiryDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Timestamp */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> Verified At: {result.verifiedAt ? new Date(result.verifiedAt).toLocaleString() : "Now"}
                  </span>
                  <span className="text-slate-400">Token: {searchedToken.slice(0, 8)}...</span>
                </div>
              </div>
            )}

            {/* REVOKED OR EXPIRED CARD */}
            {(!result.valid || result.status === "REVOKED" || result.status === "EXPIRED") && (
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-500/40 rounded-2xl p-6 md:p-8 shadow-2xl shadow-rose-500/10">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-6">
                  <div className="p-3 bg-rose-500/20 rounded-xl">
                    {result.status === "EXPIRED" ? <AlertTriangle size={32} /> : <XCircle size={32} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-rose-300">
                      {result.status === "EXPIRED" ? "EXPIRED ID CARD" : "INVALID / REVOKED ID CARD"}
                    </h2>
                    <p className="text-xs text-rose-300/90 font-medium">
                      {result.message}
                    </p>
                  </div>
                </div>

                {result.student && (
                  <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student Name:</span>
                      <span className="font-semibold text-white">{result.student.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student Code:</span>
                      <span className="font-mono text-indigo-400">{result.student.studentCode}</span>
                    </div>
                    {result.idCard && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Card Number:</span>
                        <span className="font-mono text-slate-300">{result.idCard.cardNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            to="/id-cards"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
