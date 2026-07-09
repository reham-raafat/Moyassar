import { Check, X } from "lucide-react";
import { FEATURE_KEYS, useI18n } from "@/lib/i18n";
import type { PlaceFeatures } from "@/types";

export function FeatureList({ features }: { features: PlaceFeatures | null | undefined }) {
  const { t } = useI18n();
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {FEATURE_KEYS.map((k) => {
        const has = features ? Boolean(features[k]) : false;
        return (
          <li
            key={k}
            className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
          >
            {has ? (
              <Check className="size-4 text-success shrink-0" aria-label="available" />
            ) : (
              <X className="size-4 text-muted-foreground shrink-0" aria-label="not available" />
            )}
            <span className={has ? "font-medium" : "text-muted-foreground line-through"}>
              {t.features[k]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
