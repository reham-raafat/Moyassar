import { createFileRoute, Link } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { useI18n, CATEGORY_KEYS } from "@/lib/i18n";
import { placesService } from "@/services/places.service";
import { GOVERNORATES } from "@/mock/governorates";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";

const SearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  governorate: z.string().optional(),
  disability: z.enum(["mobility", "visual", "hearing"]).optional(),
  verifiedOnly: z.boolean().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: SearchSchema,
  component: SearchPage,
});

function SearchPage() {
  const { t, locale } = useI18n();
  const sp = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(sp.q ?? "");

  const { data, isLoading } = useQuery({
    queryKey: ["search", sp],
    queryFn: () =>
      placesService.list({
        q: sp.q,
        category: sp.category,
        governorate: sp.governorate,
        disability: sp.disability,
        verifiedOnly: sp.verifiedOnly,
        limit: 100,
      }),
  });

  function update(patch: Partial<z.infer<typeof SearchSchema>>) {
    navigate({ search: (prev: z.infer<typeof SearchSchema>) => ({ ...prev, ...patch }) });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t.nav.search}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q || undefined });
        }}
        className="mt-4 flex flex-col gap-2 rounded-2xl border bg-card p-3"
        role="search"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="srch" className="sr-only">
            {t.searchPlaceholder}
          </label>
          <div className="flex flex-1 items-center gap-2 rounded-lg border bg-background px-3">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="srch"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-11 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>

          <Select
            value={sp.category ?? "all"}
            onValueChange={(v) => update({ category: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-11 sm:w-44" aria-label={t.filterCategory}>
              <SelectValue placeholder={t.filterCategory} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allCategories}</SelectItem>
              {CATEGORY_KEYS.map((c) => (
                <SelectItem key={c} value={c}>
                  {t.categories[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sp.governorate ?? "all"}
            onValueChange={(v) => update({ governorate: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="h-11 sm:w-44" aria-label={t.filterGovernorate}>
              <SelectValue placeholder={t.filterGovernorate} />
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

          <Select
            value={sp.disability ?? "any"}
            onValueChange={(v) =>
              update({
                disability: v === "any" ? undefined : (v as "mobility" | "visual" | "hearing"),
              })
            }
          >
            <SelectTrigger className="h-11 sm:w-40" aria-label={t.filterDisability}>
              <SelectValue placeholder={t.filterDisability} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">{t.anyDisability}</SelectItem>
              <SelectItem value="mobility">{t.aud.mobility}</SelectItem>
              <SelectItem value="visual">{t.aud.visual}</SelectItem>
              <SelectItem value="hearing">{t.aud.hearing}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
            <Switch
              checked={Boolean(sp.verifiedOnly)}
              onCheckedChange={(b) => update({ verifiedOnly: b || undefined })}
              aria-label={t.filterVerified}
            />
            <span>{t.filterVerified}</span>
          </label>
        </div>
      </form>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
              {data.length} {t.stats.places}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((p) => (
                <PlaceCard key={p.id} place={p} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title={t.emptyResults}
            action={
              <Link to="/search" className="text-sm font-semibold text-primary hover:underline">
                {t.cancel}
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
