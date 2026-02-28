import type { LiveBox } from "@/types/live-box";

function toTimestamp(value: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getEffectiveLiveBoxStatus(
  status: string,
  endsAt: string | null,
  nowTimestamp = Date.now()
): string {
  if (status === "종료") {
    return status;
  }

  const endsAtTimestamp = toTimestamp(endsAt);
  if (endsAtTimestamp === null) {
    return status;
  }

  if (endsAtTimestamp <= nowTimestamp) {
    return "종료";
  }

  return status;
}

export function withEffectiveLiveBoxStatus<T extends Pick<LiveBox, "status" | "ends_at">>(
  liveBox: T,
  nowTimestamp = Date.now()
): T {
  const nextStatus = getEffectiveLiveBoxStatus(liveBox.status, liveBox.ends_at, nowTimestamp);
  if (nextStatus === liveBox.status) {
    return liveBox;
  }

  return {
    ...liveBox,
    status: nextStatus,
  };
}
