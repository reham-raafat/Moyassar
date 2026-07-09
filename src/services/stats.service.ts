import { apiRequest } from "./api";
import type { DashboardStats, Governorate } from "@/types";

export const statsService = {
  dashboard(): Promise<DashboardStats> {
    return apiRequest<DashboardStats>("/stats/dashboard");
  },

  async byGovernorate(): Promise<
    { key: string; name_ar: string; name_en: string; score: number; count: number }[]
  > {
    const { rows } = await apiRequest<{
      rows: { key: string; name_ar: string; name_en: string; score: number; count: number }[];
    }>("/stats/by-governorate");
    return rows;
  },

  async byCategory(): Promise<{ category: string; count: number }[]> {
    const { rows } = await apiRequest<{ rows: { category: string; count: number }[] }>(
      "/stats/by-category",
    );
    return rows;
  },

  async commonProblems(): Promise<{ category: string; count: number }[]> {
    const { rows } = await apiRequest<{ rows: { category: string; count: number }[] }>(
      "/stats/common-problems",
    );
    return rows;
  },

  async reportsByCategory(): Promise<{ category: string; count: number }[]> {
    const { rows } = await apiRequest<{ rows: { category: string; count: number }[] }>(
      "/stats/reports-by-category",
    );
    return rows;
  },

  async reportsOverTime(): Promise<{ month: string; count: number }[]> {
    const { rows } = await apiRequest<{ rows: { month: string; count: number }[] }>(
      "/stats/reports-over-time",
    );
    return rows;
  },

  async reportsTrendDual(): Promise<{ month: string; submitted: number; resolved: number }[]> {
    const { rows } = await apiRequest<{
      rows: { month: string; submitted: number; resolved: number }[];
    }>("/stats/reports-trend-dual");
    return rows;
  },

  verificationProgress(): Promise<{ verified: number; unverified: number }> {
    return apiRequest<{ verified: number; unverified: number }>("/stats/verification-progress");
  },

  async scoreDistribution(): Promise<{ band: string; count: number }[]> {
    const { rows } = await apiRequest<{ rows: { band: string; count: number }[] }>(
      "/stats/score-distribution",
    );
    return rows;
  },

  async usersByDisability(): Promise<
    { key: "mobility" | "visual" | "hearing" | "multiple" | "none"; count: number }[]
  > {
    const { rows } = await apiRequest<{
      rows: { key: "mobility" | "visual" | "hearing" | "multiple" | "none"; count: number }[];
    }>("/stats/users-by-disability");
    return rows;
  },

  async districtDensity(): Promise<
    { district: string; governorate: string; reports: number; places: number }[]
  > {
    const { rows } = await apiRequest<{
      rows: { district: string; governorate: string; reports: number; places: number }[];
    }>("/stats/district-density");
    return rows;
  },

  async governorateRanking(): Promise<Governorate[]> {
    const { rows } = await apiRequest<{ rows: Governorate[] }>("/stats/governorate-ranking");
    return rows;
  },
};
