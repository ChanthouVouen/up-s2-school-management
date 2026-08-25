import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { getStoredUser, loginUser, logoutUser } from "../services/authService";
import type { AuthUser } from "../types/auth.types";

interface AuthContextValue {
  user: AuthUser | null;
  role: AuthUser["role"] | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
      isAuthenticated: !!user,
      login,
      logout,
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
