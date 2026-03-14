import type {
  NoticeDraftListResponse,
  NoticeLikeResponse,
  NoticePost,
  NoticeSavePayload,
  NoticeSaveResponse,
  NoticeTrackViewResponse,
} from "@/types/notice";

async function readJsonBody<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

async function saveNotice(payload: NoticeSavePayload): Promise<NoticeSaveResponse> {
  const response = await fetch("/api/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const body = await readJsonBody<NoticeSaveResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "공지사항 저장에 실패했습니다.");
  }

  if (!body?.id || !body?.status) {
    throw new Error("공지사항 저장 결과를 확인할 수 없습니다.");
  }

  return body;
}

export async function saveNoticeDraft(
  payload: Omit<NoticeSavePayload, "status">
): Promise<NoticeSaveResponse> {
  return saveNotice({
    ...payload,
    status: "draft",
  });
}

export async function publishNotice(
  payload: Omit<NoticeSavePayload, "status">
): Promise<NoticeSaveResponse> {
  return saveNotice({
    ...payload,
    status: "published",
  });
}

export async function fetchMyNoticeDrafts(): Promise<NoticePost[]> {
  const response = await fetch("/api/notice/drafts", {
    method: "GET",
    cache: "no-store",
  });

  const body = await readJsonBody<NoticeDraftListResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "임시저장글 목록 조회에 실패했습니다.");
  }

  return Array.isArray(body?.items) ? body.items : [];
}

export async function deleteNoticeDraft(id: number): Promise<void> {
  const response = await fetch(`/api/notice/drafts?id=${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const body = await readJsonBody<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(body?.message || "임시저장글 삭제에 실패했습니다.");
  }
}

export async function deleteNotice(id: number): Promise<void> {
  const response = await fetch(`/api/notice/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });

  const body = await readJsonBody<{ message?: string }>(response);
  if (!response.ok) {
    throw new Error(body?.message || "공지사항 삭제에 실패했습니다.");
  }
}

export async function trackNoticeView(
  noticeId: number
): Promise<NoticeTrackViewResponse> {
  const response = await fetch(`/api/notice/${noticeId}/view`, {
    method: "POST",
    cache: "no-store",
    keepalive: true,
  });

  const body = await readJsonBody<NoticeTrackViewResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "공지사항 조회수 업데이트에 실패했습니다.");
  }

  return body || {};
}

export async function toggleNoticeLike(
  noticeId: number
): Promise<NoticeLikeResponse> {
  const response = await fetch(`/api/notice/${noticeId}/like`, {
    method: "POST",
    cache: "no-store",
  });

  const body = await readJsonBody<NoticeLikeResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "좋아요 처리에 실패했습니다.");
  }

  if (typeof body?.liked !== "boolean" || typeof body?.like_count !== "number") {
    throw new Error("좋아요 결과를 확인할 수 없습니다.");
  }

  return body;
}
