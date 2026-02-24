import { Tables } from "@/types/database.types";

export type Profile = Tables<"profiles">;
export type HeartPoints = Tables<"heart_points">;
export type HeartPointHistory = Tables<"heart_point_history">;
export type StreamerHearts = Tables<"streamer_hearts">;
export type StreamerHeartHistory = Tables<"streamer_heart_history">;
export type StreamerHeartRank = Tables<"streamer_heart_rank">;
export type StreamerTopDonor = Tables<"streamer_top_donors">;

export type MyStreamerRegistrationRequest = Pick<
  Tables<"streamer_registration_requests">,
  | "id"
  | "platform"
  | "platform_streamer_url"
  | "status"
  | "review_note"
  | "created_at"
  | "reviewed_at"
>;

export type MyInfoEditRequest = Pick<
  Tables<"streamer_info_edit_requests">,
  | "id"
  | "streamer_nickname"
  | "content"
  | "status"
  | "review_note"
  | "created_at"
  | "reviewed_at"
>;

export type MyEntityReportRequest = Pick<
  Tables<"entity_report_requests">,
  | "id"
  | "target_type"
  | "target_name"
  | "target_code"
  | "content"
  | "status"
  | "review_note"
  | "created_at"
  | "reviewed_at"
>;

export type MyRequestHistory = {
  streamerRegistrationRequests: MyStreamerRegistrationRequest[];
  infoEditRequests: MyInfoEditRequest[];
  entityReportRequests: MyEntityReportRequest[];
};

export type UpdateProfileInput = {
    userId: string;
    nickname?: string;
    bio?: string;
    avatarFile?: File | null;
    isFirstEdit?: boolean;
};
