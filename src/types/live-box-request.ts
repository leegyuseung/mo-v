import type { Tables, TablesInsert } from "@/types/database.types";
import type { LiveBoxCreateInput, LiveBox } from "@/types/live-box";

export type LiveBoxRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export type LiveBoxRequest = Tables<"live_box_requests">;

export type LiveBoxRequestInsert = TablesInsert<"live_box_requests">;

export type LiveBoxRequestRequesterProfile = {
  nickname: string | null;
  nickname_code: string | null;
};

export type LiveBoxAdminPendingRequest = LiveBoxRequest & {
  requester_profile: LiveBoxRequestRequesterProfile | null;
};

export type CreateLiveBoxRequestInput = {
  requesterId: string;
  topic: string;
  relatedSite: string;
};

export type ApproveLiveBoxRequestInput = LiveBoxCreateInput;

export type ApproveLiveBoxRequestResponse = {
  liveBox: LiveBox;
  request: LiveBoxRequest;
};
