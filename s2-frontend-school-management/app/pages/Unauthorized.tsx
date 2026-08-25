import { Link } from "react-router";

export default function Unauthorized() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-slate-800">403 - Access denied</h1>
      <p className="text-slate-500">You don't have permission to view this page.</p>
      <Link to="/" className="font-semibold text-blue-600 hover:text-blue-500">
        Back to home
      </Link>
    </div>
  );
}
