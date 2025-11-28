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
      ad_preview_images: {
        Row: {
          ad_size_id: string
          created_at: string
          id: string
          image_name: string
          image_url: string
          is_active: boolean
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          ad_size_id: string
          created_at?: string
          id?: string
          image_name: string
          image_url: string
          is_active?: boolean
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          ad_size_id?: string
          created_at?: string
          id?: string
          image_name?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_preview_images_ad_size_id_fkey"
            columns: ["ad_size_id"]
            isOneToOne: false
            referencedRelation: "ad_sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sizes: {
        Row: {
          available_for: Json | null
          base_price_per_area: number
          base_price_per_month: number
          created_at: string
          design_fee: number
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
          design_fee?: number
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
          design_fee?: number
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
      alerts: {
        Row: {
          alert_type: string
          badge_color: string | null
          badge_text: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          message: string
          priority: number
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          priority?: number
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          priority?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          ad_size_id: string | null
          bogof_free_area_ids: string[] | null
          bogof_paid_area_ids: string[] | null
          company: string | null
          contact_name: string
          created_at: string
          device_fingerprint: string | null
          duration_discount_percent: number | null
          duration_id: string | null
          duration_multiplier: number | null
          email: string
          final_total: number | null
          gocardless_mandate_id: string | null
          id: string
          invoice_generated: boolean | null
          ip_address_hash: string | null
          monthly_price: number
          notes: string | null
          payment_status: string | null
          phone: string | null
          pricing_breakdown: Json
          pricing_model: string
          selected_area_ids: string[] | null
          selections: Json
          status: string
          subtotal: number | null
          title: string | null
          total_circulation: number | null
          updated_at: string
          user_id: string
          volume_discount_percent: number | null
          webhook_payload: Json
          webhook_response: Json | null
          webhook_sent_at: string | null
        }
        Insert: {
          ad_size_id?: string | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name: string
          created_at?: string
          device_fingerprint?: string | null
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email: string
          final_total?: number | null
          gocardless_mandate_id?: string | null
          id?: string
          invoice_generated?: boolean | null
          ip_address_hash?: string | null
          monthly_price?: number
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id: string
          volume_discount_percent?: number | null
          webhook_payload?: Json
          webhook_response?: Json | null
          webhook_sent_at?: string | null
        }
        Update: {
          ad_size_id?: string | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name?: string
          created_at?: string
          device_fingerprint?: string | null
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email?: string
          final_total?: number | null
          gocardless_mandate_id?: string | null
          id?: string
          invoice_generated?: boolean | null
          ip_address_hash?: string | null
          monthly_price?: number
          notes?: string | null
          payment_status?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model?: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id?: string
          volume_discount_percent?: number | null
          webhook_payload?: Json
          webhook_response?: Json | null
          webhook_sent_at?: string | null
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
      gocardless_customers: {
        Row: {
          created_at: string | null
          gocardless_customer_id: string
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          gocardless_customer_id: string
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          gocardless_customer_id?: string
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gocardless_mandates: {
        Row: {
          booking_id: string | null
          created_at: string | null
          gocardless_customer_id: string
          gocardless_mandate_id: string
          id: string
          scheme: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          gocardless_customer_id: string
          gocardless_mandate_id: string
          id?: string
          scheme: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          gocardless_customer_id?: string
          gocardless_mandate_id?: string
          id?: string
          scheme?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gocardless_mandates_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      gocardless_payments: {
        Row: {
          amount: number
          booking_id: string
          charge_date: string | null
          created_at: string | null
          currency: string | null
          gocardless_mandate_id: string
          gocardless_payment_id: string
          id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          charge_date?: string | null
          created_at?: string | null
          currency?: string | null
          gocardless_mandate_id: string
          gocardless_payment_id: string
          id?: string
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          charge_date?: string | null
          created_at?: string | null
          currency?: string | null
          gocardless_mandate_id?: string
          gocardless_payment_id?: string
          id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gocardless_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      gocardless_subscriptions: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          currency: string | null
          end_date: string | null
          gocardless_mandate_id: string
          gocardless_subscription_id: string
          id: string
          interval_unit: string
          start_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          gocardless_mandate_id: string
          gocardless_subscription_id: string
          id?: string
          interval_unit: string
          start_date?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          gocardless_mandate_id?: string
          gocardless_subscription_id?: string
          id?: string
          interval_unit?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gocardless_subscriptions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          gocardless_mandate_id: string
          gocardless_payment_id: string | null
          gocardless_subscription_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          payment_type: string
          pdf_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          gocardless_mandate_id: string
          gocardless_payment_id?: string | null
          gocardless_subscription_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          payment_type: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          gocardless_mandate_id?: string
          gocardless_payment_id?: string | null
          gocardless_subscription_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          payment_type?: string
          pdf_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      leaflet_areas: {
        Row: {
          area_number: number
          bimonthly_circulation: number
          created_at: string
          id: string
          is_active: boolean
          name: string
          postcodes: string
          price_with_vat: number
          schedule: Json
          updated_at: string
        }
        Insert: {
          area_number: number
          bimonthly_circulation?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          postcodes: string
          price_with_vat?: number
          schedule?: Json
          updated_at?: string
        }
        Update: {
          area_number?: number
          bimonthly_circulation?: number
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          postcodes?: string
          price_with_vat?: number
          schedule?: Json
          updated_at?: string
        }
        Relationships: []
      }
      leaflet_campaign_durations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          issues: number
          months: number
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          issues: number
          months: number
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          issues?: number
          months?: number
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leaflet_sizes: {
        Row: {
          created_at: string
          description: string | null
          design_fee: number
          id: string
          is_active: boolean
          label: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          design_fee?: number
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          design_fee?: number
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number | null
          updated_at?: string
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
      payment_options: {
        Row: {
          additional_fee_percentage: number
          created_at: string
          description: string | null
          discount_percentage: number
          display_name: string
          id: string
          is_active: boolean
          minimum_payments: number | null
          option_type: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          additional_fee_percentage?: number
          created_at?: string
          description?: string | null
          discount_percentage?: number
          display_name: string
          id?: string
          is_active?: boolean
          minimum_payments?: number | null
          option_type: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          additional_fee_percentage?: number
          created_at?: string
          description?: string | null
          discount_percentage?: number
          display_name?: string
          id?: string
          is_active?: boolean
          minimum_payments?: number | null
          option_type?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
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
          schedule: Json
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
          schedule?: Json
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
          schedule?: Json
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
      product_packages: {
        Row: {
          badge_text: string | null
          badge_variant: string | null
          created_at: string
          cta_text: string
          description: string
          features: Json
          icon: string
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          package_id: string
          sort_order: number | null
          subtitle: string
          title: string
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          badge_variant?: string | null
          created_at?: string
          cta_text?: string
          description: string
          features?: Json
          icon?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          package_id: string
          sort_order?: number | null
          subtitle: string
          title: string
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          badge_variant?: string | null
          created_at?: string
          cta_text?: string
          description?: string
          features?: Json
          icon?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          package_id?: string
          sort_order?: number | null
          subtitle?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          agency_discount_percent: number | null
          agency_name: string | null
          created_at: string
          discount_type: string | null
          display_name: string | null
          id: string
          is_agency_member: boolean | null
          is_first_login: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agency_discount_percent?: number | null
          agency_name?: string | null
          created_at?: string
          discount_type?: string | null
          display_name?: string | null
          id?: string
          is_agency_member?: boolean | null
          is_first_login?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agency_discount_percent?: number | null
          agency_name?: string | null
          created_at?: string
          discount_type?: string | null
          display_name?: string | null
          id?: string
          is_agency_member?: boolean | null
          is_first_login?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          ad_size_id: string | null
          agency_discount_percent: number | null
          assigned_to: string | null
          bogof_free_area_ids: string[] | null
          bogof_paid_area_ids: string[] | null
          company: string | null
          contact_name: string
          created_at: string
          duration_discount_percent: number | null
          duration_id: string | null
          duration_multiplier: number | null
          email: string
          final_total: number | null
          id: string
          monthly_price: number
          notes: string | null
          phone: string | null
          pricing_breakdown: Json
          pricing_model: string
          selected_area_ids: string[] | null
          selections: Json
          status: string
          subtotal: number | null
          title: string | null
          total_circulation: number | null
          updated_at: string
          user_id: string | null
          volume_discount_percent: number | null
        }
        Insert: {
          ad_size_id?: string | null
          agency_discount_percent?: number | null
          assigned_to?: string | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name: string
          created_at?: string
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email: string
          final_total?: number | null
          id?: string
          monthly_price?: number
          notes?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id?: string | null
          volume_discount_percent?: number | null
        }
        Update: {
          ad_size_id?: string | null
          agency_discount_percent?: number | null
          assigned_to?: string | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name?: string
          created_at?: string
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email?: string
          final_total?: number | null
          id?: string
          monthly_price?: number
          notes?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model?: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id?: string | null
          volume_discount_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_ad_size_id_fkey"
            columns: ["ad_size_id"]
            isOneToOne: false
            referencedRelation: "ad_sizes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_duration_id_fkey"
            columns: ["duration_id"]
            isOneToOne: false
            referencedRelation: "pricing_durations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          ad_size_id: string | null
          agency_discount_percent: number | null
          bogof_free_area_ids: string[] | null
          bogof_paid_area_ids: string[] | null
          company: string | null
          contact_name: string | null
          created_at: string
          duration_discount_percent: number | null
          duration_id: string | null
          duration_multiplier: number | null
          email: string
          final_total: number | null
          id: string
          monthly_price: number
          notes: string | null
          phone: string | null
          pricing_breakdown: Json
          pricing_model: string
          selected_area_ids: string[] | null
          selections: Json
          status: string | null
          subtotal: number | null
          title: string | null
          total_circulation: number | null
          updated_at: string
          user_id: string
          volume_discount_percent: number | null
        }
        Insert: {
          ad_size_id?: string | null
          agency_discount_percent?: number | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name?: string | null
          created_at?: string
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email: string
          final_total?: number | null
          id?: string
          monthly_price?: number
          notes?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string | null
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id: string
          volume_discount_percent?: number | null
        }
        Update: {
          ad_size_id?: string | null
          agency_discount_percent?: number | null
          bogof_free_area_ids?: string[] | null
          bogof_paid_area_ids?: string[] | null
          company?: string | null
          contact_name?: string | null
          created_at?: string
          duration_discount_percent?: number | null
          duration_id?: string | null
          duration_multiplier?: number | null
          email?: string
          final_total?: number | null
          id?: string
          monthly_price?: number
          notes?: string | null
          phone?: string | null
          pricing_breakdown?: Json
          pricing_model?: string
          selected_area_ids?: string[] | null
          selections?: Json
          status?: string | null
          subtotal?: number | null
          title?: string | null
          total_circulation?: number | null
          updated_at?: string
          user_id?: string
          volume_discount_percent?: number | null
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
      vouchers: {
        Row: {
          created_at: string
          created_from_booking_id: string | null
          description: string | null
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          is_used: boolean
          service_type: string
          updated_at: string
          used_at: string | null
          user_id: string
          voucher_code: string
          voucher_type: string
        }
        Insert: {
          created_at?: string
          created_from_booking_id?: string | null
          description?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_used?: boolean
          service_type?: string
          updated_at?: string
          used_at?: string | null
          user_id: string
          voucher_code: string
          voucher_type?: string
        }
        Update: {
          created_at?: string
          created_from_booking_id?: string | null
          description?: string | null
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_used?: boolean
          service_type?: string
          updated_at?: string
          used_at?: string | null
          user_id?: string
          voucher_code?: string
          voucher_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: { Args: { user_email: string }; Returns: string }
      generate_invoice_number: { Args: never; Returns: string }
      generate_voucher_code: { Args: never; Returns: string }
      get_active_alerts: {
        Args: never
        Returns: {
          alert_type: string
          badge_color: string
          badge_text: string
          expires_at: string
          id: string
          is_active: boolean
          message: string
          priority: number
          title: string
        }[]
      }
      get_business_detail: {
        Args: { business_id: string }
        Returns: {
          address_line1: string
          address_line2: string
          business_categories: Json
          category_id: string
          city: string
          created_at: string
          description: string
          email: string
          featured: boolean
          featured_image_url: string
          id: string
          images: string[]
          is_verified: boolean
          logo_url: string
          name: string
          opening_hours: Json
          owner_id: string
          phone: string
          postcode: string
          updated_at: string
          website: string
        }[]
      }
      get_public_businesses: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_term?: string
        }
        Returns: {
          address_line1: string
          address_line2: string
          business_categories: Json
          category_id: string
          city: string
          created_at: string
          description: string
          featured: boolean
          featured_image_url: string
          id: string
          images: string[]
          is_verified: boolean
          logo_url: string
          name: string
          postcode: string
          updated_at: string
          website: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_booking_access: {
        Args: { booking_user_id: string }
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
