import React, { useState } from 'react';
import {
  ExternalLink,
  Image as ImageIcon,
  DollarSign,
  Tag,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Loader2,
  HelpCircle,
  Check,
} from 'lucide-react';
import { AdFormat, ProductAdFormData } from '../types/ad';
import { isValidUrl } from '../services/adService';
import { PRESET_CATEGORIES } from '../data/presets';
import headphoneImg from '../assets/images/sample_headphone_ad_1790407243641.jpg';
import keyboardImg from '../assets/images/sample_keyboard_ad_1790407255013.jpg';
import smartwatchImg from '../assets/images/sample_smartwatch_ad_1790407266603.jpg';

interface AdCreationFormProps {
  formData: ProductAdFormData;
  onChange: (field: keyof ProductAdFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  statusMessage?: { type: 'success' | 'error'; text: string } | null;
}

export const AdCreationForm: React.FC<AdCreationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isSubmitting,
  statusMessage,
}) => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showImagePresets, setShowImagePresets] = useState(false);
  const [urlVerified, setUrlVerified] = useState<string | null>(null);

  // Client-side validation logic
  const errors: Record<string, string> = {};

  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (formData.title.trim().length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }

  if (!formData.target_url || formData.target_url.trim() === '') {
    errors.target_url = 'Destination target URL is required';
  } else if (!isValidUrl(formData.target_url.trim())) {
    errors.target_url = 'Please provide a valid URL (e.g. https://domain.com/item)';
  }

  if (!formData.image_url || formData.image_url.trim() === '') {
    errors.image_url = 'Hosted image asset URL is required';
  } else if (!isValidUrl(formData.image_url.trim())) {
    errors.image_url = 'Please provide a valid image URL or choose a preset';
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleTestUrl = (url: string) => {
    if (isValidUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setUrlVerified(url);
      setTimeout(() => setUrlVerified(null), 2500);
    }
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <form
      onSubmit={(e) => {
        // Mark all primary fields touched
        setTouched({
          title: true,
          target_url: true,
          image_url: true,
        });
        if (isFormValid) {
          onSubmit(e);
        } else {
          e.preventDefault();
        }
      }}
      className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden"
    >
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-neutral-700/80 bg-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white tracking-tight">Create Sponsored Product Ad</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure payload for serverless publication to Supabase <code className="text-neutral-300 font-mono">sponsored_products</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            status: active
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* SECTION 1: Primary Product & Placement Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-700/50">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              1. Primary Details &amp; Placement
            </h3>
            <span className="text-[11px] text-neutral-400">Required fields marked with *</span>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="title" className="text-xs font-medium text-neutral-200">
                Item Title <span className="text-rose-400">*</span>
              </label>
              <span className="text-[11px] font-mono text-neutral-500">
                {formData.title.length} / 80 chars
              </span>
            </div>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => onChange('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              placeholder="e.g. Ergonomic Split Wireless Keyboard"
              maxLength={120}
              className={`w-full px-3.5 py-2 text-sm bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 transition-colors focus:outline-none focus:ring-1 ${
                touched.title && errors.title
                  ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                  : 'border-neutral-700 focus:border-indigo-500 focus:ring-indigo-500/30'
              }`}
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Format & Category (2-column layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Format Dropdown */}
            <div>
              <label htmlFor="format" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Display Format <span className="text-rose-400">*</span>
              </label>
              <select
                id="format"
                value={formData.format}
                onChange={(e) => onChange('format', e.target.value as AdFormat)}
                className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              >
                <option value="square">Square · 300x250 (Medium Rectangle)</option>
                <option value="rectangle">Rectangle · Wide Banner (Leaderboard)</option>
                <option value="sticker">Sticker · Sidebar / Anchor Widget</option>
              </select>
              <p className="mt-1 text-[11px] text-neutral-400">
                {formData.format === 'square' && 'Standard IAB 300x250 medium rectangle card'}
                {formData.format === 'rectangle' && 'Wide horizontal banner optimized for article breaks'}
                {formData.format === 'sticker' && 'Compact anchor badge for floating corners or skyscraper'}
              </p>
            </div>

            {/* Category Tag */}
            <div>
              <label htmlFor="category" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Category Tag
              </label>
              <div className="relative">
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => onChange('category', e.target.value.toLowerCase())}
                  placeholder="global"
                  className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {['global', 'electronics', 'productivity', 'audio'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onChange('category', cat)}
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                      formData.category === cat
                        ? 'bg-indigo-950/70 border-indigo-700 text-indigo-300'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    #{cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Target URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="target_url" className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                <span>Destination Target URL</span>
                <span className="text-rose-400">*</span>
              </label>
              {isValidUrl(formData.target_url) && (
                <button
                  type="button"
                  onClick={() => handleTestUrl(formData.target_url)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Test Link</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="target_url"
                type="url"
                value={formData.target_url}
                onChange={(e) => onChange('target_url', e.target.value)}
                onBlur={() => handleBlur('target_url')}
                placeholder="https://yourstore.com/products/item-slug?ref=sponsorgrid"
                className={`w-full px-3.5 py-2 text-sm bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 transition-colors focus:outline-none focus:ring-1 ${
                  touched.target_url && errors.target_url
                    ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                    : 'border-neutral-700 focus:border-indigo-500 focus:ring-indigo-500/30'
                }`}
              />
            </div>
            {touched.target_url && errors.target_url && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.target_url}
              </p>
            )}
          </div>

          {/* Hosted Image URL with Asset Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="image_url" className="text-xs font-medium text-neutral-200 flex items-center gap-1.5">
                <span>Hosted Image Asset URL</span>
                <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowImagePresets(!showImagePresets)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>{showImagePresets ? 'Hide Studio Assets' : 'Choose Studio Photo'}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="image_url"
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => onChange('image_url', e.target.value)}
                  onBlur={() => handleBlur('image_url')}
                  placeholder="https://cdn.example.com/assets/product-hero.jpg"
                  className={`w-full px-3.5 py-2 text-sm bg-neutral-900 border rounded-lg text-white placeholder-neutral-500 transition-colors focus:outline-none focus:ring-1 ${
                    touched.image_url && errors.image_url
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
                      : 'border-neutral-700 focus:border-indigo-500 focus:ring-indigo-500/30'
                  }`}
                />
              </div>

              {formData.image_url && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-900 shrink-0 flex items-center justify-center">
                  <img
                    src={formData.image_url}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quick studio presets picker */}
            {showImagePresets && (
              <div className="mt-2 p-3 bg-neutral-900 border border-neutral-700 rounded-lg space-y-2">
                <span className="text-[11px] text-neutral-400 font-medium block">
                  Select High-Fidelity Studio Photo:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('image_url', headphoneImg);
                      setShowImagePresets(false);
                    }}
                    className="group relative rounded-md overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-all text-left"
                  >
                    <img src={headphoneImg} alt="Headphones" className="w-full h-16 object-cover" />
                    <span className="block px-1.5 py-1 text-[10px] text-neutral-300 bg-neutral-900/90 truncate">
                      ANC Headphones
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChange('image_url', keyboardImg);
                      setShowImagePresets(false);
                    }}
                    className="group relative rounded-md overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-all text-left"
                  >
                    <img src={keyboardImg} alt="Keyboard" className="w-full h-16 object-cover" />
                    <span className="block px-1.5 py-1 text-[10px] text-neutral-300 bg-neutral-900/90 truncate">
                      Split Keyboard
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChange('image_url', smartwatchImg);
                      setShowImagePresets(false);
                    }}
                    className="group relative rounded-md overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-all text-left"
                  >
                    <img src={smartwatchImg} alt="Smartwatch" className="w-full h-16 object-cover" />
                    <span className="block px-1.5 py-1 text-[10px] text-neutral-300 bg-neutral-900/90 truncate">
                      Chrono Watch
                    </span>
                  </button>
                </div>
              </div>
            )}

            {touched.image_url && errors.image_url && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.image_url}
              </p>
            )}
          </div>
        </div>

        {/* SECTION 2: Pricing & Promotional Fields */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between pb-1 border-b border-neutral-700/50">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              2. Pricing &amp; Promotional Badges
            </h3>
            <span className="text-[11px] text-neutral-500">Optional fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Regular MSRP Price */}
            <div>
              <label htmlFor="reg_price" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Standard MSRP (reg_price)
              </label>
              <div className="relative">
                <input
                  id="reg_price"
                  type="text"
                  value={formData.reg_price}
                  onChange={(e) => onChange('reg_price', e.target.value)}
                  placeholder="$99.99"
                  className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">Original price (struck through in preview)</p>
            </div>

            {/* Sale / Discount Price */}
            <div>
              <label htmlFor="sale_price" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Discounted Price (sale_price)
              </label>
              <div className="relative">
                <input
                  id="sale_price"
                  type="text"
                  value={formData.sale_price}
                  onChange={(e) => onChange('sale_price', e.target.value)}
                  placeholder="$69.99"
                  className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors font-mono font-medium text-emerald-400"
                />
              </div>
              <p className="mt-1 text-[11px] text-neutral-500">Active deal price highlighted to consumers</p>
            </div>

            {/* Discount Badge Text */}
            <div>
              <label htmlFor="discount_badge" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Discount Badge Text
              </label>
              <input
                id="discount_badge"
                type="text"
                value={formData.discount_badge}
                onChange={(e) => onChange('discount_badge', e.target.value)}
                placeholder="e.g. 30% OFF or LIMITED DEAL"
                maxLength={30}
                className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
              />
              <div className="mt-1.5 flex gap-1.5">
                {['30% OFF', 'SAVE $50', 'LIMITED DEAL', 'HOT DEAL'].map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => onChange('discount_badge', badge)}
                    className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Code */}
            <div>
              <label htmlFor="coupon_code" className="block text-xs font-medium text-neutral-200 mb-1.5">
                Coupon / Promo Code
              </label>
              <input
                id="coupon_code"
                type="text"
                value={formData.coupon_code}
                onChange={(e) => onChange('coupon_code', e.target.value.toUpperCase())}
                placeholder="e.g. SAVE30"
                maxLength={20}
                className="w-full px-3.5 py-2 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-colors font-mono tracking-wider uppercase"
              />
              <p className="mt-1 text-[11px] text-neutral-500">Renders as 1-click copy badge in the ad component</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: System State & Submission */}
        <div className="pt-2 border-t border-neutral-700/60">
          <div className="bg-neutral-900/60 border border-neutral-700/60 rounded-lg p-3 flex items-center justify-between text-xs text-neutral-400 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>
                System State: <strong className="text-neutral-200 font-mono">status = &apos;active&apos;</strong> (Auto-enforced)
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              Triggers static manifest rebuild webhook upon commit
            </span>
          </div>

          {/* Submission Status Message if any */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg mb-4 text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-700/80 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-700/80 text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-700 disabled:text-neutral-400 text-white font-semibold text-sm rounded-lg transition-all shadow-md hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Executing Supabase Insert &amp; Webhook Trigger...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Sponsored Ad &amp; Trigger Manifest Rebuild</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
