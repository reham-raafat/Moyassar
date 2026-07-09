import { createFileRoute, Link, useNavigate } from "@/router-compat";
import { useState, type FormEvent } from "react";
import { User as UserIcon, Building2 } from "lucide-react";
import { useI18n, DISABILITY_KEYS } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { DisabilityType, Role } from "@/types";
import logoFull from "@/assets/logo-full.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t, locale } = useI18n();
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<Role | null>(null);
  const [disabilities, setDisabilities] = useState<DisabilityType[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleDis(d: DisabilityType) {
    setDisabilities((s) => s.includes(d) ? s.filter((x) => x !== d) : [...s, d]);
  }

  async function finishSignUp(role: Role) {
    setLoading(true);
    try {
      await auth.signUp(name, email, password, disabilities, role);
      toast.success(locale === "ar" ? "تم إنشاء الحساب" : "Account created");
      navigate({ to: role === "government_admin" ? "/admin/dashboard" : "/dashboard" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function chooseAccountType(role: Role) {
    setAccountType(role);
    if (role === "government_admin") {
      finishSignUp(role);
    } else {
      setStep(3);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "signin") {
      setLoading(true);
      try {
        await auth.signInWithPassword(email, password);
        toast.success(locale === "ar" ? "تم تسجيل الدخول" : "Signed in");
        navigate({ to: "/dashboard" });
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 1) { setStep(2); return; }
    if (step === 3) { await finishSignUp(accountType ?? "citizen"); }
  }

  async function signInGoogle() {
    try {
      await auth.signInWithGoogle();
      toast.success(locale === "ar" ? "تم تسجيل الدخول" : "Signed in");
      navigate({ to: "/dashboard" });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <img src={logoFull} alt={t.appName} className="mx-auto mb-6 h-32 w-auto object-contain" />
      <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold">{mode === "signin" ? t.auth.signIn : t.auth.signUp}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>

        <Button type="button" variant="outline" className="mt-6 w-full tap-target" onClick={signInGoogle}>
          {t.auth.google}
        </Button>

        <div className="my-5 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> {locale === "ar" ? "أو" : "or"} <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && step === 1 && (
            <div>
              <Label htmlFor="name">{t.auth.name}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </div>
          )}
          {step === 1 && (
            <>
              <div>
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
              </div>
              <div>
                <Label htmlFor="pw">{t.auth.password}</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} />
              </div>
            </>
          )}
          {mode === "signup" && step === 2 && (
            <fieldset>
              <legend className="mb-1 font-semibold">{t.auth.accountTypeTitle}</legend>
              <p className="mb-3 text-sm text-muted-foreground">{t.auth.accountTypeDesc}</p>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => chooseAccountType("citizen")}
                  className="flex items-start gap-3 rounded-xl border bg-background p-4 text-start hover:bg-accent/10 tap-target"
                >
                  <UserIcon className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{t.auth.citizenLabel}</span>
                    <span className="block text-sm text-muted-foreground">{t.auth.citizenDesc}</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => chooseAccountType("government_admin")}
                  className="flex items-start gap-3 rounded-xl border bg-background p-4 text-start hover:bg-accent/10 tap-target"
                >
                  <Building2 className="mt-0.5 size-5 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-semibold">{t.auth.governmentLabel}</span>
                    <span className="block text-sm text-muted-foreground">{t.auth.governmentDesc}</span>
                  </span>
                </button>
              </div>
            </fieldset>
          )}

          {mode === "signup" && step === 3 && (
            <fieldset>
              <legend className="mb-2 font-semibold">{t.auth.disabilityTitle}</legend>
              <div className="grid grid-cols-2 gap-2">
                {DISABILITY_KEYS.map((d) => (
                  <label key={d} className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background p-3 hover:bg-accent/10">
                    <Checkbox checked={disabilities.includes(d)} onCheckedChange={() => toggleDis(d)} />
                    <span>{t.aud[d]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {!(mode === "signup" && step === 2) && (
            <Button type="submit" className="w-full tap-target" disabled={loading}>
              {loading ? t.loading : mode === "signup" && step === 1 ? t.auth.continue : mode === "signin" ? t.auth.signIn : t.auth.signUp}
            </Button>
          )}
        </form>

        <p className="mt-6 text-center text-sm">
          {mode === "signin" ? t.auth.noAccount : t.auth.hasAccount}{" "}
          <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setStep(1); }} className="font-semibold text-primary hover:underline">
            {mode === "signin" ? t.auth.signUp : t.auth.signIn}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:underline">{locale === "ar" ? "العودة للرئيسية" : "Back to home"}</Link>
        </p>
      </div>
    </div>
  );
}