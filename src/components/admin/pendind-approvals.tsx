import { Check, X, FileWarning } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/severity-badge";
import { EmptyState } from "@/components/empty-state";
import { GOVERNORATES } from "@/mock/governorates";
import type { Report } from "@/types";

/**
 * Pending-approval queue. Approve / Reject are mock-only — they update local
 * state and emit a toast; no service call is made.
 */
export function PendingApprovals({ reports }: { reports: Report[] }) {
  const { t, locale } = useI18n();
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});

  const queue = reports.filter((r) => r.status === "pending" && !decided[r.id]);

  function handle(id: string, kind: "approved" | "rejected") {
    setDecided((d) => ({ ...d, [id]: kind }));
    toast.success(kind === "approved" ? t.admin.reportApproved : t.admin.reportRejected);
  }

  return (
    <section
      aria-labelledby="pending-approvals-heading"
      className="rounded-2xl border bg-card p-4 md:p-6"
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="pending-approvals-heading" className="text-lg font-bold">
          {t.admin.pendingApprovals}
        </h2>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
          {queue.length}
        </span>
      </header>

      <div className="mt-4 overflow-x-auto">
        {queue.length === 0 ? (
          <EmptyState
            title={t.noReports}
            icon={<FileWarning className="size-7" aria-hidden="true" />}
          />
        ) : (
          <table className="w-full min-w-[760px] text-start text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b">
                <th className="px-3 py-2 text-start">{t.admin.reportId}</th>
                <th className="px-3 py-2 text-start">{t.admin.issueType}</th>
                <th className="px-3 py-2 text-start">{t.admin.location}</th>
                <th className="px-3 py-2 text-start">{t.admin.reporter}</th>
                <th className="px-3 py-2 text-start">{locale === "ar" ? "الخطورة" : "Severity"}</th>
                <th className="px-3 py-2 text-end">{locale === "ar" ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((r) => {
                const gov = GOVERNORATES.find((g) => g.key === r.governorate);
                return (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
                    <td className="px-3 py-3">{t.reportCategories[r.category]}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{r.place_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        {locale === "ar" ? gov?.name_ar : gov?.name_en}
                      </div>
                    </td>
                    <td className="px-3 py-3">{r.user_name}</td>
                    <td className="px-3 py-3">
                      <SeverityBadge value={r.severity} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="tap-target gap-1 border-success text-success hover:bg-success/10"
                          onClick={() => handle(r.id, "approved")}
                          aria-label={`${t.admin.approve} ${r.id}`}
                        >
                          <Check className="size-4" aria-hidden="true" />
                          {t.admin.approve}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="tap-target gap-1 border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => handle(r.id, "rejected")}
                          aria-label={`${t.admin.reject} ${r.id}`}
                        >
                          <X className="size-4" aria-hidden="true" />
                          {t.admin.reject}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
