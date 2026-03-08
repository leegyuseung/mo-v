import type { HomeBroadcastStatus } from "@/types/home-broadcast";

type HomeBroadcastStatusSource = {
  deleted_at?: string | null;
  expires_at: string;
  status?: string | null;
};

/**
 * DB status 동기화 함수가 일시적으로 실패해도 화면 상태는 만료 시각 기준으로 안전하게 계산한다.
 * 왜: 운영 RPC 오류가 홈/관리자 화면 상태를 계속 active로 남기게 만들면 데이터와 UX가 어긋나기 때문이다.
 */
export function getEffectiveHomeBroadcastStatus(
  item: HomeBroadcastStatusSource,
  nowMs = Date.now()
): HomeBroadcastStatus {
  if (item.deleted_at) {
    return "deleted";
  }

  const expiresAtMs = new Date(item.expires_at).getTime();
  if (Number.isFinite(expiresAtMs) && expiresAtMs <= nowMs) {
    return "ended";
  }

  return item.status === "ended" ? "ended" : "active";
}
