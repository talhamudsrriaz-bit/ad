import { NetworkConfig, NetworkSubmissionLog, ProductAdFormData, SponsoredProductRecord } from '../types/ad';

const STORAGE_KEY_RECORDS = 'sponsorgrid_sponsored_products_v1';
const STORAGE_KEY_LOGS = 'sponsorgrid_submission_logs_v1';
const STORAGE_KEY_CONFIG = 'sponsorgrid_network_config_v1';

export const DEFAULT_NETWORK_CONFIG: NetworkConfig = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  tableName: 'sponsored_products',
  compilerWebhookUrl: 'https://api.sponsorgrid.net/v1/compiler/manifest-rebuild',
  isMockMode: true,
};

export function getStoredNetworkConfig(): NetworkConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return { ...DEFAULT_NETWORK_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load stored config', e);
  }
  return DEFAULT_NETWORK_CONFIG;
}

export function saveStoredNetworkConfig(config: NetworkConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config', e);
  }
}

export function getStoredProducts(): SponsoredProductRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load products', e);
  }
  return [];
}

export function saveStoredProduct(record: SponsoredProductRecord): void {
  try {
    const existing = getStoredProducts();
    const updated = [record, ...existing.filter((item) => item.id !== record.id)];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save product record', e);
  }
}

export function deleteStoredProduct(id: string): void {
  try {
    const existing = getStoredProducts();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete product record', e);
  }
}

export function getSubmissionLogs(): NetworkSubmissionLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load logs', e);
  }
  return [];
}

export function appendSubmissionLog(log: NetworkSubmissionLog): void {
  try {
    const existing = getSubmissionLogs();
    const updated = [log, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to append log', e);
  }
}

/**
 * Validates URLs specifically for http/https protocol
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  // Allow root or relative paths for internal images or standard http/https/blob/data
  if (urlString.startsWith('/') || urlString.startsWith('data:') || urlString.startsWith('blob:')) {
    return true;
  }
  try {
    const parsed = new URL(urlString);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Executes Supabase INSERT into `sponsored_products` table.
 * If credentials are configured, sends real POST to Supabase REST endpoint.
 * Otherwise runs deterministic serverless simulation mode.
 */
export async function insertSponsoredProductToSupabase(
  payload: ProductAdFormData,
  config: NetworkConfig
): Promise<{ success: boolean; data: any; statusCode: number; statusText: string }> {
  const isRealSupabase =
    !config.isMockMode &&
    Boolean(config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('http'));

  const insertPayload = {
    title: payload.title.trim(),
    target_url: payload.target_url.trim(),
    image_url: payload.image_url.trim(),
    format: payload.format,
    category: payload.category.trim() || 'global',
    reg_price: payload.reg_price.trim() || null,
    sale_price: payload.sale_price.trim() || null,
    discount_badge: payload.discount_badge.trim() || null,
    coupon_code: payload.coupon_code.trim() || null,
    status: 'active',
  };

  if (isRealSupabase) {
    const endpoint = `${config.supabaseUrl.replace(/\/$/, '')}/rest/v1/${config.tableName || 'sponsored_products'}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(insertPayload),
    });

    const text = await response.text();
    let parsedData = null;
    try {
      parsedData = text ? JSON.parse(text) : null;
    } catch {
      parsedData = text;
    }

    if (!response.ok) {
      throw new Error(`Supabase Error (${response.status}): ${typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData)}`);
    }

    return {
      success: true,
      data: Array.isArray(parsedData) ? parsedData[0] : parsedData,
      statusCode: response.status,
      statusText: response.statusText || 'Created',
    };
  } else {
    // Simulated Supabase execution (realistic 140ms latency)
    await new Promise((res) => setTimeout(res, 160));

    const simulatedId = 'sp_' + Math.random().toString(36).substring(2, 10);
    const createdRecord: SponsoredProductRecord = {
      ...insertPayload,
      category: insertPayload.category || 'global',
      reg_price: insertPayload.reg_price || '',
      sale_price: insertPayload.sale_price || '',
      discount_badge: insertPayload.discount_badge || '',
      coupon_code: insertPayload.coupon_code || '',
      status: 'active',
      id: simulatedId,
      created_at: new Date().toISOString(),
      clicks: 0,
      impressions: 0,
    };

    saveStoredProduct(createdRecord);

    return {
      success: true,
      data: createdRecord,
      statusCode: 201,
      statusText: 'Created (Simulated Supabase REST API)',
    };
  }
}

/**
 * Webhook Integration:
 * Asynchronous trigger upon successful ad creation to notify the static manifest generator
 * to rebuild network JSON static distribution files.
 */
export async function triggerCompilerWebhook(
  webhookUrl: string,
  payload: ProductAdFormData,
  recordId: string,
  isMockMode: boolean
): Promise<{ success: boolean; statusCode: number; responseText: string }> {
  if (!webhookUrl) {
    return {
      success: true,
      statusCode: 204,
      responseText: 'Skipped (No Webhook URL specified)',
    };
  }

  const webhookBody = {
    event: 'sponsored_product.created',
    action: 'rebuild_manifest',
    table: 'sponsored_products',
    record_id: recordId,
    timestamp: new Date().toISOString(),
    payload: {
      id: recordId,
      title: payload.title,
      format: payload.format,
      category: payload.category || 'global',
      target_url: payload.target_url,
      image_url: payload.image_url,
      reg_price: payload.reg_price || null,
      sale_price: payload.sale_price || null,
      discount_badge: payload.discount_badge || null,
      coupon_code: payload.coupon_code || null,
      status: 'active',
    },
    meta: {
      triggered_by: 'sponsorgrid_ui_client',
      manifest_target: `s3://cdn.sponsorgrid.net/manifests/${payload.category || 'global'}/${payload.format}.json`,
    },
  };

  if (!isMockMode && webhookUrl.startsWith('http')) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SponsorGrid-Event': 'ad_created',
        },
        body: JSON.stringify(webhookBody),
      });

      const text = await response.text();
      return {
        success: response.ok,
        statusCode: response.status,
        responseText: text || (response.ok ? 'Webhook received: Manifest build queued' : 'Webhook error'),
      };
    } catch (err: any) {
      console.warn('Real webhook call failed or was blocked by CORS:', err);
      // If blocked by CORS or network, still provide clear message
      return {
        success: false,
        statusCode: 0,
        responseText: `Network/CORS error reaching ${webhookUrl}: ${err.message}`,
      };
    }
  } else {
    // Simulated compiler webhook call
    await new Promise((res) => setTimeout(res, 220));
    return {
      success: true,
      statusCode: 200,
      responseText: JSON.stringify({
        status: 'queued',
        manifest: `${payload.category || 'global'}_${payload.format}.json`,
        cdn_invalidation_id: 'inv_' + Math.random().toString(36).substring(2, 8),
        rebuild_estimated_sec: 1.2,
      }),
    };
  }
}

/**
 * End-to-end Pipeline: Executes DB insert, followed immediately by asynchronous manifest compilation trigger
 */
export async function executeAdCreationPipeline(
  formData: ProductAdFormData,
  config: NetworkConfig
): Promise<{
  success: boolean;
  productRecord: any;
  submissionLog: NetworkSubmissionLog;
  error?: string;
}> {
  const startTime = performance.now();
  const submissionId = 'sub_' + Math.random().toString(36).substring(2, 9);

  let supabaseResult: any;
  let supabaseStatus: 'success' | 'failed' = 'failed';
  let supabaseCode = 500;
  let supabaseMsg = '';

  try {
    supabaseResult = await insertSponsoredProductToSupabase(formData, config);
    supabaseStatus = 'success';
    supabaseCode = supabaseResult.statusCode;
    supabaseMsg = supabaseResult.statusText;
  } catch (err: any) {
    const duration = Math.round(performance.now() - startTime);
    const log: NetworkSubmissionLog = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      productTitle: formData.title,
      format: formData.format,
      supabaseStatus: 'failed',
      supabaseStatusCode: 500,
      supabaseResponseText: err.message,
      webhookStatus: 'skipped',
      webhookStatusCode: 0,
      webhookResponseText: 'Aborted due to database insert failure',
      payload: formData as any,
      durationMs: duration,
    };
    appendSubmissionLog(log);
    return {
      success: false,
      productRecord: null,
      submissionLog: log,
      error: err.message,
    };
  }

  const recordId = supabaseResult.data?.id || 'sp_' + Math.random().toString(36).substring(2, 8);

  // Webhook Integration: Asynchronous trigger upon success
  let webhookStatus: 'success' | 'failed' | 'skipped' = 'skipped';
  let webhookCode = 200;
  let webhookText = '';

  try {
    const webhookRes = await triggerCompilerWebhook(
      config.compilerWebhookUrl,
      formData,
      recordId,
      config.isMockMode
    );
    webhookStatus = webhookRes.success ? 'success' : 'failed';
    webhookCode = webhookRes.statusCode;
    webhookText = webhookRes.responseText;
  } catch (webhookErr: any) {
    webhookStatus = 'failed';
    webhookCode = 500;
    webhookText = webhookErr.message || 'Webhook failed';
  }

  const duration = Math.round(performance.now() - startTime);
  const log: NetworkSubmissionLog = {
    id: submissionId,
    timestamp: new Date().toISOString(),
    productTitle: formData.title,
    format: formData.format,
    supabaseStatus,
    supabaseStatusCode: supabaseCode,
    supabaseResponseText: supabaseMsg,
    webhookStatus,
    webhookStatusCode: webhookCode,
    webhookResponseText: webhookText,
    payload: formData as any,
    durationMs: duration,
  };

  appendSubmissionLog(log);

  return {
    success: true,
    productRecord: supabaseResult.data,
    submissionLog: log,
  };
}

export function generateSupabaseSqlSchema(tableName = 'sponsored_products'): string {
  return `-- 1. Create sponsored_products table
CREATE TABLE IF NOT EXISTS public.${tableName} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    title TEXT NOT NULL,
    target_url TEXT NOT NULL,
    image_url TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('square', 'rectangle', 'sticker')),
    category TEXT NOT NULL DEFAULT 'global',
    reg_price TEXT,
    sale_price TEXT,
    discount_badge TEXT,
    coupon_code TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0
);

-- 2. Indexes for high-performance serverless query & static manifest extraction
CREATE INDEX IF NOT EXISTS idx_${tableName}_status_format ON public.${tableName}(status, format);
CREATE INDEX IF NOT EXISTS idx_${tableName}_category ON public.${tableName}(category);
CREATE INDEX IF NOT EXISTS idx_${tableName}_created_at ON public.${tableName}(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- 4. Public read policy for static manifest builder / edge workers
CREATE POLICY "Allow public read active ads" 
ON public.${tableName}
FOR SELECT 
USING (status = 'active');

-- 5. Service role / authenticated insert policy
CREATE POLICY "Allow authenticated or anon insertion" 
ON public.${tableName}
FOR INSERT 
WITH CHECK (true);
`;
}
