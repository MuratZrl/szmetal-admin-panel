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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      product_comment_pins: {
        Row: {
          comment_id: number
          pinned_at: string
          pinned_by: string | null
          product_id: number
        }
        Insert: {
          comment_id: number
          pinned_at?: string
          pinned_by?: string | null
          product_id: number
        }
        Update: {
          comment_id?: number
          pinned_at?: string
          pinned_by?: string | null
          product_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_comment_pins_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "product_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_comment_pins_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comment_votes: {
        Row: {
          comment_id: number
          created_at: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          comment_id: number
          created_at?: string
          updated_at?: string
          user_id: string
          value: number
        }
        Update: {
          comment_id?: number
          created_at?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "product_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          id: number
          product_id: number
          updated_at: string | null
        }
        Insert: {
          author_id: string
          author_name?: string
          content: string
          created_at?: string
          id?: number
          product_id: number
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          id?: number
          product_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_comments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          availability: boolean
          category: string
          category_id: string | null
          code: string
          control: string | null
          created_at: string
          date: string
          description: string | null
          drawer: string | null
          file_bucket: string | null
          file_ext: string | null
          file_mime: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          has_customer_mold: boolean
          id: number
          image: string | null
          manufacturer_code: string | null
          name: string
          outer_size_mm: number | null
          profile_code: string | null
          revision_date: string | null
          scale: string | null
          section_mm2: number | null
          sub_category: string
          subcategory_id: string | null
          temp_code: string | null
          unit_weight_g_pm: number
          updated_at: string
          variant: string
        }
        Insert: {
          availability?: boolean
          category: string
          category_id?: string | null
          code: string
          control?: string | null
          created_at?: string
          date: string
          description?: string | null
          drawer?: string | null
          file_bucket?: string | null
          file_ext?: string | null
          file_mime?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          has_customer_mold?: boolean
          id?: number
          image?: string | null
          manufacturer_code?: string | null
          name: string
          outer_size_mm?: number | null
          profile_code?: string | null
          revision_date?: string | null
          scale?: string | null
          section_mm2?: number | null
          sub_category: string
          subcategory_id?: string | null
          temp_code?: string | null
          unit_weight_g_pm?: number
          updated_at?: string
          variant: string
        }
        Update: {
          availability?: boolean
          category?: string
          category_id?: string | null
          code?: string
          control?: string | null
          created_at?: string
          date?: string
          description?: string | null
          drawer?: string | null
          file_bucket?: string | null
          file_ext?: string | null
          file_mime?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          has_customer_mold?: boolean
          id?: number
          image?: string | null
          manufacturer_code?: string | null
          name?: string
          outer_size_mm?: number | null
          profile_code?: string | null
          revision_date?: string | null
          scale?: string | null
          section_mm2?: number | null
          sub_category?: string
          subcategory_id?: string | null
          temp_code?: string | null
          unit_weight_g_pm?: number
          updated_at?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_subcategory"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          created_at: string
          description: string | null
          form_data: Json
          id: string
          material_data: Json
          status: string
          summary_data: Json
          system_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_data: Json
          id?: string
          material_data: Json
          status?: string
          summary_data: Json
          system_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_data?: Json
          id?: string
          material_data?: Json
          status?: string
          summary_data?: Json
          system_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_drafts: {
        Row: {
          created_at: string
          form_data: Json
          id: string
          slug: string
          step: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data?: Json
          id?: string
          slug: string
          step?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          id?: string
          slug?: string
          step?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_form_configs: {
        Row: {
          fields: Json
          is_active: boolean
          slug: string
          updated_at: string
          version: number
        }
        Insert: {
          fields: Json
          is_active?: boolean
          slug: string
          updated_at?: string
          version?: number
        }
        Update: {
          fields?: Json
          is_active?: boolean
          slug?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_form_configs_slug_fkey"
            columns: ["slug"]
            isOneToOne: true
            referencedRelation: "systems"
            referencedColumns: ["slug"]
          },
        ]
      }
      system_profiles: {
        Row: {
          birim_agirlik: number
          id: string
          profil_adi: string
          profil_kodu: string
          profil_resmi: string | null
          sort_order: number
          system_slug: string
        }
        Insert: {
          birim_agirlik: number
          id?: string
          profil_adi: string
          profil_kodu: string
          profil_resmi?: string | null
          sort_order?: number
          system_slug: string
        }
        Update: {
          birim_agirlik?: number
          id?: string
          profil_adi?: string
          profil_kodu?: string
          profil_resmi?: string | null
          sort_order?: number
          system_slug?: string
        }
        Relationships: []
      }
      systems: {
        Row: {
          button_labels: Json
          created_at: string
          description: string | null
          image_url: string | null
          is_active: boolean
          links: Json
          meta: Json
          slug: string
          tag: string | null
          title: string
        }
        Insert: {
          button_labels?: Json
          created_at?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          links?: Json
          meta?: Json
          slug: string
          tag?: string | null
          title: string
        }
        Update: {
          button_labels?: Json
          created_at?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          links?: Json
          meta?: Json
          slug?: string
          tag?: string | null
          title?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          deleted_at: string | null
          deleted_by: string | null
          deleted_reason: string | null
          email: string
          id: string
          image: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string
          username: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          email: string
          id: string
          image?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          username: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
          deleted_reason?: string | null
          email?: string
          id?: string
          image?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      variants: {
        Row: {
          id: string
          key: string
          name: string
          sort: number
        }
        Insert: {
          id?: string
          key: string
          name: string
          sort?: number
        }
        Update: {
          id?: string
          key?: string
          name?: string
          sort?: number
        }
        Relationships: []
      }
    }
    Views: {
      category_stats: {
        Row: {
          id: string | null
          name: string | null
          parent_id: string | null
          product_count: number | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "category_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comment_vote_stats: {
        Row: {
          comment_id: number | null
          dislikes: number | null
          likes: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_comment_votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "product_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      requests_status_counts: {
        Row: {
          cnt: number | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      email_available: {
        Args: { p_email: string }
        Returns: boolean
      }
      is_current_owner: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_current_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      request_approve_or_reject: {
        Args: { p_id: string; p_status: string }
        Returns: {
          id: string
          status: string
        }[]
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
      }
      username_available: {
        Args: { p_username: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "Admin" | "Manager" | "User"
      app_status: "Active" | "Inactive" | "Banned"
      product_category: "Profil" | "Kapı" | "Pencere" | "Aksesuar"
      product_variant: "Kasa" | "Kanat" | "Ray" | "Fitil" | "Kilit"
      role_t: "Admin" | "Manager" | "User"
      status_t: "Active" | "Inactive" | "Banned"
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
    Enums: {
      app_role: ["Admin", "Manager", "User"],
      app_status: ["Active", "Inactive", "Banned"],
      product_category: ["Profil", "Kapı", "Pencere", "Aksesuar"],
      product_variant: ["Kasa", "Kanat", "Ray", "Fitil", "Kilit"],
      role_t: ["Admin", "Manager", "User"],
      status_t: ["Active", "Inactive", "Banned"],
    },
  },
} as const
