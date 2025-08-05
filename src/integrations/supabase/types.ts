export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ad_sizes: {
        Row: {
          available_for: Json | null
          base_price_per_area: number
          base_price_per_month: number
          created_at: string
          dimensions: string
          fixed_pricing_per_issue: Json | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          subscription_pricing_per_issue: Json | null
          updated_at: string
        }
        Insert: {
          available_for?: Json | null
          base_price_per_area?: number
          base_price_per_month?: number
          created_at?: string
          dimensions: string
          fixed_pricing_per_issue?: Json | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          subscription_pricing_per_issue?: Json | null
          updated_at?: string
        }
        Update: {
          available_for?: Json | null
          base_price_per_area?: number
          base_price_per_month?: number
          created_at?: string
          dimensions?: string
          fixed_pricing_per_issue?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          subscription_pricing_per_issue?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      business_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_reviews: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          category_id: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          featured: boolean | null
          featured_image_url: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          postcode: string | null
          slug: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          category_id?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          featured_image_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          postcode?: string | null
          slug?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "business_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      component_settings: {
        Row: {
          component_name: string
          created_at: string
          id: string
          is_enabled: boolean
          settings: Json | null
          updated_at: string
        }
        Insert: {
          component_name: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          component_name?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          block_type: string
          content: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          position: string | null
          settings: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          block_type: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          position?: string | null
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          block_type?: string
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: string | null
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          area: string
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          image: string | null
          location: string
          organizer: string | null
          postcode: string | null
          time: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area: string
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          image?: string | null
          location: string
          organizer?: string | null
          postcode?: string | null
          time: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area?: string
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          image?: string | null
          location?: string
          organizer?: string | null
          postcode?: string | null
          time?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          uploaded_by: string | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      navigation_menus: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          location: string
          menu_items: Json
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          location: string
          menu_items?: Json
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          location?: string
          menu_items?: Json
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: Json
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          parent_id: string | null
          slug: string
          sort_order: number | null
          template: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          template?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          template?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pages_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_areas: {
        Row: {
          base_price_multiplier: number
          circulation: number
          created_at: string
          full_page_multiplier: number
          half_page_multiplier: number
          id: string
          is_active: boolean
          name: string
          postcodes: string[]
          quarter_page_multiplier: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price_multiplier?: number
          circulation?: number
          created_at?: string
          full_page_multiplier?: number
          half_page_multiplier?: number
          id?: string
          is_active?: boolean
          name: string
          postcodes?: string[]
          quarter_page_multiplier?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price_multiplier?: number
          circulation?: number
          created_at?: string
          full_page_multiplier?: number
          half_page_multiplier?: number
          id?: string
          is_active?: boolean
          name?: string
          postcodes?: string[]
          quarter_page_multiplier?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      pricing_durations: {
        Row: {
          created_at: string
          discount_percentage: number
          duration_type: string
          duration_value: number
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number
          duration_type: string
          duration_value: number
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          duration_type?: string
          duration_value?: number
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      special_deals: {
        Row: {
          created_at: string
          deal_type: string
          deal_value: number
          description: string | null
          id: string
          is_active: boolean
          min_areas: number | null
          name: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          deal_type: string
          deal_value?: number
          description?: string | null
          id?: string
          is_active?: boolean
          min_areas?: number | null
          name: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          deal_type?: string
          deal_value?: number
          description?: string | null
          id?: string
          is_active?: boolean
          min_areas?: number | null
          name?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          area: string
          author_id: string | null
          author_name: string | null
          category: string
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          published_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          area: string
          author_id?: string | null
          author_name?: string | null
          category: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          area?: string
          author_id?: string | null
          author_name?: string | null
          category?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          created_at: string
          id: string
          setting_group: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_group: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_group?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      volume_discounts: {
        Row: {
          created_at: string
          discount_percentage: number
          id: string
          is_active: boolean
          max_areas: number | null
          min_areas: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_areas?: number | null
          min_areas: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_areas?: number | null
          min_areas?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { user_email: string }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
