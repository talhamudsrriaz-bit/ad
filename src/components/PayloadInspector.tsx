import React, { useState } from 'react';
import { Copy, Check, Code, FileText, Send, Terminal } from 'lucide-react';
import { ProductAdFormData } from '../types/ad';

interface PayloadInspectorProps {
  formData: ProductAdFormData;
  compilerWebhookUrl: string;
}

export const PayloadInspector: React.FC<PayloadInspectorProps> = ({
  formData,
  compilerWebhookUrl,
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'webhook' | 'types'>('supabase');
  const [copied, setCopied] = useState(false);

  // Exact Supabase INSERT payload structure
  const supabasePayload = {
    title: formData.title || '(empty)',
    target_url: formData.target_url || '(empty)',
    image_url: formData.image_url || '(empty)',
    format: formData.format,
    category: formData.category || 'global',
    reg_price: formData.reg_price || null,
    sale_price: formData.sale_price || null,
    discount_badge: formData.discount_badge || null,
    coupon_code: formData.coupon_code || null,
    status: 'active',
  };

  // Compiler Webhook Request Body
  const webhookPayload = {
    event: 'sponsored_product.created',
    action: 'rebuild_manifest',
    table: 'sponsored_products',
    timestamp: new Date().toISOString(),
    record: supabasePayload,
    meta: {
      distribution_file: `s3://cdn.sponsorgrid.net/manifests/${formData.category || 'global'}/${formData.format}.json`,
      compiler_endpoint: compilerWebhookUrl,
      edge_cache_ttl_sec: 300,
    },
  };

  const getCodeString = () => {
    if (activeTab === 'supabase') {
      return JSON.stringify(supabasePayload, null, 2);
    }
    if (activeTab === 'webhook') {
      return JSON.stringify(webhookPayload, null, 2);
    }
    return `// TypeScript Interface
export interface SponsoredProductPayload {
  title: string;           // Required Text
  target_url: string;      // Required Destination Link
  image_url: string;       // Required Hosted Asset Link
  format: 'square' | 'rectangle' | 'sticker';
  category: string;        // Defaults to 'global'
  reg_price?: string;      // Optional MSRP e.g. "$99.99"
  sale_price?: string;     // Optional Discount e.g. "$69.99"
  discount_badge?: string; // Optional Badge e.g. "30% OFF"
  coupon_code?: string;    // Optional Promo e.g. "SAVE30"
  status: 'active';        // System State
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden">
      <div className="px-6 py-3 border-b border-neutral-700/80 bg-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Live Data Payload &amp; Pipeline Inspector</h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-700">
            <button
              onClick={() => setActiveTab('supabase')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'supabase' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Supabase Payload
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'webhook' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Compiler Webhook
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'types' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Types
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-700/50 hover:bg-neutral-700 rounded-md transition-colors flex items-center gap-1 text-xs font-medium"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-neutral-950 font-mono text-xs text-neutral-300 overflow-x-auto max-h-64">
        <pre className="leading-relaxed">
          <code>{getCodeString()}</code>
        </pre>
      </div>

      <div className="px-6 py-2.5 bg-neutral-900/90 border-t border-neutral-800 text-[11px] text-neutral-400 flex flex-wrap items-center justify-between gap-2">
        <span>
          Destination Target: <strong className="text-neutral-300 font-mono">public.sponsored_products</strong>
        </span>
        <span className="text-neutral-500 font-mono">
          Ready for Supabase REST POST · Prefer: return=representation
        </span>
      </div>
    </div>
  );
};
