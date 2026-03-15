import type {
  CommunityDraftListResponse,
  CommunityLikeResponse,
  CommunityPost,
  CommunitySearchItem,
  CommunitySavePayload,
  CommunitySaveResponse,
  CommunityTrackViewResponse,
} from "@/types/community";

async function readJsonBody<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

async function saveCommunityPost(
  payload: CommunitySavePayload
): Promise<CommunitySaveResponse> {
  const response = await fetch("/api/community", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const body = await readJsonBody<CommunitySaveResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "커뮤니티 글 저장에 실패했습니다.");
  }

  if (!body?.id || !body?.status) {
    throw new Error("커뮤니티 글 저장 결과를 확인할 수 없습니다.");
  }

  return body;
}

export async function saveCommunityDraft(
  payload: Omit<CommunitySavePayload, "status">
): Promise<CommunitySaveResponse> {
  return saveCommunityPost({
    ...payload,
    status: "draft",
  });
}

export async function publishCommunityPost(
  payload: Omit<CommunitySavePayload, "status">
): Promise<CommunitySaveResponse> {
  return saveCommunityPost({
    ...payload,
    status: "published",
  });
}

export async function fetchMyCommunityDrafts(
  communityId: number
): Promise<CommunityPost[]> {
  const response = await fetch(`/api/community/drafts?communityId=${communityId}`, {
    method: "GET",
    cache: "no-store",
  });

  const body = await readJsonBody<CommunityDraftListResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "임시저장글 목록 조회에 실패했습니다.");
  }

  return Array.isArray(body?.items) ? body.items : [];
}

export async function deleteCommunityDraft(
  id: number,
  communityId: number
): Promise<void> {
  const response = await fetch(
    `/api/community/drafts?id=${id}&communityId=${communityId}`,
    {
      method: "DELETE",
      cache: "no-store",
    }
  );

  const body = await readJsonBody<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(body?.message || "임시저장글 삭제에 실패했습니다.");
  }
}

export async function deleteCommunityPost(id: number): Promise<void> {
  const response = await fetch(`/api/community/posts/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const body = await readJsonBody<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(body?.message || "커뮤니티 글 삭제에 실패했습니다.");
  }
}

export async function trackCommunityPostView(
  postId: number
): Promise<CommunityTrackViewResponse> {
  const response = await fetch(`/api/community/posts/${postId}/view`, {
    method: "POST",
    cache: "no-store",
    keepalive: true,
  });

  const body = await readJsonBody<CommunityTrackViewResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "커뮤니티 글 조회수 업데이트에 실패했습니다.");
  }

  return body || {};
}

export async function toggleCommunityPostLike(
  postId: number
): Promise<CommunityLikeResponse> {
  const response = await fetch(`/api/community/posts/${postId}/like`, {
    method: "POST",
    cache: "no-store",
  });

  const body = await readJsonBody<CommunityLikeResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "좋아요 처리에 실패했습니다.");
  }

  if (typeof body?.liked !== "boolean" || typeof body?.like_count !== "number") {
    throw new Error("좋아요 결과를 확인할 수 없습니다.");
  }

  return body;
}

export async function fetchCommunitySearchResults(
  keyword: string
): Promise<CommunitySearchItem[]> {
  const response = await fetch(
    `/api/community/search?q=${encodeURIComponent(keyword)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const body = await readJsonBody<{ items?: CommunitySearchItem[]; message?: string }>(
    response
  );
  if (!response.ok) {
    throw new Error(body?.message || "커뮤니티 검색에 실패했습니다.");
  }

  return Array.isArray(body?.items) ? body.items : [];
}
