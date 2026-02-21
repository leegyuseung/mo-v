export type DailyGiftBoxStatus = {
  claimedToday: boolean;
  amount: number | null;
};

export type DailyGiftBoxClaimResult = {
  claimedToday: boolean;
  amount: number;
  afterPoint: number | null;
};

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
