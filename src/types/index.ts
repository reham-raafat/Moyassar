// Domain types. Mirrors the future Postgres/Prisma schema so the backend
// can adopt them without UI changes.

export type Locale = "ar" | "en";

export type Role = "citizen" | "contributor" | "government_admin";

export type DisabilityType = "mobility" | "visual" | "hearing" | "cognitive";

export type PlaceCategory =
  | "restaurant"
  | "cafe"
  | "hospital"
  | "pharmacy"
  | "university"
  | "school"
  | "government"
  | "mall"
  | "transport"
  | "public_service"
  | "other";

export type FeatureKey =
  | "ramps"
  | "elevator"
  | "accessible_restroom"
  | "accessible_parking"
  | "accessible_entrance"
  | "wide_doorways"
  | "braille_signage"
  | "tactile_paving"
  | "audio_assistance"
  | "visual_alerts"
  | "low_counter"
  | "accessible_seating";

export type PlaceFeatures = Record<FeatureKey, boolean>;

export type OpeningHours = {
  // index 0 = Sunday … 6 = Saturday
  day: number;
  open: string; // "09:00"
  close: string; // "22:00"
  closed?: boolean;
}[];

export type VerificationRecord = {
  verified_at: string;
  verified_by: string;
  notes: string;
  previous_status: "unverified" | "community" | "pending";
};

export type Place = {
  id: string;
  name_ar: string;
  name_en: string;
  category: PlaceCategory;
  governorate: string; // English key, looked up in governorates.ts
  city: string;
  district: string;
  address_ar: string;
  address_en: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  images: string[];
  photo_url?: string; // first image, convenience field
  opening_hours: OpeningHours;
  features: PlaceFeatures;
  score_overall: number; // 0-100
  score_mobility: number;
  score_visual: number;
  score_hearing: number;
  verified_by_admin: boolean;
  verification?: VerificationRecord;
  created_at: string;
};

export type ReviewAccessibilityType = DisabilityType;

export type Review = {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string;
  rating_overall: number;
  comment?: string;
  visit_date: string;
  would_recommend: boolean;
  accessibility_type: ReviewAccessibilityType;
  helpful_count: number;
  created_at: string;
};

export type ReportSeverity = "critical" | "high" | "medium" | "low";
export type ReportStatus = "pending" | "in_review" | "resolved" | "rejected";

export type ReportCategory =
  | "ramp"
  | "elevator"
  | "accessible_parking"
  | "accessible_restroom"
  | "entrance"
  | "braille_signage"
  | "tactile_paving"
  | "audio_assistance"
  | "visual_alerts"
  | "accessible_seating"
  | "other";

export type ReportTimelineEvent = {
  at: string;
  label_ar: string;
  label_en: string;
  actor?: string;
};

export type Report = {
  id: string;
  place_id?: string;
  place_name?: string;
  governorate: string;
  category: ReportCategory;
  title: string;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  photos: string[];
  suggested_improvements: string;
  timeline: ReportTimelineEvent[];
  admin_note?: string;
  user_id: string;
  user_name: string;
  created_at: string;
};

export type Favorite = {
  place_id: string;
  user_id: string;
  created_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  disabilities: DisabilityType[];
  created_at: string;
  last_active_at?: string;
};

export type Governorate = {
  key: string;
  name_ar: string;
  name_en: string;
  lat: number;
  lng: number;
  // Aggregates kept here for ranking page; the future backend will compute them.
  total_places: number;
  accessible_places: number;
  reports_count: number;
  avg_score: number;
  trend: "up" | "down" | "flat";
};

export type ActivityEvent = {
  id: string;
  type: "report_created" | "place_verified" | "place_added" | "report_resolved";
  at: string;
  title_ar: string;
  title_en: string;
  subtitle_ar?: string;
  subtitle_en?: string;
  place_id?: string;
  governorate?: string;
};

export type DashboardStats = {
  total_places: number;
  accessible_places: number;
  inaccessible_places: number;
  verified_places: number;
  pending_reports: number;
  resolved_reports: number;
  accessibility_percentage: number;
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  resolution_rate: number;
};
