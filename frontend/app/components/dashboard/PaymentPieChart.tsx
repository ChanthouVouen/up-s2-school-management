import { PieChart, Pie, Cell } from "recharts";

export interface PaymentPieChartProps {
  paid: number;
  unpaid: number;
}

export default function PaymentPieChart({ paid, unpaid }: PaymentPieChartProps) {
  const data = [
    { name: "Paid", value: paid, color: "#10b981" },
    { name: "Unpaid", value: unpaid, color: "#ef4444" },
  ];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        padding: "16px 18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
        Paid vs Unpaid Students
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <PieChart width={200} height={180}>
          <Pie
            data={data}
            cx={100}
            cy={85}
            innerRadius={50}
            outerRadius={70}
            dataKey="value"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 4, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
          <span style={{ color: "#334155", fontWeight: 600 }}>Paid ({paid})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
          <span style={{ color: "#334155", fontWeight: 600 }}>Unpaid ({unpaid})</span>
        </div>
      </div>
    </div>
  );
}
