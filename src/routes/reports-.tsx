import { createFileRoute, Link } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { FileWarning } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { reportsService } from "@/services/reports.service";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { SeverityBadge } from "@/components/severity-badge";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();
  const { data } = useQuery({
    queryKey: ["my-reports", user?.id],
    queryFn: () => reportsService.mine(user!.id),
    enabled: !!user,
  });

  if (loading) return <div className="p-10 text-center">{t.loading}</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <Button asChild>
          <Link to="/auth">{t.nav.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">{t.nav.myReports}</h1>
        <Button asChild>
          <Link to="/report">+ {t.nav.report}</Link>
        </Button>
      </div>
      {data && data.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {data.map((r) => (
            <li key={r.id} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h2 className="font-semibold">{r.title}</h2>
                <div className="flex items-center gap-2">
                  <SeverityBadge value={r.severity} />
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {t.statuses[r.status]}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{r.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
              </p>
              {r.admin_note && (
                <p className="mt-2 rounded-md bg-muted p-2 text-xs">
                  <strong>{locale === "ar" ? "ملاحظة الإدارة:" : "Admin note:"}</strong>{" "}
                  {r.admin_note}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-6"
          title={t.noReports}
          icon={<FileWarning className="size-7" />}
        />
      )}
    </div>
  );
}
