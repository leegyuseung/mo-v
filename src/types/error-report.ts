export type CreateErrorReportPayload = {
  title: string;
  detail: string;
};

export type CreateErrorReportResponse = {
  id: number;
};

export type ErrorReportStatus = "pending" | "resolved" | "rejected";

export type ErrorReportAdminItem = {
  id: number;
  title: string;
  detail: string;
  reporter_id: string | null;
  reporter_nickname: string | null;
  status: ErrorReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reported_at: string;
};
