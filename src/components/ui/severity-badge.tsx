import { useI18n } from "@/lib/i18n";
import type { ReportSeverity } from "@/types";

const TONE: Record<ReportSeverity, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-orange-600 text-white",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-foreground",
};

export function SeverityBadge({ value }: { value: ReportSeverity }) {
  const { t } = useI18n();
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${TONE[value]}`}
      aria-label={`severity: ${value}`}
    >
      <span aria-hidden="true">●</span>
      {t.severity[value]}
    </span>
  );
}
