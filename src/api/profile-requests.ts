import { createClient } from "@/utils/supabase/client";
import type { CombinedRequest, MyRequestHistory } from "@/types/profile";

const supabase = createClient();

type MyRequestKind = CombinedRequest["kind"];

export async function fetchMyRequestHistory(userId: string): Promise<MyRequestHistory> {
  const [
    streamerRegistrationResult,
    infoEditResult,
    entityReportResult,
  ] = await Promise.all([
    supabase
      .from("streamer_registration_requests")
      .select("id,platform,platform_streamer_url,status,review_note,created_at,reviewed_at")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("streamer_info_edit_requests")
      .select("id,streamer_nickname,content,status,review_note,created_at,reviewed_at")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("entity_report_requests")
      .select("id,target_type,target_name,target_code,content,status,review_note,created_at,reviewed_at")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (streamerRegistrationResult.error) throw streamerRegistrationResult.error;
  if (infoEditResult.error) throw infoEditResult.error;
  if (entityReportResult.error) throw entityReportResult.error;

  return {
    streamerRegistrationRequests: streamerRegistrationResult.data || [],
    infoEditRequests: infoEditResult.data || [],
    entityReportRequests: entityReportResult.data || [],
  };
}

/**
 * 내가 생성한 대기 중 요청을 취소한다.
 * 요청 소유자이면서 status가 pending인 경우에만 cancelled로 변경된다.
 */
export async function cancelMyRequest({
  requestId,
  requestKind,
  userId,
}: {
  requestId: number;
  requestKind: MyRequestKind;
  userId: string;
}) {
  const payload = {
    status: "cancelled",
    reviewed_at: new Date().toISOString(),
    reviewed_by: userId,
    review_note: null,
  };

  if (requestKind === "registration") {
    const { data, error } = await supabase
      .from("streamer_registration_requests")
      .update(payload)
      .eq("id", requestId)
      .eq("requester_id", userId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("대기 중인 요청만 취소할 수 있습니다.");
    return data;
  }

  if (requestKind === "info-edit") {
    const { data, error } = await supabase
      .from("streamer_info_edit_requests")
      .update(payload)
      .eq("id", requestId)
      .eq("requester_id", userId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("대기 중인 요청만 취소할 수 있습니다.");
    return data;
  }

  const { data, error } = await supabase
    .from("entity_report_requests")
    .update(payload)
    .eq("id", requestId)
    .eq("reporter_id", userId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("대기 중인 요청만 취소할 수 있습니다.");
  return data;
}
