import { Tables } from "@/types/database.types";

export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
};

export type Streamer = Tables<"streamers">;

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
