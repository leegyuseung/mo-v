import type { HomeBroadcastBase, HomeBroadcastStatus } from "@/types/home-broadcast";

export type AdminHomeBroadcastStatusFilter = "all" | HomeBroadcastStatus;

export type AdminHomeBroadcastItem = Omit<
  HomeBroadcastBase,
  "deleted_at" | "deleted_by" | "deleted_reason"
> & {
  deleted_at: string | null;
  deleted_by: string | null;
  deleted_by_label: string | null;
  deleted_reason: string | null;
};

export type AdminHomeBroadcastListResponse = {
  data: AdminHomeBroadcastItem[];
};
