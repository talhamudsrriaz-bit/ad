import React from 'react';
import { Sparkles, Database, Layers, Radio, RotateCcw } from 'lucide-react';
import { AD_PRESETS } from '../data/presets';
import { ProductAdFormData } from '../types/ad';

interface HeaderProps {
  activeTab: 'studio' | 'submissions' | 'schema' | 'config';
  setActiveTab: (tab: 'studio' | 'submissions' | 'schema' | 'config') => void;
  onApplyPreset: (preset: ProductAdFormData) => void;
  onResetForm: () => void;
  submissionCount: number;
  isMockMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onApplyPreset,
  onResetForm,
  submissionCount,
  isMockMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('studio');
            }}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-neutral-200 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-mono font-bold shadow-sm">
              SG
            </span>
            <span>SponsorGrid</span>
          </a>
          <span className="hidden sm:inline-block text-xs font-mono px-2 py-0.5 rounded text-neutral-400 bg-neutral-800/80 border border-neutral-700/50">
            Ad Studio v1.2
          </span>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Ad Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'submissions'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Submissions</span>
            {submissionCount > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-700 text-neutral-200">
                {submissionCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`hidden md:flex px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap items-center gap-1.5 ${
              activeTab === 'schema'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <span className="text-amber-400 font-mono text-xs">&lt;/&gt;</span>
            <span>Schema &amp; SDK</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'bg-neutral-800 text-white shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Radio className={`w-4 h-4 ${isMockMode ? 'text-cyan-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Network Config</span>
            <span className="sm:hidden">Config</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Presets dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700/80 transition-colors flex items-center gap-1.5"
              title="Load quick product sample"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Quick Presets</span>
              <span className="lg:hidden">Presets</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 p-1 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-neutral-400 border-b border-neutral-700/60">
                Load Sample Templates
              </div>
              {AD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset.data)}
                  className="w-full text-left px-2.5 py-2 text-xs text-neutral-200 hover:bg-neutral-700/70 rounded-md transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-semibold text-white">{preset.name}</span>
                  <span className="text-[11px] text-neutral-400">{preset.description}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onResetForm}
            className="p-1.5 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
            title="Reset form to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
