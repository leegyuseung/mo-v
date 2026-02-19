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
      heart_point_history: {
        Row: {
          after_point: number
          amount: number
          created_at: string
          description: string | null
          id: number
          type: string | null
          user_id: string
        }
        Insert: {
          after_point: number
          amount: number
          created_at?: string
          description?: string | null
          id?: number
          type?: string | null
          user_id?: string
        }
        Update: {
          after_point?: number
          amount?: number
          created_at?: string
          description?: string | null
          id?: number
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      idol_groups: {
        Row: {
          agency: string | null
          bg_color: string | null
          created_at: string
          debut_at: string | null
          fancafe_url: string | null
          fandom_name: string | null
          formed_at: string | null
          group_code: string
          id: number
          image_url: string | null
          leader: string | null
          members: string[]
          name: string
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          agency?: string | null
          bg_color?: string | null
          created_at?: string
          debut_at?: string | null
          fancafe_url?: string | null
          fandom_name?: string | null
          formed_at?: string | null
          group_code: string
          id?: number
          image_url?: string | null
          leader?: string | null
          members?: string[]
          name: string
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          agency?: string | null
          bg_color?: string | null
          created_at?: string
          debut_at?: string | null
          fancafe_url?: string | null
          fandom_name?: string | null
          formed_at?: string | null
          group_code?: string
          id?: number
          image_url?: string | null
          leader?: string | null
          members?: string[]
          name?: string
          updated_at?: string | null
          youtube_url?: string | null
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
      streamer_heart_history: {
        Row: {
          after_streamer_total: number
          amount: number
          created_at: string
          description: string | null
          from_user_id: string
          id: number
          to_streamer_id: number
        }
        Insert: {
          after_streamer_total: number
          amount: number
          created_at?: string
          description?: string | null
          from_user_id: string
          id?: number
          to_streamer_id: number
        }
        Update: {
          after_streamer_total?: number
          amount?: number
          created_at?: string
          description?: string | null
          from_user_id?: string
          id?: number
          to_streamer_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "streamer_heart_history_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["to_streamer_id"]
            isOneToOne: false
            referencedRelation: "idol_group_streamers"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["to_streamer_id"]
            isOneToOne: false
            referencedRelation: "streamer_heart_rank"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["to_streamer_id"]
            isOneToOne: false
            referencedRelation: "streamers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "streamer_hearts_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: true
            referencedRelation: "idol_group_streamers"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_hearts_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: true
            referencedRelation: "streamer_heart_rank"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_hearts_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: true
            referencedRelation: "streamers"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "streamer_info_edit_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_info_edit_requests_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "idol_group_streamers"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_info_edit_requests_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "streamer_heart_rank"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_info_edit_requests_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "streamers"
            referencedColumns: ["id"]
          },
        ]
      }
      streamer_registration_requests: {
        Row: {
          created_at: string
          id: number
          platform: string
          platform_streamer_id: string
          platform_streamer_url: string
          requester_id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: never
          platform: string
          platform_streamer_id: string
          platform_streamer_url: string
          requester_id: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: never
          platform?: string
          platform_streamer_id?: string
          platform_streamer_url?: string
          requester_id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
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
          fancafe_url: string | null
          fandom_name: string | null
          first_stream_date: string | null
          gender: string | null
          genre: string[] | null
          group_codes: string[] | null
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
          fancafe_url?: string | null
          fandom_name?: string | null
          first_stream_date?: string | null
          gender?: string | null
          genre?: string[] | null
          group_codes?: string[] | null
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
          fancafe_url?: string | null
          fandom_name?: string | null
          first_stream_date?: string | null
          gender?: string | null
          genre?: string[] | null
          group_codes?: string[] | null
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
    }
    Views: {
      idol_group_streamers: {
        Row: {
          group_code: string | null
          group_id: number | null
          group_name: string | null
          image_url: string | null
          platform: string | null
          streamer_id: number | null
          streamer_nickname: string | null
          streamer_public_id: string | null
        }
        Relationships: []
      }
      streamer_heart_rank: {
        Row: {
          nickname: string | null
          platform: string | null
          rank: number | null
          streamer_id: number | null
          total_received: number | null
        }
        Relationships: []
      }
      streamer_top_donors: {
        Row: {
          donor_rank: number | null
          last_sent_at: string | null
          streamer_id: number | null
          total_sent: number | null
          user_id: string | null
          user_nickname: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streamer_heart_history_from_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "idol_group_streamers"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "streamer_heart_rank"
            referencedColumns: ["streamer_id"]
          },
          {
            foreignKeyName: "streamer_heart_history_to_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "streamers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_user_count_by_provider: {
        Args: never
        Returns: {
          count: number
          provider: string
        }[]
      }
      gift_heart_to_streamer: {
        Args: {
          p_amount: number
          p_description?: string
          p_from_user_id: string
          p_to_streamer_id: number
        }
        Returns: {
          streamer_after_total: number
          user_after_point: number
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
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
