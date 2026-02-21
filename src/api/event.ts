import type { DailyGiftBoxStatus, DailyGiftBoxClaimResult } from "@/types/event";

/**
 * 당일의 하트 이벤트(선물 상자) 참여 여부와 획득 포인트 상태를 단일 조회한다.
 * 클라이언트나 서버 어디서든 `/api/event/gift-box/status` 루트를 경유한다.
 */
export async function fetchDailyGiftBoxStatus(): Promise<DailyGiftBoxStatus> {
  const response = await fetch("/api/event/gift-box/status", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "이벤트 상태를 확인하지 못했습니다.");
  }

  return response.json();
}

/**
 * 당일의 무료 하트(1~50포인트)를 1회 획득한다.
 * 동시성 문제 방지를 위해 Atomic 업데이트가 적용된 내부 API를 호출한다.
 */
export async function claimDailyGiftBox(): Promise<DailyGiftBoxClaimResult> {
  const response = await fetch("/api/event/gift-box/claim", {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "선물 이벤트 처리에 실패했습니다.");
  }

  return response.json();
}
