import { apiRequest } from "./api";
import type { Review, ReviewAccessibilityType } from "@/types";

export type NewReview = {
  place_id: string;
  rating_overall: number;
  comment?: string;
  visit_date: string;
  would_recommend: boolean;
  accessibility_type: ReviewAccessibilityType;
};

export const reviewsService = {
  async forPlace(placeId: string): Promise<Review[]> {
    const { reviews } = await apiRequest<{ reviews: Review[] }>(
      `/reviews?placeId=${encodeURIComponent(placeId)}`,
    );
    return reviews;
  },

  // userId و userName مش مستخدمين فعليًا هنا - الباك إند بياخدهم من التوكن نفسه
  async submit(_userId: string, _userName: string, input: NewReview): Promise<Review> {
    const { review } = await apiRequest<{ review: Review }>("/reviews", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return review;
  },

  async markHelpful(reviewId: string): Promise<void> {
    await apiRequest(`/reviews/${reviewId}/helpful`, { method: "PATCH" });
  },
};
