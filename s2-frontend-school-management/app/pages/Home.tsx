import { useNavigate, Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container flex min-h-screen flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl text-blue-400">Hello, {user?.name ?? "there"}!</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
        >
          Log out
        </button>
      </div>

      <p className="text-slate-500">Signed in as {user?.email} ({role})</p>

      {role === "ADMIN" && (
        <Link to="/admin" className="font-semibold text-blue-600 hover:text-blue-500">
          Go to Admin Dashboard
        </Link>
      )}
    </div>
  );
}
