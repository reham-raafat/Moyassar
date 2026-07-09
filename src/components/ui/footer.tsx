import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-foreground">
            {t.appName} — {t.tagline}
          </div>
          <div>© {new Date().getFullYear()}</div>
        </div>
        <p className="mt-2 text-xs">{t.footer}</p>
      </div>
    </footer>
  );
}
