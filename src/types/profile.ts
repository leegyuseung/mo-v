import { Tables } from "@/types/database.types";

export type Profile = Tables<"profiles">;
export type HeartPoints = Tables<"heart_points">;
export type HeartPointHistory = Tables<"heart_point_history">;
export type StreamerHearts = Tables<"streamer_hearts">;
export type StreamerHeartHistory = Tables<"streamer_heart_history">;
export type StreamerHeartRank = Tables<"streamer_heart_rank">;
export type StreamerTopDonor = Tables<"streamer_top_donors">;

export type UpdateProfileInput = {
    userId: string;
    nickname?: string;
    bio?: string;
    avatarFile?: File | null;
    isFirstEdit?: boolean;
};
