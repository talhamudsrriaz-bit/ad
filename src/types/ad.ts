export type AdFormat = 'square' | 'rectangle' | 'sticker';

export interface ProductAdFormData {
  title: string;
  target_url: string;
  image_url: string;
  format: AdFormat;
  category: string;
  reg_price: string;
  sale_price: string;
  discount_badge: string;
  coupon_code: string;
  status: 'active';
}

export interface SponsoredProductRecord extends ProductAdFormData {
  id: string;
  created_at: string;
  updated_at?: string;
  clicks?: number;
  impressions?: number;
}

export interface NetworkConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  tableName: string;
  compilerWebhookUrl: string;
  isMockMode: boolean;
}

export interface NetworkSubmissionLog {
  id: string;
  timestamp: string;
  productTitle: string;
  format: AdFormat;
  supabaseStatus: 'pending' | 'success' | 'failed';
  supabaseStatusCode?: number;
  supabaseResponseText?: string;
  webhookStatus: 'pending' | 'success' | 'failed' | 'skipped';
  webhookStatusCode?: number;
  webhookResponseText?: string;
  payload: Record<string, unknown>;
  durationMs: number;
}
