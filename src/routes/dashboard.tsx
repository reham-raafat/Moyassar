import { createFileRoute, Link } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, FileWarning, Settings, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { favoritesService } from "@/services/favorites.service";
import { reportsService } from "@/services/reports.service";
import { Button } from "@/components/ui/button";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/empty-state";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { t, locale } = useI18n();
  const { user, loading } = useAuth();

  const { data: favs } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => favoritesService.list(user!.id),
    enabled: !!user,
  });
  const { data: reports } = useQuery({
    queryKey: ["my-reports", user?.id],
    queryFn: () => reportsService.mine(user!.id),
    enabled: !!user,
  });

  if (loading) return <div className="p-10 text-center text-muted-foreground">{t.loading}</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-muted-foreground">
          {locale === "ar" ? "سجّل الدخول للمتابعة" : "Please sign in"}
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth">{t.nav.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="rounded-3xl bg-gradient-to-l from-primary to-secondary p-6 text-primary-foreground md:p-8">
        <p className="text-sm opacity-90">{t.dashboard.hello}</p>
        <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">{user.name}</h1>
        {user.disabilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {user.disabilities.map((d) => (
              <span key={d} className="rounded-full bg-white/15 px-3 py-1">
                {t.aud[d]}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 text-xs">
          <span className="rounded-full bg-white/15 px-3 py-1 font-mono">{t.roles[user.role]}</span>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/search" Icon={Star} label={t.dashboard.quickFind} />
        <QuickLink to="/map" Icon={MapPin} label={t.nav.map} />
        <QuickLink to="/favorites" Icon={Heart} label={t.nav.favorites} />
        <QuickLink to="/settings" Icon={Settings} label={t.nav.settings} />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t.dashboard.saved}</h2>
          <Link to="/favorites" className="text-sm font-semibold text-primary hover:underline">
            {locale === "ar" ? "عرض الكل" : "View all"}
          </Link>
        </div>
        {favs && favs.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favs
              .slice(0, 3)
              .map((f) => f.place && <PlaceCard key={f.favorite.place_id} place={f.place} />)}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">{t.emptyFavorites}</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">{t.dashboard.recentReports}</h2>
        {reports && reports.length > 0 ? (
          <ul className="mt-3 divide-y rounded-2xl border bg-card">
            {reports.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{r.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString(locale === "ar" ? "ar-EG" : "en-US")}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-xs">
                  {t.statuses[r.status]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            className="mt-3"
            title={t.noReports}
            icon={<FileWarning className="size-7" />}
          />
        )}
      </section>
    </div>
  );
}

function QuickLink({ to, Icon, label }: { to: string; Icon: typeof Heart; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition hover:border-primary hover:shadow-sm"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="font-semibold">{label}</span>
    </Link>
  );
}
