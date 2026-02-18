import { Tables } from "@/types/database.types";

export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
    totalGroups: number;
};

export type Streamer = Tables<"streamers">;
export type IdolGroup = Tables<"idol_groups">;

export type StreamerRequestStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

export type StreamerRegistrationRequest = {
    id: number;
    requester_id: string;
    platform: "chzzk" | "soop";
    platform_streamer_id: string;
    platform_streamer_url: string | null;
    status: StreamerRequestStatus;
    created_at: string;
    updated_at?: string | null;
    reviewed_at?: string | null;
    review_note?: string | null;
    reviewed_by?: string | null;
};

export type ChzzkChannelProfile = {
    channelName: string | null;
    channelImageUrl: string | null;
};

export type StreamerInfoEditRequest = {
    id: number;
    created_at: string;
    content: string;
    streamer_id: number;
    streamer_nickname: string;
    requester_id: string;
    requester_nickname: string | null;
};

export type IdolGroupUpsertInput = {
    group_code: string;
    name: string;
    leader: string | null;
    fandom_name: string | null;
    agency: string | null;
    formed_at: string | null;
    debut_at: string | null;
    fancafe_url: string | null;
    youtube_url: string | null;
    image_url: string | null;
    bg_color: boolean | null;
};
