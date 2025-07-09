// Common type definitions for the application

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  user_type: 'buyer' | 'vendor';
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface AIAction {
  id: string;
  type: string;
  title: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaymentData {
  payment_request_id: string;
  address: string;
  amount_btc: number;
  amount_usd: number;
  amount_satoshis: number;
  expires_at?: string;
}

export interface SessionContext {
  user_preferences?: Record<string, unknown>;
  conversation_history?: ChatMessage[];
  ai_personality?: Record<string, unknown>;
}

export interface AIStatus {
  is_active: boolean;
  last_learning_session?: string;
  knowledge_base_size: number;
  performance_metrics?: Record<string, number>;
}

export interface SecurityEvent {
  id: string;
  event_type: string;
  event_level: 'info' | 'warning' | 'critical';
  event_data: Record<string, unknown>;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface PredictiveInsight {
  id: string;
  category: string;
  prediction: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
  preventive_actions: string[];
}

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  last_updated: string;
}

export interface MarketOpportunity {
  keyword: string;
  search_volume: number;
  competition: number;
  opportunity_score: number;
  related_terms: string[];
}