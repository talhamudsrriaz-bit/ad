import React, { useState } from 'react';
import {
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  FileCode,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { NetworkSubmissionLog, SponsoredProductRecord } from '../types/ad';

interface SubmissionsTableProps {
  products: SponsoredProductRecord[];
  logs: NetworkSubmissionLog[];
  onDeleteProduct: (id: string) => void;
  onReplayWebhook: (log: NetworkSubmissionLog) => void;
  onSelectForEdit: (product: SponsoredProductRecord) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  products,
  logs,
  onDeleteProduct,
  onReplayWebhook,
  onSelectForEdit,
}) => {
  const [selectedLog, setSelectedLog] = useState<NetworkSubmissionLog | null>(null);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Active Sponsored Ads</span>
            <div className="text-2xl font-bold text-white font-mono mt-1 tabular-nums">
              {products.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-700/50 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Total Pipeline Executions</span>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1 tabular-nums">
              {logs.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-medium">Compiler Webhook Success Rate</span>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-1 tabular-nums">
              {logs.length > 0
                ? `${Math.round(
                    (logs.filter((l) => l.webhookStatus === 'success').length / logs.length) * 100
                  )}%`
                : '100%'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-700/80 bg-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Database Records: sponsored_products</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Items committed to Supabase and broadcasted to the static CDN manifest builder
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-white">No Sponsored Ads Created Yet</h4>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              Use the Ad Studio form to create and submit your first product ad payload to Supabase.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/90 text-neutral-400 font-mono border-b border-neutral-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Title &amp; Category</th>
                  <th className="px-4 py-3">Format</th>
                  <th className="px-4 py-3">Pricing &amp; Promo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/60 text-neutral-300">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-neutral-750/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-950">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-500 font-mono">
                            N/A
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-white truncate" title={prod.title}>
                        {prod.title}
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-neutral-500">#{prod.category}</span>
                        {prod.target_url && (
                          <a
                            href={prod.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
                          >
                            <span>Link</span>
                            <ArrowUpRight className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-neutral-300 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-[11px]">
                        {prod.format}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        {prod.sale_price ? (
                          <>
                            <span className="font-bold text-emerald-400 tabular-nums">{prod.sale_price}</span>
                            {prod.reg_price && (
                              <span className="text-neutral-500 line-through text-[11px] tabular-nums">
                                {prod.reg_price}
                              </span>
                            )}
                          </>
                        ) : prod.reg_price ? (
                          <span className="text-white tabular-nums">{prod.reg_price}</span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </div>
                      {prod.coupon_code && (
                        <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          {prod.coupon_code}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {prod.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-neutral-400">
                      {new Date(prod.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => onSelectForEdit(prod)}
                        className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-700/60 hover:bg-neutral-700 rounded transition-colors"
                      >
                        Load in Studio
                      </button>
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                        title="Delete product record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Network Submission Logs */}
      <div className="bg-neutral-800/80 border border-neutral-700/80 rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-700/80 bg-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Pipeline Execution &amp; Webhook Audit Log</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Tracks the dual action: Supabase Database INSERT + Manifest Compiler Webhook trigger
            </p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            No pipeline calls logged yet. Submit a form to trigger the complete workflow.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-900/90 text-neutral-400 font-mono border-b border-neutral-700 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Supabase Step</th>
                  <th className="px-4 py-3">Compiler Webhook Step</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700/60 text-neutral-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-750/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white truncate max-w-[200px]">
                      {log.productTitle}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          log.supabaseStatus === 'success'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950/70 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {log.supabaseStatus === 'success' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-rose-400" />
                        )}
                        <span>{log.supabaseStatusCode} {log.supabaseStatus}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                          log.webhookStatus === 'success'
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800'
                            : log.webhookStatus === 'skipped'
                            ? 'bg-neutral-900 text-neutral-400 border border-neutral-700'
                            : 'bg-rose-950/70 text-rose-300 border border-rose-800'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>{log.webhookStatusCode || 0} {log.webhookStatus}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-neutral-400 tabular-nums whitespace-nowrap">
                      {log.durationMs}ms
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                        className="px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 bg-neutral-900 rounded border border-neutral-700"
                      >
                        {selectedLog?.id === log.id ? 'Close' : 'View Payload'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Expanded Log Inspector */}
        {selectedLog && (
          <div className="p-4 bg-neutral-950 border-t border-neutral-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-semibold text-white">Execution Log Detail: {selectedLog.id}</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-500 hover:text-neutral-200"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
                <span className="text-neutral-400 block mb-1">Supabase Response:</span>
                <p className="text-emerald-400">{selectedLog.supabaseResponseText}</p>
              </div>
              <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
                <span className="text-neutral-400 block mb-1">Compiler Webhook Response:</span>
                <p className="text-cyan-400 break-words">{selectedLog.webhookResponseText}</p>
              </div>
            </div>
            <div className="bg-neutral-900 p-3 rounded border border-neutral-800">
              <span className="text-neutral-400 block mb-1 text-xs font-mono">Dispatched Payload:</span>
              <pre className="text-neutral-300 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
