import { useAuth } from "@/lib/auth";
import type { Role } from "@/types";

export function useRole(): Role | null {
  const { user } = useAuth();
  return user?.role ?? null;
}

export function useHasRole(role: Role) {
  return useRole() === role;
}
