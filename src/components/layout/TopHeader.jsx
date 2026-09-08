import React from 'react';
import { Menu, RefreshCw, LogOut, Sparkles } from 'lucide-react';

export default function TopHeader({ activeTab, backendStatus, onRefreshHealth, onToggleMobile, currentUser, onLogout, onOpenAssistant }) {
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

  const getInitials = () => {
    if (!currentUser) return 'TV';
    if (currentUser.name) {
      const parts = currentUser.name.trim().split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return currentUser.name.substring(0, 2).toUpperCase();
    }
    if (currentUser.email) return currentUser.email.substring(0, 2).toUpperCase();
    return 'TV';
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
          <span className="hidden sm:inline text-slate-400 font-semibold">TrustVision</span>
          <span className="hidden sm:inline text-slate-300">/</span>
          <span className="text-[#111827] font-semibold text-sm">
            {getBreadcrumb()}
          </span>
        </div>
      </div>

      {/* Right: AI Investigator, System Health & User Info */}
      <div className="flex items-center gap-2.5">
        
        {/* ✨ AI Investigator Drawer Trigger Button */}
        {onOpenAssistant && (
          <button
            onClick={onOpenAssistant}
            title="Open Trust Vision AI Investigator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">AI Investigator</span>
          </button>
        )}

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
          <span className="hidden md:inline">{backendStatus?.online ? 'Backend Connected' : 'Standalone Mode'}</span>
          <RefreshCw className="w-3 h-3 text-slate-400 hover:text-slate-600 ml-0.5" />
        </button>

        {currentUser && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E7EB]">
            <div 
              title={currentUser.email || currentUser.name}
              className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs"
            >
              {getInitials()}
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out of TrustVision"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

    </header>
  );

}


