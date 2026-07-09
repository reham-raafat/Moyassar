import { useI18n } from "@/lib/i18n";
import { GOVERNORATES } from "@/mock/governorates";

/**
 * Grid-based heatmap. Each cell represents a district; cell color intensity
 * encodes report count. Pure CSS, no map provider required.
 */
export function DistrictHeatmap({
  data,
}: {
  data: { district: string; governorate: string; reports: number; places: number }[];
}) {
  const { locale } = useI18n();
  const max = Math.max(1, ...data.map((d) => d.reports));

  function intensity(n: number) {
    // 0..1, never fully transparent so empty districts still show structure.
    return 0.15 + 0.85 * (n / max);
  }

  return (
    <div
      role="img"
      aria-label={
        locale === "ar" ? "خريطة كثافة المشكلات حسب الحي" : "District issue density heatmap"
      }
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
    >
      {data.map((d) => {
        const gov = GOVERNORATES.find((g) => g.key === d.governorate);
        const govName = locale === "ar" ? gov?.name_ar : gov?.name_en;
        return (
          <div
            key={`${d.governorate}-${d.district}`}
            className="group rounded-xl border p-3 text-start transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: `rgba(211, 47, 47, ${intensity(d.reports)})`,
              color: intensity(d.reports) > 0.55 ? "#fff" : undefined,
            }}
          >
            <div className="text-xs font-mono opacity-80">{govName}</div>
            <div className="mt-0.5 truncate text-sm font-semibold">{d.district}</div>
            <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
              <span className="opacity-80">{locale === "ar" ? "بلاغات" : "Reports"}</span>
              <span className="text-lg font-extrabold tabular-nums leading-none">{d.reports}</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2 text-xs opacity-80">
              <span>{locale === "ar" ? "أماكن" : "Places"}</span>
              <span className="tabular-nums">{d.places}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
