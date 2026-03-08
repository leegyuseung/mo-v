import type {
  AdminHomeBroadcastListResponse,
  AdminHomeBroadcastItem,
} from "@/types/admin-home-broadcast";

export async function fetchAdminHomeBroadcasts(): Promise<AdminHomeBroadcastItem[]> {
  const response = await fetch("/api/admin/home-broadcasts", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  const body = (await response.json().catch(() => null)) as
    | AdminHomeBroadcastListResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "전광판 목록 조회에 실패했습니다.");
  }

  return (body as AdminHomeBroadcastListResponse).data;
}
