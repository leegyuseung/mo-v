import { createClient } from "@/utils/supabase/client";
import { ENTITY_INFO_EDIT_REQUEST_TABLE } from "@/lib/constant";
import type { CreateContentInfoEditRequestInput } from "@/types/content";
import type {
  EarlyEndContentResponse,
  FavoriteContentIdsResponse,
  ToggleContentFavoriteResponse,
  TrackContentViewResponse,
} from "@/types/contents-detail";

const supabase = createClient();

export async function createContentInfoEditRequest({
  content,
  contentId,
  contentTitle,
  requesterId,
  requesterNickname,
}: CreateContentInfoEditRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(ENTITY_INFO_EDIT_REQUEST_TABLE).insert({
    target_type: "contents",
    target_id: contentId,
    target_code: String(contentId),
    target_name: contentTitle,
    content: trimmedContent,
    requester_id: requesterId,
    requester_nickname: requesterNickname,
    status: "pending",
  });

  if (error) throw error;
}

async function readJsonBody<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export async function trackContentView(contentId: number): Promise<TrackContentViewResponse> {
  const response = await fetch(`/api/contents/${contentId}/view`, {
    method: "POST",
    keepalive: true,
    cache: "no-store",
  });

  const body = await readJsonBody<TrackContentViewResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "조회수 업데이트에 실패했습니다.");
  }

  return body || {};
}

export async function fetchFavoriteContentIds(): Promise<number[]> {
  const response = await fetch("/api/contents/favorites", {
    method: "GET",
    cache: "no-store",
  });

  const body = await readJsonBody<FavoriteContentIdsResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "좋아요 목록 조회에 실패했습니다.");
  }

  if (!Array.isArray(body?.favoriteContentIds)) {
    return [];
  }

  return body.favoriteContentIds.filter((id) => Number.isFinite(id));
}

export async function toggleContentFavorite(
  contentId: number
): Promise<ToggleContentFavoriteResponse> {
  const response = await fetch(`/api/contents/${contentId}/favorite`, {
    method: "POST",
    cache: "no-store",
  });

  const body = await readJsonBody<ToggleContentFavoriteResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "좋아요 처리에 실패했습니다.");
  }

  return body || {};
}

export async function earlyEndContent(contentId: number): Promise<EarlyEndContentResponse> {
  const response = await fetch(`/api/contents/${contentId}/early-end`, {
    method: "POST",
    cache: "no-store",
  });

  const body = await readJsonBody<EarlyEndContentResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "조기마감 처리에 실패했습니다.");
  }

  return body || {};
}
