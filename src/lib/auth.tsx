import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { authService } from "@/services/auth.service";
import type { User, Role, DisabilityType } from "@/types";

type Ctx = {
  user: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (name: string, email: string, password: string, disabilities: DisabilityType[], role: Role) => Promise<void>;
signOut: () => Promise<void>;
  updateProfile: (u: Partial<Pick<User, "name" | "disabilities">>) => Promise<void>;
};
const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => authService.getSession()?.user ?? null);
  const [loading] = useState(false);

  const refresh = useCallback(() => {
    const s = authService.getSession();
    setUser(s?.user ?? null);
  }, []);

  const value: Ctx = {
    user,
    loading,
    signInWithPassword: async (e, p) => {
      await authService.signInWithPassword(e, p);
      refresh();
    },
    signInWithGoogle: async () => {
      await authService.signInWithGoogle();
      refresh();
    },
   signUp:             async (n, e, p, d, r) => { await authService.signUp(n, e, p, d, r); refresh(); },
signOut:            async () => { await authService.signOut(); setUser(null); },
    updateProfile: async (u) => {
      await authService.updateProfile(u);
      refresh();
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
