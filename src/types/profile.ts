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

export type MyLiveBoxRequest = Pick<
  Tables<"live_box_requests">,
  | "id"
  | "topic"
  | "related_site"
  | "status"
  | "review_note"
  | "created_at"
  | "reviewed_at"
>;

export type MyRequestHistory = {
  streamerRegistrationRequests: MyStreamerRegistrationRequest[];
  infoEditRequests: MyInfoEditRequest[];
  entityReportRequests: MyEntityReportRequest[];
  liveBoxRequests: MyLiveBoxRequest[];
};

/** 요청 필터 타입 */
export type RequestFilter = "all" | "registration" | "info-edit" | "report" | "live-box";

/** 프로필 요청 상태 타입 */
export type ProfileRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

/** 통합 요청 타입: 등록/정보수정/신고 요청을 하나로 합친 유니온 타입 */
export type CombinedRequest =
  | {
      kind: "registration";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: ProfileRequestStatus;
      review_note: string | null;
      platform: string;
      platform_streamer_url: string;
    }
  | {
      kind: "info-edit";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: ProfileRequestStatus;
      review_note: string | null;
      streamer_nickname: string;
      content: string;
    }
  | {
      kind: "report";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: ProfileRequestStatus;
      review_note: string | null;
      target_type: string;
      target_name: string | null;
      target_code: string;
      content: string;
    }
  | {
      kind: "live-box";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: ProfileRequestStatus;
      review_note: string | null;
      topic: string;
      related_site: string;
    };

export type UpdateProfileInput = {
    userId: string;
    nickname?: string;
    bio?: string;
    avatarFile?: File | null;
    isFirstEdit?: boolean;
};
