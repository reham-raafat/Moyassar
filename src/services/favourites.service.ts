import { apiRequest } from "./api";
import type { Favorite, Place } from "@/types";

// userId مش مستخدم فعليًا في الاستدعاءات لأن الباك إند بياخده من التوكن نفسه،
// لكن باقي في التوقيع عشان الصفحات اللي بتستخدم الخدمة متتغيرش

export const favoritesService = {
  async list(_userId: string): Promise<{ favorite: Favorite; place?: Place }[]> {
    const { favorites } = await apiRequest<{
      favorites: { favorite: Favorite; place?: Place }[];
    }>("/favourites");
    return favorites;
  },

  async isFavorite(_userId: string, placeId: string): Promise<boolean> {
    const { favorited } = await apiRequest<{ favorited: boolean }>(
      `/favourites/${placeId}/check`,
    );
    return favorited;
  },

  async toggle(_userId: string, placeId: string): Promise<{ favorited: boolean }> {
    return apiRequest<{ favorited: boolean }>("/favourites/toggle", {
      method: "POST",
      body: JSON.stringify({ placeId }),
    });
  },
};
