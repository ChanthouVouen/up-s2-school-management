import { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import Badge from "../../../components/ui/Badge";
import Table from "../../../components/ui/Table";
import { getPayments, type Payment } from "../../../services/paymentService";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPayments()
      .then((data) => {
        setPayments(data);
        setError("");
      })
      .catch(() => setError("Payments could not be loaded. Check that the API is running."))
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminLayout>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ color: "#64748b", fontSize: 12 }}>Total collected</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>${total.toFixed(2)}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ color: "#64748b", fontSize: 12 }}>Transactions</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>{payments.length}</div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
        <Table<Payment>
          loading={loading}
          error={error || null}
          data={payments}
          rowKey={(row) => row.id}
          emptyMessage="No payments recorded yet."
          columns={[
            { key: "reference", header: "Reference", render: (row) => <span style={{ fontFamily: "monospace", fontSize: 12 }}>{row.reference}</span> },
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
                <Badge bg={row.status === "COMPLETED" ? "#dcfce7" : "#fee2e2"} color={row.status === "COMPLETED" ? "#16a34a" : "#dc2626"}>
                  {row.status}
                </Badge>
              ),
            },
            { key: "createdAt", header: "Date", render: (row) => new Date(row.createdAt).toLocaleDateString() },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
