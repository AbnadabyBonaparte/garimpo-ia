/**
 * GARIMPO IA™ — Type Definitions
 * SSOT para todos os tipos TypeScript do projeto.
 */

/* ═══════════════════════════════════════════
   DATABASE / DOMAIN TYPES
═══════════════════════════════════════════ */

export interface Opportunity {
  id: string;
  title: string;
  category: OpportunityCategory;
  score: number;
  location: string;
  state: string;
  year: number | null;
  current_bid: number;
  market_value: number;
  profit_potential: number;
  roi_percentage: number;
  auction_source: string;
  auction_url: string;
  closes_at: string;
  risk_level: RiskLevel;
  risk_notes: string | null;
  liquidity: LiquidityLevel;
  ai_analysis: string | null;
  images: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type OpportunityCategory =
  | 'vehicle'
  | 'property'
  | 'agriculture'
  | 'machinery'
  | 'electronics'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high';
export type LiquidityLevel = 'high' | 'medium' | 'low';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_expires_at: string | null;
  preferred_categories: OpportunityCategory[];
  preferred_states: string[];
  notification_whatsapp: boolean;
  notification_email: boolean;
  notification_push: boolean;
  created_at: string;
}

export type SubscriptionTier = 'free' | 'explorer' | 'hunter' | 'miner';

export interface Alert {
  id: string;
  user_id: string;
  opportunity_id: string;
  channel: AlertChannel;
  sent_at: string;
  read_at: string | null;
}

export type AlertChannel = 'whatsapp' | 'email' | 'push' | 'in_app';

/** User-defined alert rule: notify when opportunities match criteria */
export interface AlertRule {
  id: string;
  user_id: string;
  min_score: number;
  categories: OpportunityCategory[];
  states: string[];
  created_at: string;
}

export interface AuctionSource {
  id: string;
  name: string;
  url: string;
  scrape_frequency_minutes: number;
  last_scraped_at: string | null;
  is_active: boolean;
}

/* ═══════════════════════════════════════════
   UI / STATE TYPES
═══════════════════════════════════════════ */

export type Theme = 'dark' | 'light';

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

export interface FilterOptions {
  categories: OpportunityCategory[];
  states: string[];
  min_score: number;
  max_score: number;
  min_roi: number;
  sort_by: 'score' | 'roi' | 'closes_at' | 'created_at';
  sort_order: 'asc' | 'desc';
}

/* ═══════════════════════════════════════════
   API / SERVICE TYPES
═══════════════════════════════════════════ */

export interface AIAnalysisRequest {
  opportunity_id: string;
  category: OpportunityCategory;
  current_bid: number;
  market_value: number;
  location: string;
  additional_context?: string;
}

export interface AIAnalysisResponse {
  score: number;
  summary: string;
  risks: string[];
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  estimated_total_cost: number;
  estimated_net_profit: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}
