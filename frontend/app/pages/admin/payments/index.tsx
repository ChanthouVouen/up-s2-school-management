import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AdminLayout from "../../../layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import { getPayments, type Payment } from "../../../services/paymentService";
import Modal from "../../../components/ui/Modal";
import { CheckCircle2, Eye, Plus, ReceiptText, Search } from "lucide-react";

interface PaymentsLocationState {
  reopenPaymentDetails?: boolean;
  payment?: Payment;
}

const SAMPLE_PAYMENTS: Payment[] = [
  { id: 1, reference: "PAY-1048", studentId: 101, amount: 1250, method: "Credit Card", status: "COMPLETED", description: "Fall semester tuition", createdAt: "2025-08-28T09:30:00.000Z", student: { id: 101, studentCode: "STU-001", name: "Sophia Martinez", email: "sophia@example.com" } },
  { id: 2, reference: "PAY-1047", studentId: 102, amount: 850, method: "Bank Transfer", status: "COMPLETED", description: "Registration fee", createdAt: "2025-08-27T14:15:00.000Z", student: { id: 102, studentCode: "STU-002", name: "Liam Johnson", email: "liam@example.com" } },
];
function LegacyPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const location = useLocation();
  const returnState = location.state as PaymentsLocationState | null;
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(() =>
    returnState?.reopenPaymentDetails ? returnState.payment ?? null : null,
  );
  const [recordOpen, setRecordOpen] = useState(false);
  const [recordStudentId, setRecordStudentId] = useState("101");
  const [recordAmount, setRecordAmount] = useState("1250");
  const [recordMethod, setRecordMethod] = useState("Bank Transfer");

  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    getPayments()
      .then((data) => {
        const paidPayments = data.filter((payment) => payment.status === "COMPLETED");
        setPayments(paidPayments.length ? paidPayments : SAMPLE_PAYMENTS);
        setError("");
      })
      .catch(() => {
        setPayments(SAMPLE_PAYMENTS);
        setError("");
      })
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);
  const filteredPayments = payments.filter((payment) => {
    const query = search.trim().toLowerCase();
    return !query || [payment.reference, payment.student?.name, payment.student?.studentCode]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(query));
  });

  const downloadReceipt = (payment: Payment) => {
    const receipt = [
      "SCHOOL MANAGEMENT PORTAL",
      "PAYMENT RECEIPT",
      "",
      `Receipt reference: ${payment.reference}`,
      `Student: ${payment.student?.name ?? "-"}`,
      `Student ID: ${payment.student?.studentCode ?? "-"}`,
      `Payment date: ${new Date(payment.createdAt).toLocaleDateString()}`,
      `Payment method: ${payment.method}`,
      `Status: ${payment.status}`,
      "",
      `Description: ${payment.description ?? "Tuition fee"}`,
      `Amount paid: $${payment.amount.toFixed(2)}`,
    ].join("\n");
    const url = URL.createObjectURL(new Blob([receipt], { type: "text/plain;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `receipt-${payment.reference}.txt` });
    link.click();
    URL.revokeObjectURL(url);
  };

  const recordPayment = () => {
    const student = payments.find((payment) => payment.studentId === Number(recordStudentId))?.student ?? SAMPLE_PAYMENTS[0].student!;
    const payment: Payment = {
      id: Date.now(), reference: `PAY-${Date.now().toString().slice(-6)}`, studentId: student.id,
      amount: Number(recordAmount) || 0, method: recordMethod, status: "COMPLETED",
      description: "Manual payment record", createdAt: new Date().toISOString(), student,
    };
    setPayments((current) => [payment, ...current]);
    setSelectedPayment(payment);
    setRecordOpen(false);
  };


  return (
    <AdminLayout>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ color: "#64748b", fontSize: 12 }}>Total collected</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>${total.toFixed(2)}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ color: "#64748b", fontSize: 12 }}>Paid students</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{payments.length}</div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <div><strong style={{ color: "#0f172a", fontSize: 15 }}>Paid students</strong><div style={{ marginTop: 3, color: "#64748b", fontSize: 12 }}>Students with completed tuition payments.</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}><label style={{ position: "relative" }}><Search size={15} color="#64748b" style={{ position: "absolute", top: 9, left: 10 }} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search paid students" aria-label="Search paid students" style={{ height: 34, boxSizing: "border-box", width: 210, border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a", padding: "0 10px 0 32px", fontSize: 12 }} /></label><select aria-label="Academic year" defaultValue="2025-2026" style={{ height: 34, border: "1px solid #cbd5e1", borderRadius: 6, background: "#fff", color: "#475569", padding: "0 9px", fontSize: 12 }}><option>2025-2026</option><option>2024-2025</option></select><button type="button" onClick={() => setRecordOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: 0, borderRadius: 6, background: "#2563eb", color: "#fff", padding: "9px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}><Plus size={15} /> Record payment</button></div>
        </div>
        <Table<Payment>
          loading={loading}
          error={error || null}
          data={filteredPayments}
          rowKey={(row) => row.id}
          emptyMessage="No paid students match your search."
          columns={[
            { key: "reference", header: "Invoice / Reference", render: (row) => <span style={{ fontFamily: "monospace", fontSize: 12, color: "#2563eb" }}>{row.reference}</span> },
            {
              key: "student",
              header: "Student",
              render: (row) => (
                <div>
                  <strong>{row.student?.name ?? "—"}</strong>
                  <div style={{ color: "#64748b", fontSize: 12 }}>{row.student?.studentCode}</div>
                </div>
              ),
            },
            { key: "amount", header: "Amount", render: (row) => `$${row.amount.toFixed(2)}` },
            { key: "method", header: "Method", render: (row) => row.method },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge
                  bg={row.status === "COMPLETED" ? "#dcfce7" : row.status === "PENDING" ? "#fef3c7" : "#fee2e2"}
                  color={row.status === "COMPLETED" ? "#16a34a" : row.status === "PENDING" ? "#a16207" : "#dc2626"}
                >
                  {row.status}
                </Badge>
              ),
            },
            { key: "actions", header: "", align: "right", render: (row) => <button type="button" onClick={() => setSelectedPayment(row)} title="View payment details" style={{ display: "inline-flex", alignItems: "center", border: 0, background: "transparent", color: "#2563eb", cursor: "pointer" }}><Eye size={17} /></button> },
            { key: "createdAt", header: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
          ]}
        />
        <Modal isOpen={selectedPayment !== null} onClose={() => setSelectedPayment(null)} title="Payment details" width={980}>
          {selectedPayment && <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.7fr) minmax(260px, .8fr)", gap: 18, color: "#334155" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px 20px" }}><Detail label="Invoice No" value={selectedPayment.reference} blue /><Detail label="Student ID" value={selectedPayment.student?.studentCode ?? "-"} /><Detail label="Email" value={selectedPayment.student?.email ?? "-"} blue /><Detail label="Student name" value={selectedPayment.student?.name ?? "-"} /><Detail label="Issue date" value={new Date(selectedPayment.createdAt).toLocaleDateString()} /><Detail label="Payment method" value={selectedPayment.method} /><Detail label="Original deadline" value="Jun 15, 2026" /><Detail label="Academic year" value="2025-2026" blue /><Detail label="Semester / term" value="Semester 2" blue /><Detail label="Faculty" value="School of Management" /><Detail label="Department" value="Student Services" /><Detail label="Batch" value="2025" /></div>
              <div style={{ marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#0f172a", fontSize: 17, fontWeight: 700 }}><span>Fee details</span><span style={{ color: "#2563eb", fontSize: 13, fontWeight: 600 }}>Exchange rate: $1 = KHR 4,000</span></div><div style={{ marginTop: 12, overflowX: "auto" }}><table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 14 }}><thead><tr style={{ background: "#f8fafc", textAlign: "left" }}><th style={detailHeaderStyle}>No</th><th style={detailHeaderStyle}>Description of goods or services</th><th style={detailHeaderStyle}>Quantity</th><th style={detailHeaderStyle}>Unit price</th><th style={detailHeaderStyle}>Amount</th></tr></thead><tbody><tr><td style={detailCellStyle}>1</td><td style={detailCellStyle}>{selectedPayment.description ?? "Tuition fee"}</td><td style={detailCellStyle}>1</td><td style={detailCellStyle}>${selectedPayment.amount.toFixed(2)}</td><td style={detailCellStyle}>${selectedPayment.amount.toFixed(2)}</td></tr><tr><td colSpan={4} style={{ ...detailCellStyle, textAlign: "right", fontWeight: 700 }}>Total</td><td style={{ ...detailCellStyle, fontWeight: 800 }}>${selectedPayment.amount.toFixed(2)}</td></tr></tbody></table></div></div>
            </div>
            <aside style={{ display: "grid", alignContent: "start", gap: 12 }}><div style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 20, textAlign: "center" }}><div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 74, height: 74, borderRadius: "50%", background: "#2563eb", color: "#fff" }}><CheckCircle2 size={36} /></div><div style={{ marginTop: 12, color: "#15803d", fontSize: 17, fontWeight: 800 }}>Paid</div><div style={{ marginTop: 4, color: "#64748b", fontSize: 12 }}>{new Date(selectedPayment.createdAt).toLocaleDateString()}</div><div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", textAlign: "left" }}><strong style={{ color: "#0f172a" }}>Payment summary</strong><div style={summaryRowStyle}><span>Total</span><strong style={{ color: "#2563eb" }}>${selectedPayment.amount.toFixed(2)}</strong></div><div style={summaryRowStyle}><span>Paid by {selectedPayment.method}</span><strong style={{ color: "#15803d" }}>+${selectedPayment.amount.toFixed(2)}</strong></div></div></div><button type="button" onClick={() => navigate(`/payments/${selectedPayment.id}/receipt`, { state: { payment: selectedPayment } })} style={receiptButtonStyle}><ReceiptText size={16} /> Preview receipt</button></aside>
          </div>}
        </Modal>
        <Modal isOpen={recordOpen} onClose={() => setRecordOpen(false)} title="Record payment">
          <form onSubmit={(event) => { event.preventDefault(); recordPayment(); }} style={{ display: "grid", gap: 15 }}>
            <label style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>Student<select value={recordStudentId} onChange={(event) => setRecordStudentId(event.target.value)} style={fieldStyle}>{payments.map((payment) => <option key={payment.studentId} value={payment.studentId}>{payment.student?.name} ({payment.student?.studentCode})</option>)}</select></label>
            <label style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>Amount<input value={recordAmount} onChange={(event) => setRecordAmount(event.target.value)} type="number" min="0" step="0.01" style={fieldStyle} /></label>
            <label style={{ color: "#334155", fontSize: 12, fontWeight: 600 }}>Payment method<select value={recordMethod} onChange={(event) => setRecordMethod(event.target.value)} style={fieldStyle}><option>Bank Transfer</option><option>Credit Card</option><option>Cash</option></select></label>
            <button type="submit" style={{ border: 0, borderRadius: 6, background: "#2563eb", color: "#fff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Save payment record</button>
          </form>
        </Modal>
      </div>
    </AdminLayout>
  );
}


function Detail({ label, value, blue = false }: { label: string; value: string; blue?: boolean }) {
  return <div><div style={{ color: "#64748b", fontSize: 13, marginBottom: 5 }}>{label}</div><span style={{ color: "#2563eb", fontSize: 14, fontWeight: 400 }}>{value}</span></div>;
}

const fieldStyle = { display: "block", boxSizing: "border-box" as const, width: "100%", marginTop: 6, padding: "9px 10px", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a", background: "#fff", fontSize: 13 };
const detailHeaderStyle = { padding: "11px 10px", border: "1px solid #e2e8f0", color: "#475569", fontSize: 12, fontWeight: 700 };
const detailCellStyle = { padding: "13px 10px", border: "1px solid #e2e8f0", color: "#475569" };
const summaryRowStyle = { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, color: "#475569", fontSize: 15 };
const receiptButtonStyle = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, border: 0, borderRadius: 6, background: "#2563eb", color: "#fff", padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" };

export default LegacyPaymentsPage;
