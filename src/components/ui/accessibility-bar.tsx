import { Accessibility, Contrast, Moon, Sun, Type, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useA11y } from "@/lib/a11y";
import { useI18n } from "@/lib/i18n";

export function AccessibilityQuickBar() {
  const a = useA11y();
  const { t } = useI18n();
  const sizes: Array<100 | 115 | 130 | 150> = [100, 115, 130, 150];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t.settingsTitle} className="tap-target">
          <Accessibility className="size-5" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Type className="size-4" aria-hidden="true" />
              {t.fontSize}
            </div>
            <div className="grid grid-cols-4 gap-1" role="radiogroup" aria-label={t.fontSize}>
              {sizes.map((n) => (
                <Button
                  key={n}
                  variant={a.fontScale === n ? "default" : "outline"}
                  size="sm"
                  onClick={() => a.setFontScale(n)}
                  role="radio"
                  aria-checked={a.fontScale === n}
                >
                  {n}%
                </Button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <Contrast className="size-4" aria-hidden="true" />
              {t.highContrast}
            </span>
            <Switch
              checked={a.highContrast}
              onCheckedChange={a.setHighContrast}
              aria-label={t.highContrast}
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              {a.dark ? <Moon className="size-4" /> : <Sun className="size-4" />}Dark
            </span>
            <Switch checked={a.dark} onCheckedChange={a.setDark} aria-label="Dark mode" />
          </label>
          <label className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <Zap className="size-4" aria-hidden="true" />
              {t.reducedMotion}
            </span>
            <Switch
              checked={a.reducedMotion}
              onCheckedChange={a.setReducedMotion}
              aria-label={t.reducedMotion}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
