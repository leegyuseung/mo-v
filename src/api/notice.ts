import type {
  NoticeDraftListResponse,
  NoticeListResponse,
  NoticePost,
  NoticeSavePayload,
  NoticeSaveResponse,
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

export async function fetchPublishedNotices(): Promise<NoticePost[]> {
  const response = await fetch("/api/notice", {
    method: "GET",
    cache: "no-store",
  });

  const body = await readJsonBody<NoticeListResponse>(response);
  if (!response.ok) {
    throw new Error(body?.message || "공지사항 목록 조회에 실패했습니다.");
  }

  return Array.isArray(body?.items) ? body.items : [];
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
