import { useEffect, useState, type FormEvent } from "react";
import { CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";
import { getMyPayments, checkout, type Payment } from "../../../services/paymentService";
import { ENROLLMENT_FEE } from "../../../constants/fees";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";

export default function StudentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>("UNPAID");
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number>(ENROLLMENT_FEE.amount);
  const [otherAmount, setOtherAmount] = useState(false);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Payment | null>(null);

  const loadPayments = () => {
    setLoading(true);
    getMyPayments()
      .then((res) => {
        setPayments(res.data);
        setPaymentStatus(res.paymentStatus);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadPayments, []);

  const handlePay = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{12,19}$/.test(card.number.replace(/\s/g, ""))) {
      setError("Enter a valid card number (demo — no real card is charged)");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payment = await checkout({ amount, method: "CARD", description: "Tuition / enrollment fee" });
      setSuccess(payment);
      setCard({ number: "", expiry: "", cvc: "" });
      loadPayments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">Pay your fees online — quick and secure.</p>
        </div>
        <Badge bg={paymentStatus === "PAID" ? "#dcfce7" : "#fee2e2"} color={paymentStatus === "PAID" ? "#16a34a" : "#dc2626"}>
          {paymentStatus}
        </Badge>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          Demo checkout — no real payment gateway is connected, no real card is charged.
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-blue-900">{ENROLLMENT_FEE.label}</p>
              <p className="text-lg font-bold text-blue-900">${ENROLLMENT_FEE.amount}</p>
            </div>
            <p className="mt-1 text-xs text-blue-700">{ENROLLMENT_FEE.description}</p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOtherAmount((v) => !v);
              setAmount(ENROLLMENT_FEE.amount);
            }}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            {otherAmount ? "Pay the enrollment fee instead" : "I need to pay a different amount"}
          </button>

          {otherAmount && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount (USD)</label>
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Card number</label>
              <input
                required
                placeholder="4242 4242 4242 4242"
                value={card.number}
                onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry</label>
              <input
                required
                placeholder="MM/YY"
                value={card.expiry}
                onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          {success && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <CheckCircle2 size={15} /> Payment of ${success.amount.toFixed(2)} received — reference {success.reference}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CreditCard size={15} />
            {submitting ? "Processing…" : `Pay $${amount}`}
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table<Payment>
          loading={loading}
          data={payments}
          rowKey={(row) => row.id}
          emptyMessage="No payments yet."
          columns={[
            { key: "reference", header: "Reference", render: (row) => <span className="font-mono text-xs">{row.reference}</span> },
            { key: "amount", header: "Amount", render: (row) => `$${row.amount.toFixed(2)}` },
            { key: "method", header: "Method", render: (row) => row.method },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge bg={row.status === "COMPLETED" ? "#dcfce7" : "#fee2e2"} color={row.status === "COMPLETED" ? "#16a34a" : "#dc2626"}>
                  {row.status}
                </Badge>
              ),
            },
            { key: "createdAt", header: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
          ]}
        />
      </div>
    </div>
  );
}
