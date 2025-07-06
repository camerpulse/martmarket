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
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          admin_role: Database["public"]["Enums"]["admin_role"]
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          last_active: string | null
          permissions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_role?: Database["public"]["Enums"]["admin_role"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          permissions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_role?: Database["public"]["Enums"]["admin_role"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          last_active?: string | null
          permissions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_knowledge_base: {
        Row: {
          confidence_score: number
          content: Json
          created_at: string
          id: string
          is_active: boolean | null
          knowledge_type: string
          last_validated: string | null
          learned_at: string
          source_urls: string[] | null
          topic: string
          updated_at: string
          validation_count: number | null
        }
        Insert: {
          confidence_score?: number
          content: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_type: string
          last_validated?: string | null
          learned_at?: string
          source_urls?: string[] | null
          topic: string
          updated_at?: string
          validation_count?: number | null
        }
        Update: {
          confidence_score?: number
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          knowledge_type?: string
          last_validated?: string | null
          learned_at?: string
          source_urls?: string[] | null
          topic?: string
          updated_at?: string
          validation_count?: number | null
        }
        Relationships: []
      }
      ai_learning_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          data_sources: string[] | null
          id: string
          insights_generated: number | null
          knowledge_updated: number | null
          performance_metrics: Json | null
          session_type: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          data_sources?: string[] | null
          id?: string
          insights_generated?: number | null
          knowledge_updated?: number | null
          performance_metrics?: Json | null
          session_type: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          data_sources?: string[] | null
          id?: string
          insights_generated?: number | null
          knowledge_updated?: number | null
          performance_metrics?: Json | null
          session_type?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      ai_model_evolution: {
        Row: {
          created_at: string
          evolved_at: string
          id: string
          improvement_type: string
          is_active: boolean | null
          learning_method: string | null
          model_version: string
          performance_after: Json | null
          performance_before: Json | null
          training_data_size: number | null
        }
        Insert: {
          created_at?: string
          evolved_at?: string
          id?: string
          improvement_type: string
          is_active?: boolean | null
          learning_method?: string | null
          model_version: string
          performance_after?: Json | null
          performance_before?: Json | null
          training_data_size?: number | null
        }
        Update: {
          created_at?: string
          evolved_at?: string
          id?: string
          improvement_type?: string
          is_active?: boolean | null
          learning_method?: string | null
          model_version?: string
          performance_after?: Json | null
          performance_before?: Json | null
          training_data_size?: number | null
        }
        Relationships: []
      }
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
      bitcoin_network_fees: {
        Row: {
          captured_at: string
          estimated_confirmation_blocks: number
          fee_rate_sat_per_vbyte: number
          id: string
          priority_level: string
        }
        Insert: {
          captured_at?: string
          estimated_confirmation_blocks: number
          fee_rate_sat_per_vbyte: number
          id?: string
          priority_level: string
        }
        Update: {
          captured_at?: string
          estimated_confirmation_blocks?: number
          fee_rate_sat_per_vbyte?: number
          id?: string
          priority_level?: string
        }
        Relationships: []
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
      dispute_evidence: {
        Row: {
          created_at: string | null
          description: string | null
          dispute_id: string
          evidence_type: string | null
          file_url: string | null
          id: string
          submitted_by: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          dispute_id: string
          evidence_type?: string | null
          file_url?: string | null
          id?: string
          submitted_by: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          dispute_id?: string
          evidence_type?: string | null
          file_url?: string | null
          id?: string
          submitted_by?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          dispute_id: string
          id: string
          is_internal: boolean | null
          message_type: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          dispute_id: string
          id?: string
          is_internal?: boolean | null
          message_type?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          dispute_id?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_resolutions: {
        Row: {
          admin_decision: boolean | null
          buyer_agreed: boolean | null
          created_at: string | null
          dispute_id: string
          expires_at: string | null
          id: string
          refund_amount_btc: number | null
          resolution_details: Json | null
          resolution_type: string | null
          resolved_by: string | null
          vendor_agreed: boolean | null
        }
        Insert: {
          admin_decision?: boolean | null
          buyer_agreed?: boolean | null
          created_at?: string | null
          dispute_id: string
          expires_at?: string | null
          id?: string
          refund_amount_btc?: number | null
          resolution_details?: Json | null
          resolution_type?: string | null
          resolved_by?: string | null
          vendor_agreed?: boolean | null
        }
        Update: {
          admin_decision?: boolean | null
          buyer_agreed?: boolean | null
          created_at?: string | null
          dispute_id?: string
          expires_at?: string | null
          id?: string
          refund_amount_btc?: number | null
          resolution_details?: Json | null
          resolution_type?: string | null
          resolved_by?: string | null
          vendor_agreed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "dispute_resolutions_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_statistics: {
        Row: {
          average_resolution_days: number | null
          dispute_rate_percentage: number | null
          disputes_favor_buyer: number | null
          disputes_favor_vendor: number | null
          id: string
          resolved_disputes: number | null
          total_disputes: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          average_resolution_days?: number | null
          dispute_rate_percentage?: number | null
          disputes_favor_buyer?: number | null
          disputes_favor_vendor?: number | null
          id?: string
          resolved_disputes?: number | null
          total_disputes?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          average_resolution_days?: number | null
          dispute_rate_percentage?: number | null
          disputes_favor_buyer?: number | null
          disputes_favor_vendor?: number | null
          id?: string
          resolved_disputes?: number | null
          total_disputes?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          admin_assigned: string | null
          amount_disputed_btc: number | null
          auto_close_at: string | null
          buyer_id: string
          category: Database["public"]["Enums"]["dispute_category"]
          created_at: string | null
          description: string
          escalated_at: string | null
          escalation_reason: string | null
          evidence_urls: string[] | null
          id: string
          order_id: string
          priority: Database["public"]["Enums"]["dispute_priority"] | null
          resolution_deadline: string | null
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          admin_assigned?: string | null
          amount_disputed_btc?: number | null
          auto_close_at?: string | null
          buyer_id: string
          category: Database["public"]["Enums"]["dispute_category"]
          created_at?: string | null
          description: string
          escalated_at?: string | null
          escalation_reason?: string | null
          evidence_urls?: string[] | null
          id?: string
          order_id: string
          priority?: Database["public"]["Enums"]["dispute_priority"] | null
          resolution_deadline?: string | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          admin_assigned?: string | null
          amount_disputed_btc?: number | null
          auto_close_at?: string | null
          buyer_id?: string
          category?: Database["public"]["Enums"]["dispute_category"]
          created_at?: string | null
          description?: string
          escalated_at?: string | null
          escalation_reason?: string | null
          evidence_urls?: string[] | null
          id?: string
          order_id?: string
          priority?: Database["public"]["Enums"]["dispute_priority"] | null
          resolution_deadline?: string | null
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["dispute_status"] | null
          title?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          amount_satoshis: number
          auto_release_at: string | null
          buyer_id: string
          created_at: string
          dispute_started_at: string | null
          escrow_address: string
          funded_at: string | null
          id: string
          order_id: string
          platform_fee_satoshis: number
          refund_txid: string | null
          release_txid: string | null
          released_at: string | null
          status: string
          updated_at: string
          vendor_fee_satoshis: number
          vendor_id: string
        }
        Insert: {
          amount_satoshis: number
          auto_release_at?: string | null
          buyer_id: string
          created_at?: string
          dispute_started_at?: string | null
          escrow_address: string
          funded_at?: string | null
          id?: string
          order_id: string
          platform_fee_satoshis?: number
          refund_txid?: string | null
          release_txid?: string | null
          released_at?: string | null
          status?: string
          updated_at?: string
          vendor_fee_satoshis?: number
          vendor_id: string
        }
        Update: {
          amount_satoshis?: number
          auto_release_at?: string | null
          buyer_id?: string
          created_at?: string
          dispute_started_at?: string | null
          escrow_address?: string
          funded_at?: string | null
          id?: string
          order_id?: string
          platform_fee_satoshis?: number
          refund_txid?: string | null
          release_txid?: string | null
          released_at?: string | null
          status?: string
          updated_at?: string
          vendor_fee_satoshis?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_detection_rules: {
        Row: {
          action: string
          conditions: Json
          created_at: string
          id: string
          is_active: boolean | null
          rule_name: string
          rule_type: string
          threat_score: number | null
        }
        Insert: {
          action?: string
          conditions: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          rule_name: string
          rule_type: string
          threat_score?: number | null
        }
        Update: {
          action?: string
          conditions?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          rule_name?: string
          rule_type?: string
          threat_score?: number | null
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string
          encrypted_file_url: string
          encryption_key: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_image: boolean | null
          message_id: string
        }
        Insert: {
          created_at?: string
          encrypted_file_url: string
          encryption_key?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_image?: boolean | null
          message_id: string
        }
        Update: {
          created_at?: string
          encrypted_file_url?: string
          encryption_key?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_image?: boolean | null
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          buyer_id: string
          buyer_unread_count: number | null
          created_at: string
          id: string
          is_archived: boolean | null
          is_encrypted: boolean | null
          last_message_at: string | null
          order_id: string | null
          subject: string | null
          updated_at: string
          vendor_id: string
          vendor_unread_count: number | null
        }
        Insert: {
          buyer_id: string
          buyer_unread_count?: number | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_encrypted?: boolean | null
          last_message_at?: string | null
          order_id?: string | null
          subject?: string | null
          updated_at?: string
          vendor_id: string
          vendor_unread_count?: number | null
        }
        Update: {
          buyer_id?: string
          buyer_unread_count?: number | null
          created_at?: string
          id?: string
          is_archived?: boolean | null
          is_encrypted?: boolean | null
          last_message_at?: string | null
          order_id?: string | null
          subject?: string | null
          updated_at?: string
          vendor_id?: string
          vendor_unread_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          thread_id: string | null
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
          thread_id?: string | null
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
          thread_id?: string | null
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
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          failed_attempts: number | null
          id: string
          is_pgp_enabled: boolean | null
          is_sms_enabled: boolean | null
          is_totp_enabled: boolean | null
          last_totp_verify: string | null
          locked_until: string | null
          pgp_fingerprint: string | null
          pgp_public_key: string | null
          sms_phone: string | null
          totp_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          failed_attempts?: number | null
          id?: string
          is_pgp_enabled?: boolean | null
          is_sms_enabled?: boolean | null
          is_totp_enabled?: boolean | null
          last_totp_verify?: string | null
          locked_until?: string | null
          pgp_fingerprint?: string | null
          pgp_public_key?: string | null
          sms_phone?: string | null
          totp_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          failed_attempts?: number | null
          id?: string
          is_pgp_enabled?: boolean | null
          is_sms_enabled?: boolean | null
          is_totp_enabled?: boolean | null
          last_totp_verify?: string | null
          locked_until?: string | null
          pgp_fingerprint?: string | null
          pgp_public_key?: string | null
          sms_phone?: string | null
          totp_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      payment_confirmations: {
        Row: {
          amount_received_satoshis: number
          block_height: number | null
          confirmations: number
          confirmed_at: string | null
          created_at: string
          id: string
          is_valid: boolean | null
          payment_request_id: string
          txid: string
          updated_at: string
          validation_errors: string[] | null
        }
        Insert: {
          amount_received_satoshis: number
          block_height?: number | null
          confirmations?: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          is_valid?: boolean | null
          payment_request_id: string
          txid: string
          updated_at?: string
          validation_errors?: string[] | null
        }
        Update: {
          amount_received_satoshis?: number
          block_height?: number | null
          confirmations?: number
          confirmed_at?: string | null
          created_at?: string
          id?: string
          is_valid?: boolean | null
          payment_request_id?: string
          txid?: string
          updated_at?: string
          validation_errors?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_confirmations_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
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
      pgp_messages: {
        Row: {
          created_at: string
          encrypted_content: string
          id: string
          is_verified: boolean | null
          message_hash: string
          order_id: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          encrypted_content: string
          id?: string
          is_verified?: boolean | null
          message_hash: string
          order_id?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          encrypted_content?: string
          id?: string
          is_verified?: boolean | null
          message_hash?: string
          order_id?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pgp_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_type: string | null
          setting_value: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_type?: string | null
          setting_value: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_type?: string | null
          setting_value?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      product_ratings: {
        Row: {
          average_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          id: string
          one_star_count: number | null
          product_id: string
          three_star_count: number | null
          total_reviews: number | null
          two_star_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          product_id: string
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          product_id?: string
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_ratings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
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
          search_vector: unknown | null
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
          search_vector?: unknown | null
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
          search_vector?: unknown | null
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
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          created_at: string
          display_name: string | null
          id: string
          is_banned: boolean | null
          pgp_public_key: string | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_banned?: boolean | null
          pgp_public_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_banned?: boolean | null
          pgp_public_key?: string | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          communication_rating: number | null
          created_at: string
          helpful_votes: number | null
          id: string
          is_anonymous: boolean | null
          order_id: string
          overall_rating: number | null
          product_rating: number | null
          rating: number
          review_images: string[] | null
          review_status: string | null
          review_title: string | null
          reviewer_id: string
          shipping_rating: number | null
          vendor_id: string
          verified_purchase: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          order_id: string
          overall_rating?: number | null
          product_rating?: number | null
          rating: number
          review_images?: string[] | null
          review_status?: string | null
          review_title?: string | null
          reviewer_id: string
          shipping_rating?: number | null
          vendor_id: string
          verified_purchase?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          comment?: string | null
          communication_rating?: number | null
          created_at?: string
          helpful_votes?: number | null
          id?: string
          is_anonymous?: boolean | null
          order_id?: string
          overall_rating?: number | null
          product_rating?: number | null
          rating?: number
          review_images?: string[] | null
          review_status?: string | null
          review_title?: string | null
          reviewer_id?: string
          shipping_rating?: number | null
          vendor_id?: string
          verified_purchase?: boolean | null
          would_recommend?: boolean | null
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
      search_analytics: {
        Row: {
          conversion_rate: number | null
          id: string
          last_searched: string | null
          search_count: number | null
          search_term: string
          trending_score: number | null
        }
        Insert: {
          conversion_rate?: number | null
          id?: string
          last_searched?: string | null
          search_count?: number | null
          search_term: string
          trending_score?: number | null
        }
        Update: {
          conversion_rate?: number | null
          id?: string
          last_searched?: string | null
          search_count?: number | null
          search_term?: string
          trending_score?: number | null
        }
        Relationships: []
      }
      search_history: {
        Row: {
          clicked_product_id: string | null
          filters_applied: Json | null
          id: string
          results_count: number | null
          search_query: string
          search_timestamp: string | null
          user_id: string | null
        }
        Insert: {
          clicked_product_id?: string | null
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query: string
          search_timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_product_id?: string | null
          filters_applied?: Json | null
          id?: string
          results_count?: number | null
          search_query?: string
          search_timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      search_intelligence: {
        Row: {
          captured_at: string
          competition_level: string | null
          created_at: string
          id: string
          market_category: string | null
          opportunity_score: number | null
          related_terms: string[] | null
          search_term: string
          search_volume: number | null
          source: string
          trend_direction: string | null
          user_intent: Json | null
        }
        Insert: {
          captured_at?: string
          competition_level?: string | null
          created_at?: string
          id?: string
          market_category?: string | null
          opportunity_score?: number | null
          related_terms?: string[] | null
          search_term: string
          search_volume?: number | null
          source: string
          trend_direction?: string | null
          user_intent?: Json | null
        }
        Update: {
          captured_at?: string
          competition_level?: string | null
          created_at?: string
          id?: string
          market_category?: string | null
          opportunity_score?: number | null
          related_terms?: string[] | null
          search_term?: string
          search_volume?: number | null
          source?: string
          trend_direction?: string | null
          user_intent?: Json | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          blocked: boolean | null
          created_at: string
          event_data: Json | null
          event_level: string
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          threat_score: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          blocked?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_level?: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          threat_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          blocked?: boolean | null
          created_at?: string
          event_data?: Json | null
          event_level?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          threat_score?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          allowed_ip_ranges: unknown[] | null
          auto_logout_minutes: number | null
          blocked_countries: string[] | null
          created_at: string
          email_on_login: boolean | null
          email_on_suspicious: boolean | null
          id: string
          max_sessions: number | null
          password_expires_days: number | null
          require_mfa_for_login: boolean | null
          require_mfa_for_transactions: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_ip_ranges?: unknown[] | null
          auto_logout_minutes?: number | null
          blocked_countries?: string[] | null
          created_at?: string
          email_on_login?: boolean | null
          email_on_suspicious?: boolean | null
          id?: string
          max_sessions?: number | null
          password_expires_days?: number | null
          require_mfa_for_login?: boolean | null
          require_mfa_for_transactions?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_ip_ranges?: unknown[] | null
          auto_logout_minutes?: number | null
          blocked_countries?: string[] | null
          created_at?: string
          email_on_login?: boolean | null
          email_on_suspicious?: boolean | null
          id?: string
          max_sessions?: number | null
          password_expires_days?: number | null
          require_mfa_for_login?: boolean | null
          require_mfa_for_transactions?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      system_metrics: {
        Row: {
          id: string
          metric_data: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_data?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_data?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string | null
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
      typing_indicators: {
        Row: {
          id: string
          is_typing: boolean | null
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_typing?: boolean | null
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_typing?: boolean | null
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_reason: string
          banned_at: string | null
          banned_by: string
          created_at: string | null
          id: string
          is_active: boolean | null
          unbanned_at: string | null
          unbanned_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ban_reason: string
          banned_at?: string | null
          banned_by: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          unbanned_at?: string | null
          unbanned_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ban_reason?: string
          banned_at?: string | null
          banned_by?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          unbanned_at?: string | null
          unbanned_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          location_data: Json | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          location_data?: Json | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          bitcoin_address: string | null
          created_at: string
          description: string | null
          dispute_count: number | null
          id: string
          is_banned: boolean | null
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
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bitcoin_address?: string | null
          created_at?: string
          description?: string | null
          dispute_count?: number | null
          id?: string
          is_banned?: boolean | null
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
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          bitcoin_address?: string | null
          created_at?: string
          description?: string | null
          dispute_count?: number | null
          id?: string
          is_banned?: boolean | null
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
      vendor_ratings: {
        Row: {
          average_communication_rating: number | null
          average_overall_rating: number | null
          average_product_rating: number | null
          average_shipping_rating: number | null
          five_star_count: number | null
          four_star_count: number | null
          id: string
          one_star_count: number | null
          recommendation_percentage: number | null
          three_star_count: number | null
          total_reviews: number | null
          two_star_count: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          average_communication_rating?: number | null
          average_overall_rating?: number | null
          average_product_rating?: number | null
          average_shipping_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          recommendation_percentage?: number | null
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          average_communication_rating?: number | null
          average_overall_rating?: number | null
          average_product_rating?: number | null
          average_shipping_rating?: number | null
          five_star_count?: number | null
          four_star_count?: number | null
          id?: string
          one_star_count?: number | null
          recommendation_percentage?: number | null
          three_star_count?: number | null
          total_reviews?: number | null
          two_star_count?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_verifications: {
        Row: {
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_documents: Json | null
          updated_at: string | null
          vendor_id: string
          verification_notes: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_documents?: Json | null
          updated_at?: string | null
          vendor_id: string
          verification_notes?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_documents?: Json | null
          updated_at?: string | null
          vendor_id?: string
          verification_notes?: string | null
        }
        Relationships: []
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
      auto_escalate_disputes: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      auto_release_expired_escrow: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      calculate_threat_score: {
        Args: { user_id: string; event_type: string; event_data: Json }
        Returns: number
      }
      get_dashboard_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_required_confirmations: {
        Args: { amount_satoshis: number }
        Returns: number
      }
      get_trending_opportunities: {
        Args: Record<PropertyKey, never>
        Returns: {
          search_term: string
          opportunity_score: number
          trend_direction: string
          search_volume: number
          related_terms: string[]
        }[]
      }
      is_admin: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          p_admin_id: string
          p_action_type: string
          p_target_type: string
          p_target_id?: string
          p_details?: Json
        }
        Returns: undefined
      }
      log_search: {
        Args: {
          p_user_id: string
          p_search_query: string
          p_filters?: Json
          p_results_count?: number
        }
        Returns: undefined
      }
      mark_thread_as_read: {
        Args: { thread_id_param: string; user_id_param: string }
        Returns: undefined
      }
      requires_mfa_check: {
        Args: { user_id: string; action_type?: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator" | "support_agent"
      dispute_category:
        | "item_not_received"
        | "item_not_as_described"
        | "damaged_item"
        | "wrong_item"
        | "counterfeit_item"
        | "shipping_issues"
        | "communication_issues"
        | "refund_request"
        | "other"
      dispute_priority: "low" | "medium" | "high" | "urgent"
      dispute_status:
        | "open"
        | "under_review"
        | "awaiting_buyer_response"
        | "awaiting_vendor_response"
        | "escalated"
        | "resolved_favor_buyer"
        | "resolved_favor_vendor"
        | "resolved_mutual"
        | "closed_no_action"
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
    Enums: {
      admin_role: ["super_admin", "admin", "moderator", "support_agent"],
      dispute_category: [
        "item_not_received",
        "item_not_as_described",
        "damaged_item",
        "wrong_item",
        "counterfeit_item",
        "shipping_issues",
        "communication_issues",
        "refund_request",
        "other",
      ],
      dispute_priority: ["low", "medium", "high", "urgent"],
      dispute_status: [
        "open",
        "under_review",
        "awaiting_buyer_response",
        "awaiting_vendor_response",
        "escalated",
        "resolved_favor_buyer",
        "resolved_favor_vendor",
        "resolved_mutual",
        "closed_no_action",
      ],
    },
  },
} as const
