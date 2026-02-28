import type { LiveBox } from "@/types/live-box";

function toTimestamp(value: string | null): number | null {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function getEffectiveLiveBoxStatus(
  status: string,
  startsAt: string | null,
  endsAt: string | null,
  nowTimestamp = Date.now()
): string {
  const endsAtTimestamp = toTimestamp(endsAt);
  if (endsAtTimestamp !== null && endsAtTimestamp <= nowTimestamp) {
    return "종료";
  }

  if (status === "종료") {
    return status;
  }

  const startsAtTimestamp = toTimestamp(startsAt);
  if (startsAtTimestamp !== null && startsAtTimestamp <= nowTimestamp) {
    return "진행중";
  }

  return "대기";
}

export function withEffectiveLiveBoxStatus<
  T extends Pick<LiveBox, "status" | "starts_at" | "ends_at">,
>(
  liveBox: T,
  nowTimestamp = Date.now()
): T {
  const nextStatus = getEffectiveLiveBoxStatus(
    liveBox.status,
    liveBox.starts_at,
    liveBox.ends_at,
    nowTimestamp
  );
  if (nextStatus === liveBox.status) {
    return liveBox;
  }

  return {
    ...liveBox,
    status: nextStatus,
  };
}
