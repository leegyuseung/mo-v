import { Tables } from "@/types/database.types";

export type Profile = Tables<"profiles">;
export type HeartPoints = Tables<"heart_points">;
export type HeartPointHistory = Tables<"heart_point_history">;

export type UpdateProfileInput = {
    userId: string;
    nickname?: string;
    bio?: string;
    avatarFile?: File | null;
    isFirstEdit?: boolean;
};
