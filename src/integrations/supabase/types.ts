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
      ai_optimization_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          input_data: Json
          model_used: string
          output_data: Json
          processing_time: number
          product_id: string | null
          tokens_used: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          input_data: Json
          model_used: string
          output_data: Json
          processing_time: number
          product_id?: string | null
          tokens_used?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          input_data?: Json
          model_used?: string
          output_data?: Json
          processing_time?: number
          product_id?: string | null
          tokens_used?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bitcoin_addresses: {
        Row: {
          address: string
          address_index: number
          address_path: string
          balance_satoshis: number | null
          created_at: string
          id: string
          is_used: boolean | null
          order_id: string | null
          purpose: string
          updated_at: string
          user_id: string | null
          vendor_bond_id: string | null
        }
        Insert: {
          address: string
          address_index: number
          address_path: string
          balance_satoshis?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          purpose: string
          updated_at?: string
          user_id?: string | null
          vendor_bond_id?: string | null
        }
        Update: {
          address?: string
          address_index?: number
          address_path?: string
          balance_satoshis?: number | null
          created_at?: string
          id?: string
          is_used?: boolean | null
          order_id?: string | null
          purpose?: string
          updated_at?: string
          user_id?: string | null
          vendor_bond_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bitcoin_addresses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bitcoin_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bitcoin_addresses_vendor_bond_id_fkey"
            columns: ["vendor_bond_id"]
            isOneToOne: false
            referencedRelation: "vendor_bonds"
            referencedColumns: ["id"]
          },
        ]
      }
      bitcoin_transactions: {
        Row: {
          address_id: string
          amount_satoshis: number
          block_height: number | null
          confirmations: number | null
          confirmed_at: string | null
          created_at: string
          detected_at: string
          id: string
          is_incoming: boolean | null
          processed: boolean | null
          txid: string
        }
        Insert: {
          address_id: string
          amount_satoshis: number
          block_height?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          is_incoming?: boolean | null
          processed?: boolean | null
          txid: string
        }
        Update: {
          address_id?: string
          amount_satoshis?: number
          block_height?: number | null
          confirmations?: number | null
          confirmed_at?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          is_incoming?: boolean | null
          processed?: boolean | null
          txid?: string
        }
        Relationships: [
          {
            foreignKeyName: "bitcoin_transactions_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "bitcoin_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message_type: string | null
          order_id: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          order_id?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          order_id?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          completed_at: string | null
          created_at: string
          dispute_reason: string | null
          escrow_address: string | null
          id: string
          payment_txid: string | null
          platform_fee_btc: number
          product_id: string
          quantity: number
          shipping_address: string | null
          status: string
          total_btc: number
          tracking_number: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          dispute_reason?: string | null
          escrow_address?: string | null
          id?: string
          payment_txid?: string | null
          platform_fee_btc?: number
          product_id: string
          quantity?: number
          shipping_address?: string | null
          status?: string
          total_btc: number
          tracking_number?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          dispute_reason?: string | null
          escrow_address?: string | null
          id?: string
          payment_txid?: string | null
          platform_fee_btc?: number
          product_id?: string
          quantity?: number
          shipping_address?: string | null
          status?: string
          total_btc?: number
          tracking_number?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount_satoshis: number
          amount_usd: number | null
          bitcoin_address_id: string
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          paid_at: string | null
          payment_type: string
          status: string
          user_id: string
          vendor_bond_id: string | null
        }
        Insert: {
          amount_satoshis: number
          amount_usd?: number | null
          bitcoin_address_id: string
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_type: string
          status?: string
          user_id: string
          vendor_bond_id?: string | null
        }
        Update: {
          amount_satoshis?: number
          amount_usd?: number | null
          bitcoin_address_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          paid_at?: string | null
          payment_type?: string
          status?: string
          user_id?: string
          vendor_bond_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_bitcoin_address_id_fkey"
            columns: ["bitcoin_address_id"]
            isOneToOne: false
            referencedRelation: "bitcoin_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_requests_vendor_bond_id_fkey"
            columns: ["vendor_bond_id"]
            isOneToOne: false
            referencedRelation: "vendor_bonds"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          is_active: boolean | null
          is_featured: boolean | null
          price_btc: number
          price_usd: number | null
          shipping_info: string | null
          stock_quantity: number | null
          tags: string[] | null
          title: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price_btc: number
          price_usd?: number | null
          shipping_info?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_featured?: boolean | null
          price_btc?: number
          price_usd?: number | null
          shipping_info?: string | null
          stock_quantity?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          pgp_public_key: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          pgp_public_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          pgp_public_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_anonymous: boolean | null
          order_id: string
          rating: number
          reviewer_id: string
          vendor_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          order_id: string
          rating: number
          reviewer_id: string
          vendor_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean | null
          order_id?: string
          rating?: number
          reviewer_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      system_config: {
        Row: {
          config_key: string
          config_value: string
          created_at: string
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          config_key: string
          config_value: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          config_key?: string
          config_value?: string
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trust_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          impact_score: number
          notes: string | null
          order_id: string | null
          review_id: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          impact_score: number
          notes?: string | null
          order_id?: string | null
          review_id?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          impact_score?: number
          notes?: string | null
          order_id?: string | null
          review_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_events_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_events_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendor_bonds: {
        Row: {
          bond_amount: number
          created_at: string
          expires_at: string
          id: string
          is_active: boolean | null
          paid_at: string
          payment_request_id: string | null
          payment_txid: string | null
          vendor_id: string
        }
        Insert: {
          bond_amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          paid_at?: string
          payment_request_id?: string | null
          payment_txid?: string | null
          vendor_id: string
        }
        Update: {
          bond_amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          paid_at?: string
          payment_request_id?: string | null
          payment_txid?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_bonds_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_bonds_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendor_profiles: {
        Row: {
          bitcoin_address: string | null
          created_at: string
          description: string | null
          dispute_count: number | null
          id: string
          is_featured: boolean | null
          is_verified: boolean | null
          payout_threshold: number | null
          response_time_hours: number | null
          store_name: string
          successful_orders: number | null
          total_sales: number | null
          trust_score: number | null
          updated_at: string
          vendor_id: string
          wallet_balance: number | null
        }
        Insert: {
          bitcoin_address?: string | null
          created_at?: string
          description?: string | null
          dispute_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          payout_threshold?: number | null
          response_time_hours?: number | null
          store_name: string
          successful_orders?: number | null
          total_sales?: number | null
          trust_score?: number | null
          updated_at?: string
          vendor_id: string
          wallet_balance?: number | null
        }
        Update: {
          bitcoin_address?: string | null
          created_at?: string
          description?: string | null
          dispute_count?: number | null
          id?: string
          is_featured?: boolean | null
          is_verified?: boolean | null
          payout_threshold?: number | null
          response_time_hours?: number | null
          store_name?: string
          successful_orders?: number | null
          total_sales?: number | null
          trust_score?: number | null
          updated_at?: string
          vendor_id?: string
          wallet_balance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallet_balances: {
        Row: {
          balance_satoshis: number | null
          created_at: string
          escrow_locked_satoshis: number | null
          id: string
          payout_pending_satoshis: number | null
          pending_deposits_satoshis: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_satoshis?: number | null
          created_at?: string
          escrow_locked_satoshis?: number | null
          id?: string
          payout_pending_satoshis?: number | null
          pending_deposits_satoshis?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_satoshis?: number | null
          created_at?: string
          escrow_locked_satoshis?: number | null
          id?: string
          payout_pending_satoshis?: number | null
          pending_deposits_satoshis?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
