/**
 * Mock API layer.
 *
 * All services return Promises with a simulated latency so the UI renders
 * loading states naturally. To swap in a real Node/Express REST API later,
 * replace `mockRequest` with `fetch` calls; nothing else in the app needs
 * to change.
 *
 *   import { http } from "./api";
 *   return http<Place[]>("/api/places", { method: "GET" });
 */

export function mockRequest<T>(data: T, delayMs = 200): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delayMs);
  });
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

// بيرجع Authorization header لو فيه توكن مخزّن من قبل (بعد تسجيل الدخول)
function authHeader(): Record<string, string> {
  try {
    const raw = localStorage.getItem("moyassar.session");
    if (!raw) return {};
    const session = JSON.parse(raw) as { token?: string } | null;
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

// الاتصال الحقيقي بالباك إند - بيستخدمها الآن auth.service.ts بس
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init?.headers ?? {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

// زي apiRequest بس لرفع الملفات (FormData) - من غير Content-Type يدوي عشان
// المتصفح يحط الـ boundary الصحيح لوحده
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { ...authHeader() },
    body: formData,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(res.status, message);
  }

  return body as T;
}
