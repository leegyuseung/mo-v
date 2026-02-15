import { Tables } from "@/types/database.types";

export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
};

export type Streamer = Tables<"streamers">;
