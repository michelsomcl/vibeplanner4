export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          client_id: string
          created_at: string
          current_value: number
          description: string
          expected_return: number | null
          id: string
          observations: string | null
          type: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_value: number
          description: string
          expected_return?: number | null
          id?: string
          observations?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_value?: number
          description?: string
          expected_return?: number | null
          id?: string
          observations?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_amount: number | null
          category_id: string
          client_id: string
          created_at: string
          id: string
          is_fixed: boolean | null
          month_year: string
          name: string
          planned_amount: number | null
          updated_at: string
        }
        Insert: {
          actual_amount?: number | null
          category_id: string
          client_id: string
          created_at?: string
          id?: string
          is_fixed?: boolean | null
          month_year: string
          name: string
          planned_amount?: number | null
          updated_at?: string
        }
        Update: {
          actual_amount?: number | null
          category_id?: string
          client_id?: string
          created_at?: string
          id?: string
          is_fixed?: boolean | null
          month_year?: string
          name?: string
          planned_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          available_capital: number | null
          birth_date: string | null
          created_at: string
          email: string
          has_planning: boolean | null
          id: string
          marital_status: string | null
          monthly_income: number | null
          name: string
          observations: string | null
          phone: string
          profession: string | null
          updated_at: string
        }
        Insert: {
          available_capital?: number | null
          birth_date?: string | null
          created_at?: string
          email: string
          has_planning?: boolean | null
          id?: string
          marital_status?: string | null
          monthly_income?: number | null
          name: string
          observations?: string | null
          phone: string
          profession?: string | null
          updated_at?: string
        }
        Update: {
          available_capital?: number | null
          birth_date?: string | null
          created_at?: string
          email?: string
          has_planning?: boolean | null
          id?: string
          marital_status?: string | null
          monthly_income?: number | null
          name?: string
          observations?: string | null
          phone?: string
          profession?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          client_id: string
          created_at: string
          due_date: string
          id: string
          installment_value: number
          institution: string
          interest_rate: number
          name: string
          observations: string | null
          payoff_method: string | null
          remaining_installments: number
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_value: number
          institution: string
          interest_rate: number
          name: string
          observations?: string | null
          payoff_method?: string | null
          remaining_installments: number
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_value?: number
          institution?: string
          interest_rate?: number
          name?: string
          observations?: string | null
          payoff_method?: string | null
          remaining_installments?: number
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          client_id: string
          created_at: string
          current_value: number | null
          deadline: string | null
          id: string
          monthly_contribution: number | null
          name: string
          observations: string | null
          progress: number | null
          target_value: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          id?: string
          monthly_contribution?: number | null
          name: string
          observations?: string | null
          progress?: number | null
          target_value: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          id?: string
          monthly_contribution?: number | null
          name?: string
          observations?: string | null
          progress?: number | null
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      heirs: {
        Row: {
          client_id: string
          created_at: string
          id: string
          name: string
          observations: string | null
          percentage: number
          relationship: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          name: string
          observations?: string | null
          percentage: number
          relationship: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          observations?: string | null
          percentage?: number
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "heirs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      retirement_planning: {
        Row: {
          accumulated_amount: number | null
          client_id: string
          created_at: string
          current_age: number
          desired_retirement_income: number | null
          expected_return: number | null
          id: string
          monthly_contribution: number | null
          observations: string | null
          retirement_age: number
          updated_at: string
        }
        Insert: {
          accumulated_amount?: number | null
          client_id: string
          created_at?: string
          current_age: number
          desired_retirement_income?: number | null
          expected_return?: number | null
          id?: string
          monthly_contribution?: number | null
          observations?: string | null
          retirement_age: number
          updated_at?: string
        }
        Update: {
          accumulated_amount?: number | null
          client_id?: string
          created_at?: string
          current_age?: number
          desired_retirement_income?: number | null
          expected_return?: number | null
          id?: string
          monthly_contribution?: number | null
          observations?: string | null
          retirement_age?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "retirement_planning_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      succession_assets: {
        Row: {
          asset_name: string
          asset_type: string
          client_id: string
          created_at: string
          estimated_value: number
          id: string
          observations: string | null
          updated_at: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          client_id: string
          created_at?: string
          estimated_value: number
          id?: string
          observations?: string | null
          updated_at?: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          client_id?: string
          created_at?: string
          estimated_value?: number
          id?: string
          observations?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "succession_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
