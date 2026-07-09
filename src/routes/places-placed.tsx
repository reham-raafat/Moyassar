import { createFileRoute, Link, useNavigate } from "@/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useState } from "react";
import {
  CheckCircle2,
  Heart,
  MapPin,
  Phone,
  Globe,
  Flag,
  Star,
  Plus,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { useI18n, DISABILITY_KEYS } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { placesService } from "@/services/places.service";
import { reviewsService } from "@/services/reviews.service";
import { favoritesService } from "@/services/favorites.service";
import { FeatureList } from "@/components/feature-list";
import { ScoreBadge } from "@/components/score-badge";
import { VerificationHistory } from "@/components/verification-history";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapView } from "@/components/map-view";
import { toast } from "sonner";
import type { Review, DisabilityType } from "@/types";

export const Route = createFileRoute("/places/$placeId")({
  params: {
    parse: (p: unknown) => z.object({ placeId: z.string() }).parse(p),
    stringify: (p: unknown) => p,
  },
  component: PlacePage,
  loader: async ({ params }) => {
    const { placeId } = z.object({ placeId: z.string() }).parse(params);
    const [place, reviews] = await Promise.all([
      placesService.get(placeId),
      reviewsService.forPlace(placeId),
    ]);
    return { place, reviews };
  },
});

function PlacePage() {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const { place, reviews: initialReviews } = Route.useLoaderData();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: reviews = initialReviews } = useQuery({
    queryKey: ["reviews", place.id],
    queryFn: () => reviewsService.forPlace(place.id),
    initialData: initialReviews,
  });

  const name = locale === "ar" ? place.name_ar : place.name_en;
  const address = locale === "ar" ? place.address_ar : place.address_en;

  const fav = useMutation({
    mutationFn: () => favoritesService.toggle(user!.id, place.id),
    onSuccess: (r) => {
      toast.success(r.favorited ? t.saveToFav : t.removeFav);
      void qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <article className="mx-auto max-w-6xl px-4 py-6">
      <header className="rounded-3xl border bg-card p-5 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{t.categories[place.category]}</Badge>
              {place.verified_by_admin ? (
                <Badge className="bg-success text-success-foreground gap-1">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  {t.verified}
                </Badge>
              ) : (
                <Badge variant="outline">{t.community}</Badge>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{name}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-muted-foreground">
              <MapPin className="size-4 mt-0.5" aria-hidden="true" /> {address}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <Globe className="size-4" aria-hidden="true" />
                  {locale === "ar" ? "الموقع" : "Website"}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreBadge score={place.score_overall} label={t.overall} />
            <div className="flex gap-1 text-xs">
              <span className="rounded bg-muted px-2 py-1" title={t.mobility}>
                ♿ {place.score_mobility}
              </span>
              <span className="rounded bg-muted px-2 py-1" title={t.visual}>
                👁 {place.score_visual}
              </span>
              <span className="rounded bg-muted px-2 py-1" title={t.hearing}>
                👂 {place.score_hearing}
              </span>
            </div>
            <Link to="/accessibility-score" className="text-xs text-primary hover:underline">
              {t.whyScore}
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {user ? (
            <Button onClick={() => fav.mutate()} variant="outline" className="tap-target gap-2">
              <Heart className="size-4" aria-hidden="true" /> {t.saveToFav}
            </Button>
          ) : (
            <Button asChild variant="outline" className="tap-target gap-2">
              <Link to="/auth">
                <Heart className="size-4" />
                {t.saveToFav}
              </Link>
            </Button>
          )}
          <ReviewDialog placeId={place.id} />
          <Button
            variant="ghost"
            className="tap-target gap-2"
            onClick={() => navigate({ to: "/report", search: { placeId: place.id } })}
          >
            <Flag className="size-4" aria-hidden="true" /> {t.reportIssue}
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-3xl border bg-card p-5 md:p-6">
          <h2 className="text-xl font-bold">
            {locale === "ar" ? "معايير الوصول" : "Accessibility features"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "ar"
              ? "12 معيار. الموجود مُلوّن باللون الأخضر."
              : "12 verifiable features. Available shown in green."}
          </p>
          <div className="mt-4">
            <FeatureList features={place.features} />
          </div>
          {place.verification && (
            <div className="mt-6">
              <VerificationHistory record={place.verification} />
            </div>
          )}
        </section>

        <aside className="rounded-3xl border bg-card p-5">
          <h2 className="text-lg font-bold">{t.nav.map}</h2>
          <div className="mt-3">
            <MapView
              markers={[{ id: place.id, lat: place.lat, lng: place.lng, title: name }]}
              center={{ lat: place.lat, lng: place.lng }}
              zoom={15}
              className="h-64 w-full rounded-xl border"
            />
          </div>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border bg-card p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {locale === "ar" ? "المراجعات" : "Reviews"} ({reviews.length})
          </h2>
        </div>
        {reviews.length === 0 ? (
          <EmptyState title={t.noReviews} className="mt-4" />
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.map((r: Review) => (
              <li key={r.id} className="rounded-2xl border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 font-semibold"
                      aria-label={`${r.rating_overall} of 5`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < r.rating_overall ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {t.aud[r.accessibility_type]}
                    </Badge>
                    {r.would_recommend && (
                      <Badge className="bg-success/15 text-success text-[10px]">
                        {locale === "ar" ? "يُوصى به" : "Recommends"}
                      </Badge>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(r.visit_date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                  </time>
                </div>
                {r.comment && <p className="mt-2 text-sm leading-relaxed">{r.comment}</p>}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => {
                      void reviewsService.markHelpful(r.id);
                      toast.success(locale === "ar" ? "تم التسجيل" : "Marked helpful");
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-accent/30 tap-target"
                  >
                    <ThumbsUp className="size-3.5" aria-hidden="true" />
                    {locale === "ar" ? "مفيد" : "Helpful"} ({r.helpful_count})
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        locale === "ar" ? "تم إرسال التقرير للمراجعة" : "Reported for review",
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-destructive/10 hover:text-destructive tap-target"
                  >
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                    {locale === "ar" ? "الإبلاغ" : "Report"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

function ReviewDialog({ placeId }: { placeId: string }) {
  const { t, locale } = useI18n();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().slice(0, 10));
  const [recommend, setRecommend] = useState(true);
  const [accType, setAccType] = useState<DisabilityType>("mobility");

  const mut = useMutation({
    mutationFn: () =>
      reviewsService.submit(user!.id, user!.name, {
        place_id: placeId,
        rating_overall: rating,
        comment: comment || undefined,
        visit_date: visitDate,
        would_recommend: recommend,
        accessibility_type: accType,
      }),
    onSuccess: () => {
      toast.success(t.thanks);
      setOpen(false);
      setComment("");
      void qc.invalidateQueries({ queryKey: ["reviews", placeId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!user) {
    return (
      <Button asChild className="tap-target gap-2">
        <Link to="/auth">
          <Plus className="size-4" />
          {t.addReview}
        </Link>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="tap-target gap-2">
          <Plus className="size-4" aria-hidden="true" />
          {t.addReview}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.addReview}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-4"
        >
          <div>
            <Label className="mb-2 block">{t.rateOverall}</Label>
            <div className="flex gap-1" role="radiogroup" aria-label={t.rateOverall}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  onClick={() => setRating(n)}
                  className="tap-target rounded-md p-1"
                  aria-label={`${n} ${locale === "ar" ? "نجوم" : "stars"}`}
                >
                  <Star
                    className={`size-7 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="vd">{locale === "ar" ? "تاريخ الزيارة" : "Visit date"}</Label>
              <Input
                id="vd"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="at">{locale === "ar" ? "نوع الهمم" : "Disability"}</Label>
              <select
                id="at"
                value={accType}
                onChange={(e) => setAccType(e.target.value as DisabilityType)}
                className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {DISABILITY_KEYS.map((d) => (
                  <option key={d} value={d}>
                    {t.aud[d]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="size-4"
            />
            {locale === "ar" ? "أوصي بهذا المكان" : "I would recommend this place"}
          </label>
          <div>
            <Label htmlFor="rv-comment" className="mb-1 block">
              {t.commentOpt}
            </Label>
            <Textarea
              id="rv-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? t.loading : t.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
