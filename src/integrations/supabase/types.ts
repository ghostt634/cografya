export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      classroom_adjustments: {
        Row: {
          created_at: string;
          delta: number;
          id: string;
          reason: string;
          room_id: string;
          team_id: string;
        };
        Insert: {
          created_at?: string;
          delta: number;
          id?: string;
          reason: string;
          room_id: string;
          team_id: string;
        };
        Update: {
          created_at?: string;
          delta?: number;
          id?: string;
          reason?: string;
          room_id?: string;
          team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_adjustments_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "classroom_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_answers: {
        Row: {
          choice: string;
          correct: boolean;
          player_id: string;
          points: number;
          question_id: number;
          room_id: string;
        };
        Insert: {
          choice: string;
          correct?: boolean;
          player_id: string;
          points?: number;
          question_id: number;
          room_id: string;
        };
        Update: {
          choice?: string;
          correct?: boolean;
          player_id?: string;
          points?: number;
          question_id?: number;
          room_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_answers_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "classroom_players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classroom_answers_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "classroom_bank";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classroom_answers_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "classroom_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_bank: {
        Row: {
          content: Json;
          difficulty: string;
          id: number;
          unit: number;
        };
        Insert: {
          content: Json;
          difficulty: string;
          id: number;
          unit: number;
        };
        Update: {
          content?: Json;
          difficulty?: string;
          id?: number;
          unit?: number;
        };
        Relationships: [];
      };
      classroom_edits: {
        Row: {
          content: Json;
          question_id: number;
          workspace_id: string;
        };
        Insert: {
          content: Json;
          question_id: number;
          workspace_id: string;
        };
        Update: {
          content?: Json;
          question_id?: number;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_edits_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "classroom_bank";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "classroom_edits_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "classroom_workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_players: {
        Row: {
          id: string;
          name: string;
          removed: boolean;
          room_id: string;
          seen_at: string;
          token_hash: string;
        };
        Insert: {
          id?: string;
          name: string;
          removed?: boolean;
          room_id: string;
          seen_at?: string;
          token_hash: string;
        };
        Update: {
          id?: string;
          name?: string;
          removed?: boolean;
          room_id?: string;
          seen_at?: string;
          token_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_players_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "classroom_rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_rooms: {
        Row: {
          created_at: string;
          expires_at: string;
          host_hash: string;
          id: string;
          mode: string;
          pin: string;
          state: Json;
          version: number;
          workspace_id: string | null;
        };
        Insert: {
          created_at?: string;
          expires_at?: string;
          host_hash: string;
          id?: string;
          mode: string;
          pin: string;
          state: Json;
          version?: number;
          workspace_id?: string | null;
        };
        Update: {
          created_at?: string;
          expires_at?: string;
          host_hash?: string;
          id?: string;
          mode?: string;
          pin?: string;
          state?: Json;
          version?: number;
          workspace_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "classroom_rooms_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "classroom_workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      classroom_signals: {
        Row: {
          id: string;
          version: number;
        };
        Insert: {
          id: string;
          version?: number;
        };
        Update: {
          id?: string;
          version?: number;
        };
        Relationships: [];
      };
      classroom_workspaces: {
        Row: {
          created_at: string;
          id: string;
          token_hash: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          token_hash: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          token_hash?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      classroom_answer: {
        Args: {
          p_choice: string;
          p_player: string;
          p_question: number;
          p_room: string;
        };
        Returns: boolean;
      };
      classroom_authorize: {
        Args: { p_hash: string; p_key: string; p_kind: string };
        Returns: boolean;
      };
      classroom_commit: {
        Args: {
          p_id: string;
          p_signal: string;
          p_state: Json;
          p_version: number;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
