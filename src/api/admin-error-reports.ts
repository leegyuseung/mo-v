import { createClient } from "@/utils/supabase/client";
import type { ErrorReportAdminItem } from "@/types/error-report";

const supabase = createClient();

export async function fetchPendingErrorReports(): Promise<ErrorReportAdminItem[]> {
  const { data, error } = await supabase
    .from("error_reports")
    .select("id,title,detail,reporter_id,status,reviewed_by,reviewed_at,reported_at")
    .eq("status", "pending")
    .order("reported_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data || []) as Omit<ErrorReportAdminItem, "reporter_nickname">[];
  const reporterIds = Array.from(
    new Set(rows.map((row) => row.reporter_id).filter((id): id is string => Boolean(id)))
  );

  const nicknameByReporterId = new Map<string, string | null>();
  if (reporterIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id,nickname")
      .in("id", reporterIds);

    if (profileError) {
      throw profileError;
    }

    (profiles || []).forEach((profile) => {
      nicknameByReporterId.set(profile.id, profile.nickname ?? null);
    });
  }

  return rows.map((row) => ({
    ...row,
    reporter_nickname: row.reporter_id
      ? (nicknameByReporterId.get(row.reporter_id) ?? null)
      : null,
  }));
}

export async function resolveErrorReportRequest(
  requestId: number,
  action: "approve" | "reject"
) {
  const response = await fetch(`/api/admin/error-reports/${requestId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "오류 신고 처리에 실패했습니다.");
  }

  return response.json();
}
