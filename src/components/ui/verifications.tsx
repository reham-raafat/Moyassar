import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { VerificationRecord } from "@/types";

export function VerificationHistory({ record }: { record: VerificationRecord }) {
  const { locale } = useI18n();
  return (
    <section className="rounded-2xl border bg-success/5 p-4">
      <header className="flex items-center gap-2 text-success">
        <ShieldCheck className="size-5" aria-hidden="true" />
        <h3 className="font-semibold">
          {locale === "ar" ? "سجل التوثيق" : "Verification history"}
        </h3>
      </header>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {locale === "ar" ? "تاريخ التوثيق" : "Verified on"}
          </dt>
          <dd className="font-medium">
            {new Date(record.verified_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {locale === "ar" ? "تم التوثيق بواسطة" : "Verified by"}
          </dt>
          <dd className="font-medium">{record.verified_by}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">
            {locale === "ar" ? "الحالة السابقة" : "Previous status"}
          </dt>
          <dd className="font-medium capitalize">{record.previous_status}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{locale === "ar" ? "ملاحظات" : "Notes"}</dt>
          <dd className="mt-1 rounded-md bg-background p-2 text-sm">{record.notes}</dd>
        </div>
      </dl>
    </section>
  );
}
