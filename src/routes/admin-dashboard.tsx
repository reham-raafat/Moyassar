import { createFileRoute, Link } from "@/router-compat";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Download,
  ShieldCheck,
  Users,
  UserPlus,
  Activity,
  Percent,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useI18n, REPORT_STATUS_KEYS, SEVERITY_KEYS } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { placesService } from "@/services/places.service";
import { statsService } from "@/services/stats.service";
import { reportsService } from "@/services/reports.service";
import { activityService } from "@/services/activity.service";
import { GOVERNORATES } from "@/mock/governorates";
import { MapView } from "@/components/map-view";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SeverityBadge } from "@/components/severity-badge";
import { EmptyState } from "@/components/empty-state";
import { PendingApprovals } from "@/components/admin/pending-approvals";
import { UsersDisabilityChart } from "@/components/admin/users-disability-chart";
import { ReportsDualLine } from "@/components/admin/reports-dual-line";
import { DistrictHeatmap } from "@/components/admin/district-heatmap";
import type { ReportSeverity, ReportStatus, Place } from "@/types";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

const PIE_COLORS = ["#2E7D32", "#FF9800", "#D32F2F", "#0F4C81"];

function scoreTone(score: number): "green" | "yellow" | "red" {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function AdminDashboardPage() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filterGov, setFilterGov] = useState<string>("all");
  const [filterSev, setFilterSev] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => statsService.dashboard(),
  });
  const { data: places = [] } = useQuery({
    queryKey: ["admin-places"],
    queryFn: () => placesService.all(),
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["admin-reports", filterGov, filterSev, filterStatus],
    queryFn: () =>
      reportsService.list({
        governorate: filterGov === "all" ? undefined : filterGov,
        severity: filterSev === "all" ? undefined : (filterSev as ReportSeverity),
        status: filterStatus === "all" ? undefined : (filterStatus as ReportStatus),
      }),
  });
  const { data: activity = [] } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => activityService.recent(15),
  });
  const { data: govChart = [] } = useQuery({
    queryKey: ["admin-gov-chart"],
    queryFn: () => statsService.byGovernorate(),
  });
  const { data: problems = [] } = useQuery({
    queryKey: ["admin-problems"],
    queryFn: () => statsService.commonProblems(),
  });
  const { data: distro = [] } = useQuery({
    queryKey: ["admin-distro"],
    queryFn: () => statsService.scoreDistribution(),
  });
  const { data: usersDis = [] } = useQuery({
    queryKey: ["admin-users-disability"],
    queryFn: () => statsService.usersByDisability(),
  });
  const { data: dualTrend = [] } = useQuery({
    queryKey: ["admin-dual-trend"],
    queryFn: () => statsService.reportsTrendDual(),
  });
  const { data: catBars = [] } = useQuery({
    queryKey: ["admin-cat-bars"],
    queryFn: () => statsService.reportsByCategory(),
  });
  const { data: density = [] } = useQuery({
    queryKey: ["admin-density"],
    queryFn: () => statsService.districtDensity(),
  });
  const { data: pending = [] } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => reportsService.list({ status: "pending" }),
  });

  const queryClient = useQueryClient();
  const fetching = useIsFetching({
    predicate: (q) => typeof q.queryKey[0] === "string" && q.queryKey[0].startsWith("admin-"),
  });
  const refresh = () =>
    void queryClient.invalidateQueries({
      predicate: (q) => typeof q.queryKey[0] === "string" && q.queryKey[0].startsWith("admin-"),
    });

  const markers = useMemo(
    () =>
      places.map((p: Place) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.name_ar,
        tone: scoreTone(p.score_overall),
      })),
    [places],
  );

  if (loading) return <div className="p-10 text-center">{t.loading}</div>;
  if (!user || user.role !== "government_admin") {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <ShieldCheck className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-3 text-xl font-bold">
          {locale === "ar" ? "غير مصرّح" : "Not authorized"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {locale === "ar"
            ? "هذه اللوحة للإدارة الحكومية فقط. استخدم محوّل الدور للتجربة."
            : "Use the dev role switcher to preview."}
        </p>
        <Button asChild className="mt-4">
          <Link to="/">{t.nav.home}</Link>
        </Button>
      </div>
    );
  }

  function exportCsv() {
    const rows = [
      ["id", "title", "governorate", "category", "severity", "status", "created_at"],
      ...reports.map((r) => [
        r.id,
        r.title,
        r.governorate,
        r.category,
        r.severity,
        r.status,
        r.created_at,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="rounded-3xl bg-gradient-to-l from-primary to-secondary p-6 text-primary-foreground md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider opacity-80">
              {t.roles.government_admin}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{t.admin.title}</h1>
            <p className="mt-1 opacity-90">{t.admin.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={refresh}
              variant="secondary"
              size="sm"
              className="gap-2"
              disabled={fetching > 0}
              aria-label={t.admin.refresh}
            >
              <RefreshCw
                className={`size-4 ${fetching > 0 ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              {fetching > 0 ? t.admin.refreshing : t.admin.refresh}
            </Button>
            <Button onClick={exportCsv} variant="secondary" size="sm" className="gap-2">
              <Download className="size-4" />
              {t.admin.exportCsv}
            </Button>
          </div>
        </div>
      </header>

      {/* KPI cards — places + reports */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.admin.totalPlaces}
          value={stats?.total_places ?? 0}
          Icon={Building2}
          tone="primary"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.accessiblePlaces}
          value={stats?.accessible_places ?? 0}
          Icon={CheckCircle2}
          tone="success"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.inaccessiblePlaces}
          value={stats?.inaccessible_places ?? 0}
          Icon={AlertTriangle}
          tone="warning"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.pendingReports}
          value={stats?.pending_reports ?? 0}
          Icon={FileWarning}
          tone="destructive"
          loading={!stats}
        />
      </section>

      {/* KPI cards — users + resolution */}
      <section className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.admin.totalUsers}
          value={stats?.total_users ?? 0}
          Icon={Users}
          tone="primary"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.activeUsers}
          value={stats?.active_users ?? 0}
          Icon={Activity}
          tone="success"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.newUsersMonth}
          value={stats?.new_users_this_month ?? 0}
          Icon={UserPlus}
          tone="warning"
          loading={!stats}
        />
        <KpiCard
          label={t.admin.resolutionRate}
          value={`${stats?.resolution_rate ?? 0}%`}
          Icon={Percent}
          tone="success"
          loading={!stats}
        />
      </section>

      {/* Pending approvals queue */}
      <div className="mt-6">
        <PendingApprovals reports={pending} />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">{t.admin.overview}</TabsTrigger>
          <TabsTrigger value="reports">{t.admin.reportsTable}</TabsTrigger>
          <TabsTrigger value="analytics">{t.admin.analytics}</TabsTrigger>
          <TabsTrigger value="activity">{t.admin.activity}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <section className="rounded-2xl border bg-card p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{t.admin.mapTitle}</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={showHeatmap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHeatmap((v) => !v)}
                >
                  {t.admin.heatmap}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="font-semibold">{t.admin.legend}:</span>
              <span className="inline-flex items-center gap-1">
                <span className="size-3 rounded-full bg-success" />
                {t.admin.accessible}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-3 rounded-full bg-accent" />
                {t.admin.partial}
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-3 rounded-full bg-destructive" />
                {t.admin.inaccessible}
              </span>
            </div>
            <div className="mt-3">
              <MapView
                markers={markers}
                heatmap={showHeatmap}
                cluster
                className="h-[520px] w-full rounded-xl border"
              />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <section className="rounded-2xl border bg-card p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">{t.admin.reportsTable}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={filterGov} onValueChange={setFilterGov}>
                  <SelectTrigger className="h-9 w-40" aria-label={t.filterGovernorate}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.allGovernorates}</SelectItem>
                    {GOVERNORATES.map((g) => (
                      <SelectItem key={g.key} value={g.key}>
                        {locale === "ar" ? g.name_ar : g.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterSev} onValueChange={setFilterSev}>
                  <SelectTrigger className="h-9 w-36" aria-label="severity">
                    <SelectValue placeholder="severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {locale === "ar" ? "كل المستويات" : "All severities"}
                    </SelectItem>
                    {SEVERITY_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {t.severity[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-9 w-36" aria-label="status">
                    <SelectValue placeholder="status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {locale === "ar" ? "كل الحالات" : "All statuses"}
                    </SelectItem>
                    {REPORT_STATUS_KEYS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {t.statuses[k]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {reports.length === 0 ? (
                <EmptyState title={t.noReports} icon={<FileWarning className="size-7" />} />
              ) : (
                <table className="w-full min-w-[700px] text-start text-sm">
                  <thead className="text-xs uppercase tracking-wider text-muted-foreground">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-start">{t.title}</th>
                      <th className="px-3 py-2 text-start">{t.filterGovernorate}</th>
                      <th className="px-3 py-2 text-start">
                        {locale === "ar" ? "الفئة" : "Category"}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {locale === "ar" ? "الخطورة" : "Severity"}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {locale === "ar" ? "الحالة" : "Status"}
                      </th>
                      <th className="px-3 py-2 text-start">
                        {locale === "ar" ? "التاريخ" : "Date"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b last:border-0 hover:bg-muted/40">
                        <td className="px-3 py-3 font-medium">{r.title}</td>
                        <td className="px-3 py-3">
                          {locale === "ar"
                            ? GOVERNORATES.find((g) => g.key === r.governorate)?.name_ar
                            : GOVERNORATES.find((g) => g.key === r.governorate)?.name_en}
                        </td>
                        <td className="px-3 py-3">{t.reportCategories[r.category]}</td>
                        <td className="px-3 py-3">
                          <SeverityBadge value={r.severity} />
                        </td>
                        <td className="px-3 py-3">
                          <span className="rounded-full bg-muted px-2 py-1 text-xs">
                            {t.statuses[r.status]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString(
                            locale === "ar" ? "ar-EG" : "en-US",
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 grid gap-4 lg:grid-cols-2">
          <ChartCard
            title={locale === "ar" ? "متوسط التقييم لكل محافظة" : "Avg score by governorate"}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={govChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={locale === "ar" ? "name_ar" : "name_en"}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                />
                <YAxis domain={[0, 100]} />
                <ReTooltip />
                <Bar dataKey="score" fill="#0F4C81" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={t.admin.reportsTrend}>
            <ReportsDualLine data={dualTrend} />
          </ChartCard>

          <ChartCard title={t.admin.usersByDisability}>
            <UsersDisabilityChart data={usersDis} />
          </ChartCard>

          <ChartCard title={t.admin.reportsByCategory}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={catBars}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                  tickFormatter={(c) =>
                    t.reportCategories[c as keyof typeof t.reportCategories] ?? c
                  }
                />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Bar dataKey="count" fill="#00897B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={locale === "ar" ? "أكثر المشكلات شيوعًا" : "Most common issues"}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={problems} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 11 }}
                  width={120}
                  tickFormatter={(c) =>
                    t.reportCategories[c as keyof typeof t.reportCategories] ?? c
                  }
                />
                <ReTooltip />
                <Bar dataKey="count" fill="#FF9800" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={locale === "ar" ? "توزّع التقييمات" : "Score distribution"}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={distro}
                  dataKey="count"
                  nameKey="band"
                  innerRadius={50}
                  outerRadius={100}
                  label
                >
                  {distro.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="lg:col-span-2">
            <ChartCard title={t.admin.districtHeatmap}>
              <DistrictHeatmap data={density} />
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <section className="rounded-2xl border bg-card p-4 md:p-6">
            <h2 className="text-lg font-bold">{t.admin.activity}</h2>
            <ol className="mt-4 space-y-3">
              {activity.map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 rounded-xl border bg-background p-3"
                >
                  <span
                    className={`mt-1 size-2.5 rounded-full ${e.type === "report_resolved" ? "bg-success" : e.type === "report_created" ? "bg-destructive" : "bg-primary"}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{locale === "ar" ? e.title_ar : e.title_en}</p>
                    {(e.subtitle_ar || e.subtitle_en) && (
                      <p className="text-sm text-muted-foreground">
                        {locale === "ar" ? e.subtitle_ar : e.subtitle_en}
                      </p>
                    )}
                    <time className="mt-1 block text-xs text-muted-foreground">
                      {new Date(e.at).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({
  label,
  value,
  Icon,
  tone,
  loading,
}: {
  label: string;
  value: number | string;
  Icon: typeof Building2;
  tone: "primary" | "success" | "warning" | "destructive";
  loading?: boolean;
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-accent/20 text-accent-foreground",
    destructive: "bg-destructive/10 text-destructive",
  }[tone];
  const display = typeof value === "number" ? value.toLocaleString() : value;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`grid size-11 place-items-center rounded-xl ${toneCls}`}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? (
            <p className="mt-1 h-7 w-16 animate-pulse rounded bg-muted" aria-hidden="true" />
          ) : (
            <p className="text-2xl font-extrabold tabular-nums">{display}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-4 md:p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
