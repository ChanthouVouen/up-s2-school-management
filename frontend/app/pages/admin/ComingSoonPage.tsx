import AdminLayout from "../../layouts/AdminLayout";

export default function ComingSoonPage() {
  return (
    <AdminLayout>
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "40px 18px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        This section is coming soon.
      </div>
    </AdminLayout>
  );
}
