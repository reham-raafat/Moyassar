import { createFileRoute, Link } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MapPin,
  ArrowLeft,
  Accessibility,
  Eye,
  Ear,
  Brain,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useI18n, CATEGORY_KEYS } from "@/lib/i18n";
import { placesService } from "@/services/places.service";
import { statsService } from "@/services/stats.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlaceCard } from "@/components/place-card";
import type { Place } from "@/types";

export const Route = createFileRoute("/")({
  component: Landing,
  loader: async () => {
    const [places, stats] = await Promise.all([
      placesService.list({ limit: 6 }),
      statsService.dashboard(),
    ]);
    return { places, stats };
  },
});

function Landing() {
  const { t, locale } = useI18n();
  const initial = Route.useLoaderData() ?? { places: [], stats: { total_places: 0, verified_places: 0 } };
  const [q, setQ] = useState("");

  const { data: featured } = useQuery({
    queryKey: ["featured"],
    queryFn: () => placesService.list({ limit: 6 }),
    initialData: initial.places,
  });

  const cities = Array.from(new Set(initial.places.map((p: Place) => p.city))).slice(0, 4);

  return (
    <div className="w-full">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/95 to-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute -top-24 -end-24 size-96 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-32 -start-32 size-96 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              
              <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
                {t.heroTitle}
              </h1>
              <p className="mt-4 text-lg text-primary-foreground/90 md:text-xl">{t.heroSub}</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = `/search?q=${encodeURIComponent(q)}`;
                }}
                className="mt-6 flex flex-col gap-2 rounded-2xl bg-background p-2 text-foreground sm:flex-row sm:items-center sm:gap-1 sm:p-1.5"
                role="search"
                aria-label={t.searchPlaceholder}
              >
                <label htmlFor="hero-q" className="sr-only">
                  {t.searchPlaceholder}
                </label>
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Search className="size-5 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="hero-q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="h-12 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 tap-target gap-2 px-6">
                  {t.explore}
                  <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
                </Button>
              </form>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/map"
                  className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-sm hover:bg-white/25 tap-target"
                >
                  <MapPin className="size-4" aria-hidden="true" /> {t.viewMap}
                </Link>
                {CATEGORY_KEYS.slice(0, 5).map((c) => (
                  <Link
                    key={c}
                    to="/search"
                    search={{ category: c }}
                    className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 tap-target"
                  >
                    {t.categories[c]}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <StatCard value={initial.stats.total_places} label={t.stats.places} />
              <StatCard
                value={initial.stats.verified_places}
                label={t.stats.verified}
                icon={<CheckCircle2 className="size-5" />}
              />
              <StatCard value={cities.length} label={t.stats.cities} />
              <StatCard value={12} label={t.stats.features} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <h2 className="text-2xl font-bold md:text-3xl">{t.audienceTitle}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: "mobility", Icon: Accessibility, color: "bg-primary text-primary-foreground" },
            { k: "visual", Icon: Eye, color: "bg-secondary text-secondary-foreground" },
            { k: "hearing", Icon: Ear, color: "bg-accent text-accent-foreground" },
            { k: "cognitive", Icon: Brain, color: "bg-success text-success-foreground" },
          ].map(({ k, Icon, color }) => (
            <Link
              key={k}
              to="/search"
              search={
                k === "cognitive" ? {} : { disability: k as "mobility" | "visual" | "hearing" }
              }
              className="group rounded-2xl border bg-card p-5 transition hover:border-primary hover:shadow-md"
            >
              <div className={`mb-4 grid size-12 place-items-center rounded-xl ${color}`}>
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold">{t.aud[k as "mobility"]}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {locale === "ar" ? "تصفّح الأماكن المُهيأة" : "Browse suitable places"}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 md:pb-16">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-2xl font-bold md:text-3xl">
            {locale === "ar" ? "أماكن مميّزة" : "Featured places"}
          </h2>
          <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
            {locale === "ar" ? "عرض الكل" : "See all"}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured?.map((p: Place) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
      <div className="flex items-center gap-2 text-3xl font-extrabold md:text-4xl">
        {icon}
        <span>{value.toLocaleString()}</span>
      </div>
      <div className="mt-1 text-sm text-primary-foreground/85">{label}</div>
    </div>
  );
}
