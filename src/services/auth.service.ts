import { apiRequest } from "./api";
import type { User, Role, DisabilityType } from "@/types";

const KEY = "moyassar.session";

export type Session = { user: User; token: string } | null;

function read(): Session {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function write(s: Session) {
  if (typeof window === "undefined") return;
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
}

export const authService = {
  getSession(): Session {
    return read();
  },

  async signInWithPassword(email: string, password: string): Promise<User> {
    const { user, token } = await apiRequest<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    write({ user, token });
    return user;
  },

  // role بيتحدد من اليوزر وقت التسجيل: "citizen" أو "government_admin"
  async signUp(
    name: string,
    email: string,
    password: string,
    disabilities: DisabilityType[],
    role: Role = "citizen",
  ): Promise<User> {
    const { user, token } = await apiRequest<{ user: User; token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, disabilities, role }),
    });
    write({ user, token });
    return user;
  },

  async signInWithGoogle(): Promise<User> {
    // لسه مش متاح - محتاج إعداد Google OAuth حقيقي في خطوة منفصلة لاحقًا
    throw new Error("تسجيل الدخول بجوجل لسه غير متاح حاليًا.");
  },

  async signOut(): Promise<void> {
    write(null);
  },

  async updateProfile(updates: Partial<Pick<User, "name" | "disabilities">>): Promise<User> {
    const current = read();
    if (!current) throw new Error("لازم تسجّلي الدخول الأول.");

    const { user } = await apiRequest<{ user: User }>("/auth/me", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    write({ user, token: current.token });
    return user;
  },
};
