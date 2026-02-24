import { createClient } from "@/utils/supabase/client";
import type { MyRequestHistory } from "@/types/profile";

const supabase = createClient();

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
