import { createFileRoute, Link, useNavigate } from "@/router-compat";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { z } from "zod";
import { ImagePlus, X } from "lucide-react";
import { useI18n, REPORT_CATEGORY_KEYS, SEVERITY_KEYS } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { reportsService } from "@/services/reports.service";
import { uploadsService } from "@/services/uploads.service";
import { GOVERNORATES } from "@/mock/governorates";
import { findPlace } from "@/mock/places";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ReportCategory, ReportSeverity } from "@/types";

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 ميجا زي حد الباك إند
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ReportSearch = z.object({ placeId: z.string().optional() });

export const Route = createFileRoute("/report")({
  validateSearch: ReportSearch,
  component: ReportPage,
});

function ReportPage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();
  const sp = Route.useSearch();
  const place = sp.placeId ? findPlace(sp.placeId) : undefined;

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<ReportCategory>("ramp");
  const [severity, setSeverity] = useState<ReportSeverity>("medium");
  const [governorate, setGovernorate] = useState(place?.governorate ?? "cairo");
  const [suggestions, setSuggestions] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addPhotos(list: FileList | null) {
    if (!list || list.length === 0) return;
    const incoming = Array.from(list);
    const room = MAX_PHOTOS - photoFiles.length;
    if (room <= 0) {
      toast.error(
        locale === "ar" ? `الحد الأقصى ${MAX_PHOTOS} صور` : `Maximum ${MAX_PHOTOS} photos`,
      );
      return;
    }

    const accepted: File[] = [];
    for (const file of incoming.slice(0, room)) {
      if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
        toast.error(
          locale === "ar"
            ? "الصور المقبولة: JPEG, PNG, WEBP بس"
            : "Only JPEG, PNG, or WEBP images are allowed",
        );
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        toast.error(
          locale === "ar" ? "حجم الصورة أكبر من 5 ميجا" : "Image is larger than 5MB",
        );
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;
    setPhotoFiles((prev) => [...prev, ...accepted]);
    setPhotoPreviews((prev) => [...prev, ...accepted.map((f) => URL.createObjectURL(f))]);
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  const mut = useMutation({
    mutationFn: async () => {
      const photos = photoFiles.length > 0 ? await uploadsService.uploadMultiple(photoFiles) : [];
      return reportsService.submit(user!.id, user!.name, {
        place_id: sp.placeId,
        place_name: place ? (locale === "ar" ? place.name_ar : place.name_en) : undefined,
        governorate,
        category,
        severity,
        title,
        description: desc,
        suggested_improvements: suggestions,
        photos,
      });
    },
    onSuccess: () => {
      toast.success(t.thanks);
      navigate({ to: "/reports" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <p className="text-muted-foreground">
          {locale === "ar" ? "سجّل الدخول لإرسال بلاغ" : "Sign in to submit a report"}
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth">{t.nav.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t.reportTitle}</h1>
      <p className="mt-1 text-muted-foreground">{t.reportDesc}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
        className="mt-6 space-y-4 rounded-2xl border bg-card p-5 md:p-6"
      >
        <div>
          <Label htmlFor="rt">{t.title}</Label>
          <Input
            id="rt"
            required
            minLength={3}
            maxLength={160}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="cat">{locale === "ar" ? "الفئة" : "Category"}</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ReportCategory)}>
              <SelectTrigger id="cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_CATEGORY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t.reportCategories[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="sev">{locale === "ar" ? "مستوى الخطورة" : "Severity"}</Label>
            <Select value={severity} onValueChange={(v) => setSeverity(v as ReportSeverity)}>
              <SelectTrigger id="sev">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {t.severity[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="gov">{t.filterGovernorate}</Label>
          <Select value={governorate} onValueChange={setGovernorate}>
            <SelectTrigger id="gov">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.key} value={g.key}>
                  {locale === "ar" ? g.name_ar : g.name_en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="rd">{t.description}</Label>
          <Textarea
            id="rd"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rs">
            {locale === "ar" ? "اقتراح للتحسين (اختياري)" : "Suggested improvements (optional)"}
          </Label>
          <Textarea
            id="rs"
            rows={3}
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
          />
        </div>
        <div>
          <Label>
            {locale === "ar"
              ? `صور (اختياري، حتى ${MAX_PHOTOS})`
              : `Photos (optional, up to ${MAX_PHOTOS})`}
          </Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="mt-2 flex flex-wrap gap-3">
            {photoPreviews.map((src, i) => (
              <div key={src} className="relative size-20 overflow-hidden rounded-xl border">
                <img src={src} alt="" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute end-1 top-1 grid size-5 place-items-center rounded-full bg-background/90 text-foreground"
                  aria-label={locale === "ar" ? "إزالة الصورة" : "Remove photo"}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
            {photoFiles.length < MAX_PHOTOS && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid size-20 place-items-center rounded-xl border border-dashed text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-6" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link to="/">{t.cancel}</Link>
          </Button>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? t.loading : t.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
