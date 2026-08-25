import { Link } from "react-router";

export default function AdminDashboard() {
  return (
    <div className="container flex min-h-screen flex-col gap-4 p-6">
      <h1 className="text-xl text-blue-400">Admin Dashboard</h1>
      <p className="text-slate-500">This page is only reachable by users with the ADMIN role.</p>
      <Link to="/" className="font-semibold text-blue-600 hover:text-blue-500">
        Back to home
      </Link>
    </div>
  );
}
