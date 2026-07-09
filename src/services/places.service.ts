import { apiRequest } from "./api";
import type { Place, PlaceCategory, DisabilityType } from "@/types";

export type ListPlacesFilter = {
  q?: string;
  category?: PlaceCategory | (string & {});
  governorate?: string;
  disability?: DisabilityType;
  verifiedOnly?: boolean;
  limit?: number;
};

function buildQuery(filter: ListPlacesFilter): string {
  const params = new URLSearchParams();
  if (filter.q) params.set("q", filter.q);
  if (filter.category) params.set("category", filter.category);
  if (filter.governorate) params.set("governorate", filter.governorate);
  if (filter.verifiedOnly) params.set("verifiedOnly", "true");
  if (filter.limit) params.set("limit", String(filter.limit));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function sortKey(p: Place, d?: DisabilityType): number {
  switch (d) {
    case "mobility":
      return p.score_mobility;
    case "visual":
      return p.score_visual;
    case "hearing":
      return p.score_hearing;
    default:
      return p.score_overall;
  }
}

export const placesService = {
  async list(filter: ListPlacesFilter = {}): Promise<Place[]> {
    const { places } = await apiRequest<{ places: Place[] }>(`/places${buildQuery(filter)}`);
    // ترتيب حسب نوع الهمم بيحصل هنا لحد ما نضيفه في الباك إند
    return [...places].sort(
      (a, b) => sortKey(b, filter.disability) - sortKey(a, filter.disability),
    );
  },

  async get(id: string): Promise<Place> {
    const { place } = await apiRequest<{ place: Place }>(`/places/${id}`);
    return place;
  },

  async all(): Promise<Place[]> {
    const { places } = await apiRequest<{ places: Place[] }>(`/places?limit=100`);
    return places;
  },
};
