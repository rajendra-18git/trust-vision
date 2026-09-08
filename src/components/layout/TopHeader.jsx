import React from 'react';
import { Menu, RefreshCw } from 'lucide-react';

export default function TopHeader({ activeTab, backendStatus, onRefreshHealth, onToggleMobile }) {
  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'analyze':
        return 'Analyze Media';
      case 'history':
        return 'Analysis History';
      case 'settings':
        return 'Settings';
      case 'dashboard':
      default:
        return 'Media Integrity Overview';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] h-16 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="hidden sm:inline">TrustVision</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-slate-900 font-semibold text-sm">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: System Health */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefreshHealth}
          title="Click to verify FastAPI backend connection"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] border font-medium transition-all ${
            backendStatus?.online
              ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
              : 'bg-amber-50/80 text-amber-700 border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${backendStatus?.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span>{backendStatus?.online ? 'Backend Connected' : 'Standalone Mode'}</span>
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-600 ml-0.5" />
        </button>
      </div>

    </header>
  );
}
