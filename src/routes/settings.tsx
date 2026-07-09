import { createFileRoute } from "@/router-compat";
import { useI18n, DISABILITY_KEYS } from "@/lib/i18n";
import { useA11y } from "@/lib/a11y";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import type { DisabilityType } from "@/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const a = useA11y();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(() => user?.name ?? "");
  const [disabilities, setDisabilities] = useState<DisabilityType[]>(
    () => user?.disabilities ?? [],
  );

  const save = useMutation({
    mutationFn: () => updateProfile({ name: fullName, disabilities }),
    onSuccess: () => toast.success(t.save),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t.settingsTitle}</h1>

      <section className="mt-6 rounded-2xl border bg-card p-5 md:p-6">
        <h2 className="font-semibold text-lg">
          {locale === "ar" ? "تفضيلات العرض" : "Display preferences"}
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Label>{t.language}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={locale === "ar" ? "default" : "outline"}
                size="sm"
                onClick={() => setLocale("ar")}
              >
                العربية
              </Button>
              <Button
                type="button"
                variant={locale === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLocale("en")}
              >
                English
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Label>{t.fontSize}</Label>
            <div className="flex gap-1">
              {([100, 115, 130, 150] as const).map((n) => (
                <Button
                  key={n}
                  type="button"
                  variant={a.fontScale === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => a.setFontScale(n)}
                >
                  {n}%
                </Button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between gap-2">
            <span>{t.highContrast}</span>
            <Switch checked={a.highContrast} onCheckedChange={a.setHighContrast} />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Dark mode</span>
            <Switch checked={a.dark} onCheckedChange={a.setDark} />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>{t.reducedMotion}</span>
            <Switch checked={a.reducedMotion} onCheckedChange={a.setReducedMotion} />
          </label>
        </div>
      </section>

      {user && (
        <section className="mt-6 rounded-2xl border bg-card p-5 md:p-6">
          <h2 className="font-semibold text-lg">{locale === "ar" ? "الملف الشخصي" : "Profile"}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <Label htmlFor="fn">{t.auth.name}</Label>
              <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <fieldset>
              <legend className="mb-2 font-semibold">{t.auth.disabilityTitle}</legend>
              <div className="grid grid-cols-2 gap-2">
                {DISABILITY_KEYS.map((d) => (
                  <label
                    key={d}
                    className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background p-3"
                  >
                    <Checkbox
                      checked={disabilities.includes(d)}
                      onCheckedChange={() =>
                        setDisabilities((s) =>
                          s.includes(d) ? s.filter((x) => x !== d) : [...s, d],
                        )
                      }
                    />
                    <span>{t.aud[d]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? t.loading : t.save}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
