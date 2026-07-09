import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Prefs = {
  fontScale: 100 | 115 | 130 | 150;
  highContrast: boolean;
  reducedMotion: boolean;
  dark: boolean;
};
type Ctx = Prefs & {
  setFontScale: (n: Prefs["fontScale"]) => void;
  setHighContrast: (b: boolean) => void;
  setReducedMotion: (b: boolean) => void;
  setDark: (b: boolean) => void;
};

const A11yCtx = createContext<Ctx | null>(null);
const KEY = "moyassar.a11y";

function readStoredPrefs(): Partial<Prefs> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
  } catch {
    return {};
  }
}

export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(() => ({
    fontScale: 100,
    highContrast: false,
    reducedMotion: false,
    dark: false,
    ...readStoredPrefs(),
  }));

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--font-scale", String(prefs.fontScale / 100));
    root.classList.toggle("hc", prefs.highContrast);
    root.classList.toggle("dark", prefs.dark);
    root.classList.toggle("reduce-motion", prefs.reducedMotion);
    localStorage.setItem(KEY, JSON.stringify(prefs));
  }, [prefs]);

  const value: Ctx = {
    ...prefs,
    setFontScale: (n) => setPrefs((p) => ({ ...p, fontScale: n })),
    setHighContrast: (b) => setPrefs((p) => ({ ...p, highContrast: b })),
    setReducedMotion: (b) => setPrefs((p) => ({ ...p, reducedMotion: b })),
    setDark: (b) => setPrefs((p) => ({ ...p, dark: b })),
  };
  return <A11yCtx.Provider value={value}>{children}</A11yCtx.Provider>;
}

export function useA11y() {
  const ctx = useContext(A11yCtx);
  if (!ctx) throw new Error("useA11y must be used within A11yProvider");
  return ctx;
}
