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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      daily_activities: {
        Row: {
          accomplished: string | null
          activity_date: string
          calls_completed: number
          client_work_completed: number
          content_published: number
          created_at: string
          deals_closed: number
          followups_sent: number
          id: string
          improve: string | null
          learned: string | null
          pitches_sent: number
          proposals_sent: number
          researched_businesses: number
          user_id: string
          went_wrong: string | null
        }
        Insert: {
          accomplished?: string | null
          activity_date: string
          calls_completed?: number
          client_work_completed?: number
          content_published?: number
          created_at?: string
          deals_closed?: number
          followups_sent?: number
          id?: string
          improve?: string | null
          learned?: string | null
          pitches_sent?: number
          proposals_sent?: number
          researched_businesses?: number
          user_id: string
          went_wrong?: string | null
        }
        Update: {
          accomplished?: string | null
          activity_date?: string
          calls_completed?: number
          client_work_completed?: number
          content_published?: number
          created_at?: string
          deals_closed?: number
          followups_sent?: number
          id?: string
          improve?: string | null
          learned?: string | null
          pitches_sent?: number
          proposals_sent?: number
          researched_businesses?: number
          user_id?: string
          went_wrong?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          client_name: string
          contact_information: string | null
          created_at: string
          estimated_value: number
          expected_close_date: string | null
          id: string
          industry: string | null
          next_follow_up_date: string | null
          notes: string | null
          service_type: string
          stage: string
          user_id: string
        }
        Insert: {
          client_name: string
          contact_information?: string | null
          created_at?: string
          estimated_value?: number
          expected_close_date?: string | null
          id?: string
          industry?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          service_type?: string
          stage?: string
          user_id: string
        }
        Update: {
          client_name?: string
          contact_information?: string | null
          created_at?: string
          estimated_value?: number
          expected_close_date?: string | null
          id?: string
          industry?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          service_type?: string
          stage?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          roi_classification: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          expense_date: string
          id?: string
          notes?: string | null
          roi_classification?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          roi_classification?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          currency: string
          daily_followup_target: number
          daily_pitch_target: number
          end_date: string
          id: string
          stage_probabilities: Json
          start_date: string
          target_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          daily_followup_target?: number
          daily_pitch_target?: number
          end_date?: string
          id?: string
          stage_probabilities?: Json
          start_date?: string
          target_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          daily_followup_target?: number
          daily_pitch_target?: number
          end_date?: string
          id?: string
          stage_probabilities?: Json
          start_date?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      income_records: {
        Row: {
          amount_received: number
          category: string
          client_name: string
          created_at: string
          deal_value: number
          id: string
          notes: string | null
          payment_date: string
          payment_status: string
          project_name: string
          user_id: string
        }
        Insert: {
          amount_received?: number
          category: string
          client_name: string
          created_at?: string
          deal_value?: number
          id?: string
          notes?: string | null
          payment_date: string
          payment_status: string
          project_name?: string
          user_id: string
        }
        Update: {
          amount_received?: number
          category?: string
          client_name?: string
          created_at?: string
          deal_value?: number
          id?: string
          notes?: string | null
          payment_date?: string
          payment_status?: string
          project_name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
