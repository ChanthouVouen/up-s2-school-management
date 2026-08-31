import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getStoredUser, loginUser, logoutUser } from "../services/authService";
import type { AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  role: AuthUser["role"] | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  hasPermission: (...permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const login = async (email: string, password: string) => {
    const success = await loginUser(email, password);
    if (success) {
      setUser(getStoredUser());
    }
    return success;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      permissions: user?.permissions ?? [],
      isAuthenticated: !!user,
      login,
      logout,
      hasPermission: (...permissions) => permissions.some((p) => user?.permissions?.includes(p)),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
