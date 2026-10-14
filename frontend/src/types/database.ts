// ============================================================
// Auto-generated TypeScript types for the Supabase schema.
// Provides compile-time type safety for all database queries.
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type AdStatus = 'active' | 'pending' | 'expired' | 'sold' | 'rejected' | 'deleted';
export type AdCondition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';
export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'duplicate' | 'wrong_category' | 'other';
export type MessageStatus = 'sent' | 'delivered' | 'read';
export type UserRole = 'user' | 'seller' | 'admin';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          city: string | null;
          is_phone_verified: boolean;
          is_email_verified: boolean;
          allow_whatsapp: boolean;
          bio: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          is_phone_verified?: boolean;
          is_email_verified?: boolean;
          allow_whatsapp?: boolean;
          bio?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          is_phone_verified?: boolean;
          is_email_verified?: boolean;
          allow_whatsapp?: boolean;
          bio?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          icon: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          icon?: string;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      subcategories: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          category_id: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          city: string;
          state: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city?: string;
          state?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          city?: string;
          state?: string;
          is_active?: boolean;
        };
      };
      ads: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          subcategory_id: string | null;
          title: string;
          slug: string;
          description: string;
          price: number | null;
          price_text: string | null;
          is_negotiable: boolean;
          condition: AdCondition | null;
          brand: string | null;
          year: number | null;
          location_id: string | null;
          location_text: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          allow_whatsapp: boolean;
          status: AdStatus;
          views_count: number;
          is_featured: boolean;
          expires_at: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          subcategory_id?: string | null;
          title: string;
          slug?: string;
          description: string;
          price?: number | null;
          price_text?: string | null;
          is_negotiable?: boolean;
          condition?: AdCondition | null;
          brand?: string | null;
          year?: number | null;
          location_id?: string | null;
          location_text?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          allow_whatsapp?: boolean;
          status?: AdStatus;
          is_featured?: boolean;
          expires_at?: string;
        };
        Update: {
          category_id?: string;
          subcategory_id?: string | null;
          title?: string;
          description?: string;
          price?: number | null;
          price_text?: string | null;
          is_negotiable?: boolean;
          condition?: AdCondition | null;
          brand?: string | null;
          year?: number | null;
          location_id?: string | null;
          location_text?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          allow_whatsapp?: boolean;
          status?: AdStatus;
          is_featured?: boolean;
          expires_at?: string;
          updated_at?: string;
        };
      };
      ad_images: {
        Row: {
          id: string;
          ad_id: string;
          image_url: string;
          storage_path: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          image_url: string;
          storage_path?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          image_url?: string;
          storage_path?: string | null;
          sort_order?: number;
        };
      };
      saved_ads: {
        Row: {
          id: string;
          user_id: string;
          ad_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ad_id: string;
          created_at?: string;
        };
        Update: never;
      };
      conversations: {
        Row: {
          id: string;
          ad_id: string;
          buyer_id: string;
          seller_id: string;
          last_message_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          buyer_id: string;
          seller_id: string;
          last_message_at?: string;
          created_at?: string;
        };
        Update: {
          last_message_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status: MessageStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status?: MessageStatus;
          created_at?: string;
        };
        Update: {
          content?: string;
          status?: MessageStatus;
        };
      };
      reports: {
        Row: {
          id: string;
          ad_id: string;
          reporter_id: string;
          reason: ReportReason;
          details: string | null;
          is_resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          reporter_id: string;
          reason: ReportReason;
          details?: string | null;
          is_resolved?: boolean;
          created_at?: string;
        };
        Update: {
          reason?: ReportReason;
          details?: string | null;
          is_resolved?: boolean;
        };
      };
      ad_views: {
        Row: {
          id: string;
          ad_id: string;
          viewer_id: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ad_id: string;
          viewer_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      ads_with_details: {
        Row: {
          id: string;
          user_id: string;
          category_id: string;
          title: string;
          slug: string;
          description: string;
          price: number | null;
          price_text: string | null;
          location_text: string | null;
          status: AdStatus;
          views_count: number;
          created_at: string;
          seller_name: string;
          seller_avatar: string | null;
          seller_verified: boolean;
          category_name: string;
          category_icon: string;
          location_name: string | null;
          cover_image: string | null;
          image_count: number;
        };
      };
      category_counts: {
        Row: {
          id: string;
          name: string;
          icon: string;
          sort_order: number;
          ad_count: number;
        };
      };
    };
    Functions: {
      search_ads: {
        Args: {
          search_term?: string;
          category_filter?: string;
          location_filter?: string;
          min_price?: number;
          max_price?: number;
          page_number?: number;
          page_size?: number;
        };
        Returns: {
          id: string;
          title: string;
          slug: string;
          price: number | null;
          price_text: string | null;
          location_text: string | null;
          cover_image: string | null;
          category_id: string;
          category_name: string;
          seller_name: string;
          created_at: string;
          views_count: number;
          total_count: number;
        }[];
      };
    };
    Enums: {
      ad_status: AdStatus;
      ad_condition: AdCondition;
      report_reason: ReportReason;
      message_status: MessageStatus;
    };
  };
}
