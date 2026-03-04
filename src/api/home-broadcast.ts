import type {
  CreateHomeBroadcastPayload,
  CreateHomeBroadcastResponse,
  HomeBroadcastListResponse,
} from "@/types/home-broadcast";

export async function fetchHomeBroadcasts(): Promise<HomeBroadcastListResponse> {
  const response = await fetch("/api/home/broadcasts", {
    method: "GET",
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | HomeBroadcastListResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "전광판 조회에 실패했습니다.");
  }

  return body as HomeBroadcastListResponse;
}

export async function createHomeBroadcast(
  payload: CreateHomeBroadcastPayload
): Promise<CreateHomeBroadcastResponse> {
  const response = await fetch("/api/home/broadcasts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | CreateHomeBroadcastResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "전광판 등록에 실패했습니다.");
  }

  return body as CreateHomeBroadcastResponse;
}

