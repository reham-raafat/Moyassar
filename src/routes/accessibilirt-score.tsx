import { createFileRoute, Link } from "@/router-compat";
import { useI18n, FEATURE_KEYS } from "@/lib/i18n";

export const Route = createFileRoute("/accessibility-score")({
  component: ScorePage,
});

function ScorePage() {
  const { t, locale } = useI18n();
  const groups = [
    {
      title: locale === "ar" ? "الحركية (40 نقطة)" : "Mobility (40 pts)",
      items: [
        ["ramps", 10],
        ["elevator", 10],
        ["accessible_restroom", 8],
        ["accessible_parking", 6],
        ["accessible_entrance", 4],
        ["wide_doorways", 2],
      ],
    },
    {
      title: locale === "ar" ? "البصرية (30 نقطة)" : "Visual (30 pts)",
      items: [
        ["braille_signage", 10],
        ["tactile_paving", 8],
        ["audio_assistance", 7],
        ["low_counter", 5],
      ],
    },
    {
      title: locale === "ar" ? "السمعية (30 نقطة)" : "Hearing (30 pts)",
      items: [
        ["visual_alerts", 10],
        ["audio_assistance", 10],
        ["accessible_seating", 10],
      ],
    },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">{t.whyScore}</h1>
      <p className="mt-3 text-muted-foreground">
        {locale === "ar"
          ? "نحسب درجة الوصول من 100 نقطة باستخدام معايير قابلة للتحقق. لا توجد خوارزمية خفيّة."
          : "We compute a 0–100 accessibility score from verifiable, public criteria. No hidden algorithm."}
      </p>

      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <section key={g.title} className="rounded-2xl border bg-card p-5">
            <h2 className="font-semibold text-lg">{g.title}</h2>
            <ul className="mt-3 divide-y">
              {g.items.map(([k, pts]) => (
                <li key={k as string} className="flex items-center justify-between py-2 text-sm">
                  <span>{t.features[k]}</span>
                  <span className="font-mono font-bold text-primary">+{pts}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="font-semibold text-lg">
            {locale === "ar" ? "التقييم العام" : "Overall score"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {locale === "ar"
              ? "متوسط مرجّح: الحركية 40%، البصرية 30%، السمعية 30%."
              : "Weighted average: Mobility 40%, Visual 30%, Hearing 30%."}
          </p>
        </section>
        <p className="text-xs text-muted-foreground">
          {locale === "ar" ? "المعايير الـ12 المُستخدمة:" : "All 12 features used:"}{" "}
          {FEATURE_KEYS.map((k) => t.features[k]).join(" · ")}
        </p>
        <Link to="/" className="inline-block text-sm font-semibold text-primary hover:underline">
          {locale === "ar" ? "← العودة للرئيسية" : "← Back home"}
        </Link>
      </div>
    </div>
  );
}
