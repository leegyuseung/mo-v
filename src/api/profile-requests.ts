import { createClient } from "@/utils/supabase/client";
import type { CombinedRequest, MyRequestHistory } from "@/types/profile";

const supabase = createClient();

type MyRequestKind = CombinedRequest["kind"];

export async function fetchMyRequestHistory(userId: string): Promise<MyRequestHistory> {
  const [
    streamerRegistrationResult,
    streamerInfoEditResult,
    entityInfoEditResult,
    entityReportResult,
    liveBoxRequestResult,
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
      .from("entity_info_edit_requests")
      .select("id,target_type,target_name,target_code,content,status,review_note,created_at,reviewed_at")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("entity_report_requests")
      .select("id,target_type,target_name,target_code,content,status,review_note,created_at,reviewed_at")
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("live_box_requests")
      .select("id,topic,related_site,status,review_note,created_at,reviewed_at")
      .eq("requester_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (streamerRegistrationResult.error) throw streamerRegistrationResult.error;
  if (streamerInfoEditResult.error) throw streamerInfoEditResult.error;
  if (entityInfoEditResult.error) throw entityInfoEditResult.error;
  if (entityReportResult.error) throw entityReportResult.error;
  if (liveBoxRequestResult.error) throw liveBoxRequestResult.error;

  const streamerInfoEditRequests = (streamerInfoEditResult.data || []).map((row) => ({
    id: row.id,
    target_type: "streamer" as const,
    target_name: row.streamer_nickname,
    target_code: null,
    content: row.content,
    status: row.status,
    review_note: row.review_note,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    source: "streamer" as const,
  }));

  const entityInfoEditRequests = (entityInfoEditResult.data || []).map((row) => ({
    id: row.id,
    target_type: row.target_type,
    target_name: row.target_name,
    target_code: row.target_code,
    content: row.content,
    status: row.status,
    review_note: row.review_note,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    source: "entity" as const,
  }));

  return {
    streamerRegistrationRequests: streamerRegistrationResult.data || [],
    infoEditRequests: [...streamerInfoEditRequests, ...entityInfoEditRequests],
    entityReportRequests: entityReportResult.data || [],
    liveBoxRequests: liveBoxRequestResult.data || [],
  };
}

/**
 * 내가 생성한 대기 중 요청을 취소한다.
 * 요청 소유자이면서 status가 pending인 경우에만 cancelled로 변경된다.
 */
export async function cancelMyRequest({
  requestId,
  requestKind,
  infoEditSource,
  userId,
}: {
  requestId: number;
  requestKind: MyRequestKind;
  infoEditSource?: "streamer" | "entity";
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
    if (infoEditSource === "entity") {
      const { data, error } = await supabase
        .from("entity_info_edit_requests")
        .update({
          status: "cancelled",
          reviewed_at: null,
          reviewed_by: null,
          review_note: null,
        })
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

  if (requestKind === "live-box") {
    const { data, error } = await supabase
      .from("live_box_requests")
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
