import React, { useState } from 'react';
import { Database, Radio, CheckCircle2, AlertCircle, Save, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { NetworkConfig } from '../types/ad';
import { DEFAULT_NETWORK_CONFIG, saveStoredNetworkConfig } from '../services/adService';

interface NetworkConfigViewProps {
  config: NetworkConfig;
  onUpdateConfig: (config: NetworkConfig) => void;
}

export const NetworkConfigView: React.FC<NetworkConfigViewProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [formData, setFormData] = useState<NetworkConfig>(config);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(formData);
    saveStoredNetworkConfig(formData);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Testing endpoint connectivity...' });

    if (formData.isMockMode) {
      await new Promise((r) => setTimeout(r, 400));
      setTestResult({
        status: 'success',
        message: 'Mock Mode Active: Local storage engine & serverless simulator are ready.',
      });
      return;
    }

    if (!formData.supabaseUrl || !formData.supabaseAnonKey) {
      setTestResult({
        status: 'error',
        message: 'Please provide both Supabase Project URL and Anon Public Key.',
      });
      return;
    }

    try {
      const endpoint = `${formData.supabaseUrl.replace(/\/$/, '')}/rest/v1/${formData.tableName || 'sponsored_products'}?limit=1`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: formData.supabaseAnonKey,
          Authorization: `Bearer ${formData.supabaseAnonKey}`,
        },
      });

      if (res.ok) {
        setTestResult({
          status: 'success',
          message: `Connected successfully! Supabase table "${formData.tableName}" responded with HTTP 200 OK.`,
        });
      } else {
        const text = await res.text();
        setTestResult({
          status: 'error',
          message: `Supabase returned HTTP ${res.status}: ${text || res.statusText}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${err.message}. If testing from browser, check Supabase CORS settings.`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-700/80 bg-neutral-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Network &amp; Backend Infrastructure Target</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure Supabase REST credentials and manifest compiler webhook endpoint
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                formData.isMockMode
                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800'
                  : 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${formData.isMockMode ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              {formData.isMockMode ? 'Mock Simulation Mode' : 'Live Supabase Target'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Mode Switcher */}
          <div className="p-4 bg-neutral-900 border border-neutral-700/80 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Execution Engine Mode
              </span>
              <p className="text-xs text-neutral-400 mt-1">
                Toggle between zero-setup browser sandbox (saves to local database and simulates webhooks) or live Supabase REST production.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isMockMode: true })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  formData.isMockMode
                    ? 'bg-neutral-800 border-indigo-500 text-white shadow-xs'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                Mock Simulator
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isMockMode: false })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  !formData.isMockMode
                    ? 'bg-neutral-800 border-indigo-500 text-white shadow-xs'
                    : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
                }`}
              >
                Live Supabase Target
              </button>
            </div>
          </div>

          {/* Supabase Parameters */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              1. Supabase Target Database
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-200 mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={formData.supabaseUrl}
                  onChange={(e) => setFormData({ ...formData, supabaseUrl: e.target.value })}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-200 mb-1.5">
                  Target Table Name
                </label>
                <input
                  type="text"
                  value={formData.tableName}
                  onChange={(e) => setFormData({ ...formData, tableName: e.target.value })}
                  placeholder="sponsored_products"
                  className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-200 mb-1.5">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                value={formData.supabaseAnonKey}
                onChange={(e) => setFormData({ ...formData, supabaseAnonKey: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                Found in your Supabase project under Settings &gt; API &gt; Project API keys (anon public).
              </p>
            </div>
          </div>

          {/* Compiler Webhook Parameter */}
          <div className="space-y-4 pt-4 border-t border-neutral-700/60">
            <h3 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              2. Distribution Manifest Compiler Webhook
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-200 mb-1.5">
                COMPILER_WEBHOOK Endpoint URL
              </label>
              <input
                type="url"
                value={formData.compilerWebhookUrl}
                onChange={(e) => setFormData({ ...formData, compilerWebhookUrl: e.target.value })}
                placeholder="https://api.sponsorgrid.net/v1/compiler/manifest-rebuild"
                className="w-full px-3.5 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <p className="mt-1 text-[11px] text-neutral-500">
                Triggered asynchronously upon successful ad creation to prompt edge manifest generation (e.g. Lambda, Cloudflare Worker, or Cloud Run).
              </p>
            </div>
          </div>

          {/* Test Status Banner */}
          {testResult.status !== 'idle' && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.status === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                  : testResult.status === 'error'
                  ? 'bg-rose-950/70 border border-rose-800 text-rose-200'
                  : 'bg-neutral-900 text-neutral-300 border border-neutral-700'
              }`}
            >
              {testResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : testResult.status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {savedBanner && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Configuration successfully saved to local environment!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-700/60">
            <button
              type="button"
              onClick={handleTestConnection}
              className="px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Test Connectivity</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFormData(DEFAULT_NETWORK_CONFIG)}
                className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Configuration</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
