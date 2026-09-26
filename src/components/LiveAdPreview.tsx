import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Tag,
  Maximize2,
  Eye,
  LayoutTemplate,
  Monitor,
  Sparkles,
  MousePointerClick,
  HelpCircle,
} from 'lucide-react';
import { AdFormat, ProductAdFormData } from '../types/ad';

interface LiveAdPreviewProps {
  formData: ProductAdFormData;
  selectedFormat: AdFormat;
  onFormatChange: (format: AdFormat) => void;
  clickCount: number;
  onSimulateClick: () => void;
}

export const LiveAdPreview: React.FC<LiveAdPreviewProps> = ({
  formData,
  selectedFormat,
  onFormatChange,
  clickCount,
  onSimulateClick,
}) => {
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [previewContext, setPreviewContext] = useState<'isolated' | 'in_article' | 'sidebar'>('isolated');
  const [imageError, setImageError] = useState(false);

  // Copy coupon handler
  const handleCopyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (formData.coupon_code) {
      navigator.clipboard.writeText(formData.coupon_code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2000);
    }
  };

  // Image load fallback
  const handleImageError = () => {
    setImageError(true);
  };

  // Reset image error state when url changes
  React.useEffect(() => {
    setImageError(false);
  }, [formData.image_url]);

  // Fallback visual content
  const displayTitle = formData.title || 'Untitled Sponsored Product';
  const displayCategory = formData.category || 'global';
  const displayRegPrice = formData.reg_price;
  const displaySalePrice = formData.sale_price;
  const displayBadge = formData.discount_badge;
  const displayCoupon = formData.coupon_code;

  return (
    <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden flex flex-col h-full">
      {/* Preview Header & Controls */}
      <div className="px-6 py-4 border-b border-neutral-700/80 bg-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">Live Ad Component Preview</h2>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex items-center p-0.5 bg-neutral-900 rounded-lg border border-neutral-700/80">
          <button
            type="button"
            onClick={() => onFormatChange('square')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedFormat === 'square'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Square 300x250
          </button>
          <button
            type="button"
            onClick={() => onFormatChange('rectangle')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedFormat === 'rectangle'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rectangle Wide
          </button>
          <button
            type="button"
            onClick={() => onFormatChange('sticker')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              selectedFormat === 'sticker'
                ? 'bg-neutral-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Sticker Anchor
          </button>
        </div>
      </div>

      {/* Viewport Placement Context Toolbar */}
      <div className="px-6 py-2 bg-neutral-900/60 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-mono">View Mode:</span>
          <button
            type="button"
            onClick={() => setPreviewContext('isolated')}
            className={`px-2 py-0.5 rounded transition-colors ${
              previewContext === 'isolated' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Isolated Unit
          </button>
          <span className="text-neutral-600">·</span>
          <button
            type="button"
            onClick={() => setPreviewContext('in_article')}
            className={`px-2 py-0.5 rounded transition-colors ${
              previewContext === 'in_article' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            In-Article Feed
          </button>
          <span className="text-neutral-600">·</span>
          <button
            type="button"
            onClick={() => setPreviewContext('sidebar')}
            className={`px-2 py-0.5 rounded transition-colors ${
              previewContext === 'sidebar' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Host Sidebar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSimulateClick}
            className="text-[11px] text-neutral-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            title="Simulate ad click event"
          >
            <MousePointerClick className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Click</span>
            <span className="font-mono text-neutral-300 ml-0.5 tabular-nums">({clickCount})</span>
          </button>
        </div>
      </div>

      {/* Main Preview Canvas */}
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[380px] bg-neutral-950/60 relative overflow-auto">
        {/* Isolated Context Rendering */}
        {previewContext === 'isolated' && (
          <div className="flex flex-col items-center gap-3 w-full">
            <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-2">
              <span>Format: <strong className="text-neutral-300">{selectedFormat}</strong></span>
              <span>·</span>
              <span>
                {selectedFormat === 'square' && '300 × 250 px'}
                {selectedFormat === 'rectangle' && 'Wide Leaderboard ~ 680 × 120 px'}
                {selectedFormat === 'sticker' && 'Vertical Anchor ~ 240 × 420 px'}
              </span>
            </div>

            {/* Render actual ad component */}
            <AdComponentRenderer
              format={selectedFormat}
              title={displayTitle}
              category={displayCategory}
              regPrice={displayRegPrice}
              salePrice={displaySalePrice}
              discountBadge={displayBadge}
              couponCode={displayCoupon}
              imageUrl={formData.image_url}
              targetUrl={formData.target_url}
              imageError={imageError}
              onImageError={handleImageError}
              onCopyCoupon={handleCopyCoupon}
              copiedCoupon={copiedCoupon}
              onSimulateClick={onSimulateClick}
            />
          </div>
        )}

        {/* In-Article Host Context Rendering */}
        {previewContext === 'in_article' && (
          <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-lg text-neutral-300 space-y-4 text-xs leading-relaxed">
            <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono pb-2 border-b border-neutral-800">
              <span className="text-indigo-400 font-semibold">TechReview Daily</span>
              <span>/</span>
              <span>Hardware &amp; Gadgets Feed</span>
            </div>
            <p className="text-neutral-400">
              Modern mechanical keyboards and wireless workspace peripherals have redefined desktop comfort. Whether you spend hours writing code, editing video, or organizing spreadsheets, high-end ergonomics play a pivotal role.
            </p>

            {/* Embedded Ad */}
            <div className="py-2 flex justify-center">
              <AdComponentRenderer
                format={selectedFormat}
                title={displayTitle}
                category={displayCategory}
                regPrice={displayRegPrice}
                salePrice={displaySalePrice}
                discountBadge={displayBadge}
                couponCode={displayCoupon}
                imageUrl={formData.image_url}
                targetUrl={formData.target_url}
                imageError={imageError}
                onImageError={handleImageError}
                onCopyCoupon={handleCopyCoupon}
                copiedCoupon={copiedCoupon}
                onSimulateClick={onSimulateClick}
              />
            </div>

            <p className="text-neutral-400">
              In our extended lab testing across 40 hours of continuous typing, having dedicated firmware layers and balanced key switches produced noticeable reductions in wrist fatigue.
            </p>
          </div>
        )}

        {/* Sidebar Host Context Rendering */}
        {previewContext === 'sidebar' && (
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3 text-xs text-neutral-400 leading-relaxed">
              <div className="h-4 w-32 bg-neutral-800 rounded"></div>
              <h3 className="text-sm font-semibold text-white">Next-Generation Serverless Ad Manifests</h3>
              <p>
                Serverless ad networks bypass dynamic tracking servers by building pre-compiled static JSON manifests distributed directly via Edge CDNs.
              </p>
              <div className="h-24 bg-neutral-800/40 rounded border border-neutral-800 flex items-center justify-center text-neutral-600 text-[11px]">
                Article Media Placeholder
              </div>
              <p>
                Advertisers insert structured records into Supabase, and automated webhooks regenerate the global manifest in sub-second cycles.
              </p>
            </div>

            {/* Sidebar Column containing the ad */}
            <div className="border-t md:border-t-0 md:border-l border-neutral-800 pt-4 md:pt-0 md:pl-4 flex flex-col items-center">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-2 self-start">
                Sponsored Partner
              </span>
              <AdComponentRenderer
                format={selectedFormat === 'rectangle' ? 'square' : selectedFormat}
                title={displayTitle}
                category={displayCategory}
                regPrice={displayRegPrice}
                salePrice={displaySalePrice}
                discountBadge={displayBadge}
                couponCode={displayCoupon}
                imageUrl={formData.image_url}
                targetUrl={formData.target_url}
                imageError={imageError}
                onImageError={handleImageError}
                onCopyCoupon={handleCopyCoupon}
                copiedCoupon={copiedCoupon}
                onSimulateClick={onSimulateClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ad Specs & Quick Info Footer */}
      <div className="px-6 py-3 bg-neutral-800 border-t border-neutral-700/80 flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-neutral-300 font-medium">Target URL:</span>
          <span className="font-mono text-neutral-400 truncate max-w-xs" title={formData.target_url}>
            {formData.target_url || 'https://...'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>Format: <span className="font-mono text-neutral-200">{formData.format}</span></span>
          <span>·</span>
          <span>Category: <span className="font-mono text-neutral-200">{formData.category || 'global'}</span></span>
        </div>
      </div>
    </div>
  );
};

interface AdRendererProps {
  format: AdFormat;
  title: string;
  category: string;
  regPrice?: string;
  salePrice?: string;
  discountBadge?: string;
  couponCode?: string;
  imageUrl: string;
  targetUrl: string;
  imageError: boolean;
  onImageError: () => void;
  onCopyCoupon: (e: React.MouseEvent) => void;
  copiedCoupon: boolean;
  onSimulateClick: () => void;
}

export const AdComponentRenderer: React.FC<AdRendererProps> = ({
  format,
  title,
  category,
  regPrice,
  salePrice,
  discountBadge,
  couponCode,
  imageUrl,
  targetUrl,
  imageError,
  onImageError,
  onCopyCoupon,
  copiedCoupon,
  onSimulateClick,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSimulateClick();
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 1. SQUARE FORMAT: Standard 300x250 Medium Rectangle
  if (format === 'square') {
    return (
      <div
        onClick={handleClick}
        className="group relative w-[300px] h-[250px] bg-neutral-900 border border-neutral-700/90 rounded-xl overflow-hidden shadow-xl hover:border-indigo-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
      >
        {/* Top Image + Badges */}
        <div className="relative h-[132px] w-full bg-neutral-950 overflow-hidden shrink-0">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              onError={onImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-tr from-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-3 text-center">
              <span className="text-neutral-500 font-mono text-xs">No Asset Preview</span>
            </div>
          )}

          {/* Ad Label & Category */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-neutral-300 border border-white/10">
              Sponsored
            </span>
            {category && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-neutral-400">
                {category}
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountBadge && (
            <div className="absolute top-2 right-2 z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-neutral-950 shadow-md">
                {discountBadge}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-80" />
        </div>

        {/* Content Body */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold text-white leading-tight line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {title}
            </h4>
          </div>

          {/* Price & Coupon Row */}
          <div className="flex items-center justify-between pt-1 border-t border-neutral-800/80">
            <div className="flex items-baseline gap-1.5">
              {salePrice ? (
                <>
                  <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                    {salePrice}
                  </span>
                  {regPrice && (
                    <span className="text-[11px] text-neutral-500 line-through font-mono tabular-nums">
                      {regPrice}
                    </span>
                  )}
                </>
              ) : regPrice ? (
                <span className="text-sm font-bold text-white font-mono tabular-nums">
                  {regPrice}
                </span>
              ) : (
                <span className="text-[11px] text-neutral-400">Featured Offer</span>
              )}
            </div>

            {/* Coupon Code Pill */}
            {couponCode ? (
              <button
                type="button"
                onClick={onCopyCoupon}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-700/60 bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 transition-colors flex items-center gap-1"
                title="Click to copy promo code"
              >
                {copiedCoupon ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{couponCode}</span>
              </button>
            ) : (
              <span className="text-[10px] text-neutral-400 group-hover:text-white flex items-center gap-0.5 font-medium transition-colors">
                Shop <ExternalLink className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. RECTANGLE FORMAT: Wide Horizontal Leaderboard Banner (~680x110)
  if (format === 'rectangle') {
    return (
      <div
        onClick={handleClick}
        className="group relative w-full max-w-[680px] bg-neutral-900 border border-neutral-700/90 rounded-xl overflow-hidden shadow-xl hover:border-indigo-500/80 transition-all duration-200 cursor-pointer flex items-center p-3 gap-4"
      >
        {/* Left Thumbnail */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-neutral-950 overflow-hidden shrink-0">
          {!imageError && imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              onError={onImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
              Asset
            </div>
          )}

          {discountBadge && (
            <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950">
              {discountBadge}
            </span>
          )}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/50 text-neutral-400 border border-neutral-700/50">
              Sponsored
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">·</span>
            <span className="text-[10px] text-neutral-400 font-mono">#{category}</span>
          </div>

          <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
            {title}
          </h4>

          {/* Pricing & Coupon */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-baseline gap-1.5">
              {salePrice ? (
                <>
                  <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{salePrice}</span>
                  {regPrice && <span className="text-xs text-neutral-500 line-through font-mono tabular-nums">{regPrice}</span>}
                </>
              ) : (
                <span className="text-sm font-bold text-white font-mono tabular-nums">{regPrice || 'Special Deal'}</span>
              )}
            </div>

            {couponCode && (
              <button
                type="button"
                onClick={onCopyCoupon}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-700/60 bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 transition-colors flex items-center gap-1"
              >
                {copiedCoupon ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                <span>Code: {couponCode}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right CTA Button */}
        <div className="shrink-0 pl-2">
          <div className="px-3.5 py-2 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm">
            <span>View Deal</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    );
  }

  // 3. STICKER FORMAT: Vertical Skyscraper / Sidebar Anchor (~220x380)
  return (
    <div
      onClick={handleClick}
      className="group relative w-[220px] bg-neutral-900 border border-neutral-700/90 rounded-xl overflow-hidden shadow-2xl hover:border-indigo-500/80 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Top Header Badge */}
      <div className="p-2.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">
          Sponsored Link
        </span>
        {discountBadge && (
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-neutral-950">
            {discountBadge}
          </span>
        )}
      </div>

      {/* Asset Photo */}
      <div className="relative h-36 w-full bg-neutral-950 overflow-hidden">
        {!imageError && imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            onError={onImageError}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-neutral-500 font-mono">
            No Photo
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] text-neutral-400 font-mono uppercase">#{category}</span>
          <h4 className="text-xs font-semibold text-white leading-snug line-clamp-3 mt-1 group-hover:text-indigo-300 transition-colors">
            {title}
          </h4>
        </div>

        <div className="space-y-2 pt-2 border-t border-neutral-800">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-neutral-400">Price</span>
            <div className="flex items-baseline gap-1">
              {salePrice ? (
                <>
                  <span className="text-sm font-bold text-emerald-400 font-mono tabular-nums">{salePrice}</span>
                  {regPrice && <span className="text-[11px] text-neutral-500 line-through font-mono tabular-nums">{regPrice}</span>}
                </>
              ) : (
                <span className="text-sm font-bold text-white font-mono tabular-nums">{regPrice || 'See Details'}</span>
              )}
            </div>
          </div>

          {couponCode && (
            <button
              type="button"
              onClick={onCopyCoupon}
              className="w-full py-1 text-[10px] font-mono rounded border border-indigo-700/60 bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900 transition-colors flex items-center justify-center gap-1"
            >
              {copiedCoupon ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Promo: {couponCode}</span>
            </button>
          )}

          <div className="w-full py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg text-center transition-colors flex items-center justify-center gap-1">
            <span>Shop Now</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};
