import { useEffect, useState, type FormEvent } from "react";
import { Send, MessageSquare } from "lucide-react";
import { getMyInquiries, submitInquiry, type Inquiry } from "../../../services/inquiryService";
import Badge from "../../../components/ui/Badge";

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  OPEN: { bg: "#fef9c3", color: "#ca8a04" },
  IN_PROGRESS: { bg: "#dbeafe", color: "#2563eb" },
  RESOLVED: { bg: "#dcfce7", color: "#16a34a" },
};

export default function StudentRequests() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInquiries = () => {
    setLoading(true);
    getMyInquiries()
      .then(setInquiries)
      .finally(() => setLoading(false));
  };

  useEffect(loadInquiries, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry(form);
      setForm({ subject: "", message: "" });
      loadInquiries();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Couldn't send your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Requests</h1>
        <p className="text-sm text-slate-500">Ask admissions a question — we'll reply here.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Subject</label>
          <input
            required
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            placeholder="e.g. Question about my scholarship application"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
          <textarea
            required
            rows={3}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            placeholder="Tell us what you need help with"
            className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
          />
        </div>
        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={15} />
          {submitting ? "Sending…" : "Send Request"}
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">Loading your requests…</p>
        ) : inquiries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">You haven't sent any requests yet.</p>
        ) : (
          inquiries.map((inquiry) => {
            const badge = STATUS_BADGE[inquiry.status] ?? STATUS_BADGE.OPEN;
            return (
              <div key={inquiry.id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-slate-400" />
                    <p className="font-semibold text-slate-800">{inquiry.subject}</p>
                  </div>
                  <Badge bg={badge.bg} color={badge.color}>{inquiry.status.replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-slate-600">{inquiry.message}</p>
                {inquiry.response && (
                  <div className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-blue-500">Admissions replied</p>
                    {inquiry.response}
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-400">{new Date(inquiry.createdAt).toLocaleString()}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
