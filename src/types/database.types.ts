export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            heart_points: {
                Row: {
                    created_at: string
                    id: string
                    point: number
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    point?: number
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    point?: number
                    updated_at?: string | null
                }
                Relationships: []
            }
            heart_point_history: {
                Row: {
                    id: number
                    user_id: string
                    amount: number
                    type: string
                    description: string | null
                    after_point: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    amount: number
                    type: string
                    description?: string | null
                    after_point: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    amount?: number
                    type?: string
                    description?: string | null
                    after_point?: number
                    created_at?: string
                }
                Relationships: []
            }
            streamer_hearts: {
                Row: {
                    streamer_id: number
                    total_received: number
                    updated_at: string
                }
                Insert: {
                    streamer_id: number
                    total_received?: number
                    updated_at?: string
                }
                Update: {
                    streamer_id?: number
                    total_received?: number
                    updated_at?: string
                }
                Relationships: []
            }
            streamer_heart_history: {
                Row: {
                    id: number
                    from_user_id: string
                    to_streamer_id: number
                    amount: number
                    description: string | null
                    after_streamer_total: number
                    created_at: string
                }
                Insert: {
                    id?: number
                    from_user_id: string
                    to_streamer_id: number
                    amount: number
                    description?: string | null
                    after_streamer_total: number
                    created_at?: string
                }
                Update: {
                    id?: number
                    from_user_id?: string
                    to_streamer_id?: number
                    amount?: number
                    description?: string | null
                    after_streamer_total?: number
                    created_at?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    bio: string | null
                    created_at: string
                    email: string | null
                    id: string
                    is_first_edit: boolean
                    nickname: string | null
                    provider: string | null
                    role: string
                    updated_at: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    is_first_edit?: boolean
                    nickname?: string | null
                    provider?: string | null
                    role?: string
                    updated_at?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    bio?: string | null
                    created_at?: string
                    email?: string | null
                    id?: string
                    is_first_edit?: boolean
                    nickname?: string | null
                    provider?: string | null
                    role?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            streamers: {
                Row: {
                    alias: string[] | null
                    birthday: string | null
                    chzzk_id: string | null
                    created_at: string
                    crew_name: string[] | null
                    fandom_name: string | null
                    first_stream_date: string | null
                    gender: string | null
                    genre: string[] | null
                    group_name: string[] | null
                    id: number
                    image_url: string | null
                    mbti: string | null
                    nationality: string | null
                    nickname: string | null
                    platform: string | null
                    platform_url: string | null
                    public_id: string
                    soop_id: string | null
                    youtube_url: string | null
                }
                Insert: {
                    alias?: string[] | null
                    birthday?: string | null
                    chzzk_id?: string | null
                    created_at?: string
                    crew_name?: string[] | null
                    fandom_name?: string | null
                    first_stream_date?: string | null
                    gender?: string | null
                    genre?: string[] | null
                    group_name?: string[] | null
                    id?: number
                    image_url?: string | null
                    mbti?: string | null
                    nationality?: string | null
                    nickname?: string | null
                    platform?: string | null
                    platform_url?: string | null
                    public_id?: string
                    soop_id?: string | null
                    youtube_url?: string | null
                }
                Update: {
                    alias?: string[] | null
                    birthday?: string | null
                    chzzk_id?: string | null
                    created_at?: string
                    crew_name?: string[] | null
                    fandom_name?: string | null
                    first_stream_date?: string | null
                    gender?: string | null
                    genre?: string[] | null
                    group_name?: string[] | null
                    id?: number
                    image_url?: string | null
                    mbti?: string | null
                    nationality?: string | null
                    nickname?: string | null
                    platform?: string | null
                    platform_url?: string | null
                    public_id?: string
                    soop_id?: string | null
                    youtube_url?: string | null
                }
                Relationships: []
            }
            streamer_info_edit_requests: {
                Row: {
                    content: string
                    created_at: string
                    id: number
                    requester_id: string
                    requester_nickname: string | null
                    streamer_id: number
                    streamer_nickname: string
                }
                Insert: {
                    content: string
                    created_at?: string
                    id?: number
                    requester_id: string
                    requester_nickname?: string | null
                    streamer_id: number
                    streamer_nickname: string
                }
                Update: {
                    content?: string
                    created_at?: string
                    id?: number
                    requester_id?: string
                    requester_nickname?: string | null
                    streamer_id?: number
                    streamer_nickname?: string
                }
                Relationships: []
            }
        }
        Views: {
            streamer_heart_rank: {
                Row: {
                    streamer_id: number | null
                    nickname: string | null
                    platform: string | null
                    total_received: number | null
                    rank: number | null
                }
                Relationships: []
            }
            streamer_top_donors: {
                Row: {
                    streamer_id: number | null
                    user_id: string | null
                    user_nickname: string | null
                    total_sent: number | null
                    last_sent_at: string | null
                    donor_rank: number | null
                }
                Relationships: []
            }
        }
        Functions: {
            gift_heart_to_streamer: {
                Args: {
                    p_from_user_id: string
                    p_to_streamer_id: number
                    p_amount: number
                    p_description?: string | null
                }
                Returns: {
                    user_after_point: number
                    streamer_after_total: number
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
