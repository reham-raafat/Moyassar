import { createFileRoute } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Trophy, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { statsService } from "@/services/stats.service";

export const Route = createFileRoute("/rankings")({
  component: RankingsPage,
});

function RankingsPage() {
  const { t, locale } = useI18n();
  const { data: rows = [] } = useQuery({
    queryKey: ["ranking"],
    queryFn: () => statsService.governorateRanking(),
  });

  const top = rows.slice(0, 3);
  const urgent = [...rows].sort((a, b) => a.avg_score - b.avg_score).slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t.rankings.title}</h1>
      <p className="mt-1 text-muted-foreground">{t.rankings.subtitle}</p>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel icon={<Trophy className="size-5" />} tone="success" title={t.rankings.top}>
          <ul className="mt-3 space-y-2">
            {top.map((g, i) => (
              <li
                key={g.key}
                className="flex items-center justify-between rounded-xl border bg-background p-3"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="grid size-7 place-items-center rounded-full bg-success/15 text-success text-xs font-bold">
                    {i + 1}
                  </span>
                  {locale === "ar" ? g.name_ar : g.name_en}
                </span>
                <span className="font-mono font-bold">{g.avg_score}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          icon={<AlertTriangle className="size-5" />}
          tone="destructive"
          title={t.rankings.urgent}
        >
          <ul className="mt-3 space-y-2">
            {urgent.map((g, i) => (
              <li
                key={g.key}
                className="flex items-center justify-between rounded-xl border bg-background p-3"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <span className="grid size-7 place-items-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                    {i + 1}
                  </span>
                  {locale === "ar" ? g.name_ar : g.name_en}
                </span>
                <span className="font-mono font-bold">{g.avg_score}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="mt-6 overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[640px] text-start text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b">
              <th className="px-3 py-3 text-start">#</th>
              <th className="px-3 py-3 text-start">{t.filterGovernorate}</th>
              <th className="px-3 py-3 text-start">{t.rankings.score}</th>
              <th className="px-3 py-3 text-start">{t.rankings.accessiblePlaces}</th>
              <th className="px-3 py-3 text-start">{t.rankings.reportsCount}</th>
              <th className="px-3 py-3 text-start">{t.rankings.trend}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((g, i) => {
              const pct = g.total_places
                ? Math.round((g.accessible_places / g.total_places) * 100)
                : 0;
              return (
                <tr key={g.key} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-3 py-3 font-mono">{i + 1}</td>
                  <td className="px-3 py-3 font-semibold">
                    {locale === "ar" ? g.name_ar : g.name_en}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${g.avg_score}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold">{g.avg_score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {g.accessible_places} / {g.total_places}{" "}
                    <span className="text-xs text-muted-foreground">({pct}%)</span>
                  </td>
                  <td className="px-3 py-3">{g.reports_count}</td>
                  <td className="px-3 py-3">
                    {g.trend === "up" ? (
                      <TrendingUp className="size-4 text-success" aria-label="up" />
                    ) : g.trend === "down" ? (
                      <TrendingDown className="size-4 text-destructive" aria-label="down" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground" aria-label="flat" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Panel({
  icon,
  title,
  children,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone: "success" | "destructive";
}) {
  const cls =
    tone === "success" ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive";
  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <span className={`grid size-9 place-items-center rounded-xl ${cls}`} aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
