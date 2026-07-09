import { createFileRoute, Link } from "@/router-compat";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { favoritesService } from "@/services/favorites.service";
import { PlaceCard } from "@/components/place-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => favoritesService.list(user!.id),
    enabled: !!user,
  });

  if (loading) return <div className="p-10 text-center">{t.loading}</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md p-10 text-center">
        <Button asChild>
          <Link to="/auth">{t.nav.signIn}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">{t.nav.favorites}</h1>
      {isLoading ? (
        <p className="mt-6 text-muted-foreground">{t.loading}</p>
      ) : data && data.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((f) => f.place && <PlaceCard key={f.favorite.place_id} place={f.place} />)}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title={t.emptyFavorites}
          icon={<Heart className="size-7" />}
          action={
            <Button asChild>
              <Link to="/search">{t.explore}</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
