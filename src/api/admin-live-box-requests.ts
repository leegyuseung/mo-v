import { createClient } from "@/utils/supabase/client";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";

const supabase = createClient();

/** 관리자 대기중 라이브박스 등록 요청 목록을 조회한다. */
export async function fetchPendingLiveBoxRequests(): Promise<LiveBoxAdminPendingRequest[]> {
  const { data, error } = await supabase
    .from("live_box_requests")
    .select(`
      *,
      requester_profile:profiles!live_box_requests_requester_id_fkey (
        nickname,
        nickname_code
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as LiveBoxAdminPendingRequest[];
}

/** 라이브박스 등록 요청 상태를 변경한다. */
export async function updateLiveBoxRequestStatus(
  requestId: number,
  status: "approved" | "rejected",
  reviewNote?: string
) {
  const trimmedReviewNote = reviewNote?.trim() || "";
  if (status === "rejected" && !trimmedReviewNote) {
    throw new Error("거절 사유를 입력해 주세요.");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("live_box_requests")
    .update({
      status,
      review_note: status === "rejected" ? trimmedReviewNote : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq("id", requestId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
