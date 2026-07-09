import { apiRequest } from "./api";
import type { Report, ReportSeverity, ReportStatus, ReportCategory } from "@/types";

export type ReportsFilter = {
  governorate?: string;
  category?: ReportCategory;
  severity?: ReportSeverity;
  status?: ReportStatus;
  from?: string; // ISO date
  to?: string;
};

export type NewReport = {
  place_id?: string;
  place_name?: string;
  governorate: string;
  category: ReportCategory;
  title: string;
  description: string;
  severity: ReportSeverity;
  suggested_improvements?: string;
  photos?: string[];
};

// الباك إند بيرجّع تلقائيًا: بلاغات المستخدم بس لو مواطن، أو كل البلاغات لو جهة حكومية
async function fetchReports(): Promise<Report[]> {
  const { reports } = await apiRequest<{ reports: Report[] }>("/reports");
  return reports;
}

function applyFilter(rows: Report[], filter: ReportsFilter): Report[] {
  return rows.filter((r) => {
    if (filter.governorate && r.governorate !== filter.governorate) return false;
    if (filter.category && r.category !== filter.category) return false;
    if (filter.severity && r.severity !== filter.severity) return false;
    if (filter.status && r.status !== filter.status) return false;
    if (filter.from && new Date(r.created_at) < new Date(filter.from)) return false;
    if (filter.to && new Date(r.created_at) > new Date(filter.to)) return false;
    return true;
  });
}

export const reportsService = {
  async list(filter: ReportsFilter = {}): Promise<Report[]> {
    const rows = await fetchReports();
    return applyFilter(rows, filter).sort(
      (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
    );
  },

  // userId مش مستخدم فعليًا هنا لأن الباك إند بيحدد صاحب البلاغات من التوكن نفسه
  async mine(_userId: string): Promise<Report[]> {
    const rows = await fetchReports();
    return rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  },

  async get(id: string): Promise<Report | undefined> {
    const rows = await fetchReports();
    return rows.find((r) => r.id === id);
  },

  // userId و userName مش مستخدمين فعليًا هنا - الباك إند بياخدهم من التوكن نفسه
  async submit(_userId: string, _userName: string, input: NewReport): Promise<Report> {
    const { report } = await apiRequest<{ report: Report }>("/reports", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return report;
  },

  async updateStatus(id: string, status: ReportStatus): Promise<void> {
    await apiRequest(`/reports/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};
