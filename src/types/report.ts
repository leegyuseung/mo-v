export type ReportTargetType = "streamer" | "group" | "crew";

export type CreateEntityReportRequestInput = {
  targetType: ReportTargetType;
  targetCode: string;
  targetName: string;
  reporterId: string;
  reporterNickname: string | null;
  content: string;
};

export type EntityReportRequest = {
  id: number;
  target_type: ReportTargetType;
  target_code: string;
  target_name: string | null;
  reporter_id: string;
  reporter_nickname: string | null;
  content: string;
  created_at: string;
};
