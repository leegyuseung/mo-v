import { createClient } from "@/utils/supabase/client";
import type { EntityReportRequest } from "@/types/report";
import { ENTITY_REPORT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

export async function fetchEntityReportRequests(): Promise<EntityReportRequest[]> {
  const { data, error } = await supabase
    .from(ENTITY_REPORT_REQUEST_TABLE)
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as EntityReportRequest[];
}

/** 신고 요청을 확인/거절 처리한다. 확인 시 신고자에게 50 하트가 지급된다. */
export async function resolveEntityReportRequest(
  requestId: number,
  action: "approve" | "reject",
  reviewNote?: string
) {
  const response = await fetch(`/api/admin/reports/${requestId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, reviewNote }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "신고 처리에 실패했습니다.");
  }

  return response.json();
}
