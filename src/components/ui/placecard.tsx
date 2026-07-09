import { Link } from "@/router-compat";
import { CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { ScoreBadge } from "./score-badge";
import type { Place } from "@/types";

export function PlaceCard({ place }: { place: Place }) {
  const { t, locale } = useI18n();
  const name = locale === "ar" ? place.name_ar : place.name_en;
  const address = locale === "ar" ? place.address_ar : place.address_en;
  const catLabel = t.categories[place.category];
  return (
    <Link
      to="/places/$placeId"
      params={{ placeId: place.id }}
      className="group block overflow-hidden rounded-2xl border bg-card transition hover:border-primary hover:shadow-md focus-visible:border-primary"
      aria-label={`${name} — ${catLabel}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {place.photo_url ? (
          <img
            src={place.photo_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {catLabel}
          </Badge>
          {place.verified_by_admin ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              {t.verified}
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-background/90">
              {t.community}
            </Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-base leading-tight">{name}</h3>
        <p className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{address}</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <ScoreBadge score={place.score_overall} label={t.overall} />
          <div className="flex gap-1 text-[10px] text-muted-foreground">
            <span title={t.mobility} className="rounded bg-muted px-1.5 py-0.5">
              ♿ {place.score_mobility}
            </span>
            <span title={t.visual} className="rounded bg-muted px-1.5 py-0.5">
              👁 {place.score_visual}
            </span>
            <span title={t.hearing} className="rounded bg-muted px-1.5 py-0.5">
              👂 {place.score_hearing}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
