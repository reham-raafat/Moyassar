import { createFileRoute, useNavigate } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { placesService } from "@/services/places.service";
import { MapView } from "@/components/map-view";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

function MapPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { data: places } = useQuery({ queryKey: ["map-all"], queryFn: () => placesService.all() });

  const markers = useMemo(
    () =>
      (places ?? []).map((p) => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        title: p.name_ar,
        onClick: () => navigate({ to: "/places/$placeId", params: { placeId: p.id } }),
      })),
    [places, navigate],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">{t.nav.map}</h1>
      <MapView markers={markers} className="h-[70vh] w-full rounded-2xl border" />
      <p className="mt-3 text-sm text-muted-foreground">
        {places?.length ?? 0} {t.stats.places}
      </p>
    </div>
  );
}
