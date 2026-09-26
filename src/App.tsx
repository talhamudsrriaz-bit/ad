/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AdCreationForm } from './components/AdCreationForm';
import { LiveAdPreview } from './components/LiveAdPreview';
import { PayloadInspector } from './components/PayloadInspector';
import { SubmissionsTable } from './components/SubmissionsTable';
import { NetworkConfigView } from './components/NetworkConfigView';
import { SchemaAndEmbedView } from './components/SchemaAndEmbedView';
import {
  AdFormat,
  NetworkConfig,
  NetworkSubmissionLog,
  ProductAdFormData,
  SponsoredProductRecord,
} from './types/ad';
import {
  DEFAULT_INITIAL_FORM,
  AD_PRESETS,
} from './data/presets';
import {
  getStoredNetworkConfig,
  getStoredProducts,
  getSubmissionLogs,
  saveStoredProduct,
  deleteStoredProduct,
  executeAdCreationPipeline,
  triggerCompilerWebhook,
} from './services/adService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'submissions' | 'schema' | 'config'>('studio');
  const [formData, setFormData] = useState<ProductAdFormData>(DEFAULT_INITIAL_FORM);
  const [selectedFormat, setSelectedFormat] = useState<AdFormat>(DEFAULT_INITIAL_FORM.format);
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>(getStoredNetworkConfig);
  const [products, setProducts] = useState<SponsoredProductRecord[]>(getStoredProducts);
  const [logs, setLogs] = useState<NetworkSubmissionLog[]>(getSubmissionLogs);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clickCount, setClickCount] = useState(0);

  // Sync format changes from form into preview
  const handleFieldChange = (field: keyof ProductAdFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (field === 'format') {
      setSelectedFormat(value as AdFormat);
    }
  };

  // Preset loader
  const handleApplyPreset = (presetData: ProductAdFormData) => {
    setFormData(presetData);
    setSelectedFormat(presetData.format);
    setStatusMessage({
      type: 'success',
      text: `Loaded preset: "${presetData.title.slice(0, 35)}..."`,
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Form Reset
  const handleResetForm = () => {
    setFormData({
      title: '',
      target_url: '',
      image_url: '',
      format: 'square',
      category: 'global',
      reg_price: '',
      sale_price: '',
      discount_badge: '',
      coupon_code: '',
      status: 'active',
    });
    setSelectedFormat('square');
    setStatusMessage(null);
  };

  // Form Submission Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await executeAdCreationPipeline(formData, networkConfig);

      // Refresh stored products and submission logs
      setProducts(getStoredProducts());
      setLogs(getSubmissionLogs());

      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: `Success! Product ad "${formData.title}" committed to Supabase sponsored_products (ID: ${result.productRecord.id}). Manifest compiler webhook trigger dispatched: ${result.submissionLog.webhookStatus.toUpperCase()}.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: `Submission pipeline halted: ${result.error || 'Unknown error occurred'}`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Pipeline error: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product record
  const handleDeleteProduct = (id: string) => {
    deleteStoredProduct(id);
    setProducts(getStoredProducts());
  };

  // Re-trigger webhook for existing item
  const handleReplayWebhook = async (log: NetworkSubmissionLog) => {
    try {
      const res = await triggerCompilerWebhook(
        networkConfig.compilerWebhookUrl,
        log.payload as any,
        log.id,
        networkConfig.isMockMode
      );
      setLogs(getSubmissionLogs());
      alert(`Webhook re-triggered: HTTP ${res.statusCode} - ${res.responseText}`);
    } catch (err: any) {
      alert(`Webhook failed: ${err.message}`);
    }
  };

  // Load record back into studio for editing
  const handleSelectForEdit = (record: SponsoredProductRecord) => {
    setFormData({
      title: record.title,
      target_url: record.target_url,
      image_url: record.image_url,
      format: record.format,
      category: record.category || 'global',
      reg_price: record.reg_price || '',
      sale_price: record.sale_price || '',
      discount_badge: record.discount_badge || '',
      coupon_code: record.coupon_code || '',
      status: 'active',
    });
    setSelectedFormat(record.format);
    setActiveTab('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col">
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onApplyPreset={handleApplyPreset}
        onResetForm={handleResetForm}
        submissionCount={products.length}
        isMockMode={networkConfig.isMockMode}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: Ad Studio (Form + Live Preview + Payload Inspector) */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Split Screen Studio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Multi-column Form Card */}
              <div className="lg:col-span-6 xl:col-span-7">
                <AdCreationForm
                  formData={formData}
                  onChange={handleFieldChange}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                  statusMessage={statusMessage}
                />
              </div>

              {/* Right Column: Live Ad Preview */}
              <div className="lg:col-span-6 xl:col-span-5 sticky top-20">
                <LiveAdPreview
                  formData={formData}
                  selectedFormat={selectedFormat}
                  onFormatChange={(fmt) => {
                    setSelectedFormat(fmt);
                    handleFieldChange('format', fmt);
                  }}
                  clickCount={clickCount}
                  onSimulateClick={() => setClickCount((c) => c + 1)}
                />
              </div>
            </div>

            {/* Bottom Section: Live Payload & Pipeline Inspector */}
            <PayloadInspector
              formData={formData}
              compilerWebhookUrl={networkConfig.compilerWebhookUrl}
            />
          </div>
        )}

        {/* TAB 2: Submissions Table & Network Audit Log */}
        {activeTab === 'submissions' && (
          <SubmissionsTable
            products={products}
            logs={logs}
            onDeleteProduct={handleDeleteProduct}
            onReplayWebhook={handleReplayWebhook}
            onSelectForEdit={handleSelectForEdit}
          />
        )}

        {/* TAB 3: Schema & Client Embed View */}
        {activeTab === 'schema' && (
          <SchemaAndEmbedView tableName={networkConfig.tableName} />
        )}

        {/* TAB 4: Network & Supabase Config View */}
        {activeTab === 'config' && (
          <NetworkConfigView
            config={networkConfig}
            onUpdateConfig={setNetworkConfig}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/60 py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>SponsorGrid Ad Studio</span>
            <span>·</span>
            <span>Serverless Ad Network Engine</span>
            <span>·</span>
            <span className="font-mono text-neutral-400">Target: Supabase sponsored_products</span>
          </div>
          <div>
            <span>Static distribution manifests compiled via asynchronous edge webhook</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
