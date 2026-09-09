import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings, 
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, currentUser, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze', icon: FileSearch },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Helper to extract initials
  const getInitials = () => {
    if (!currentUser) return 'TV';
    if (currentUser.name) {
      const cleanName = currentUser.name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      const parts = cleanName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    }
    if (currentUser.email) return currentUser.email.substring(0, 2).toUpperCase();
    if (currentUser.phone) return 'PH';
    return 'TV';
  };

  const displayName = currentUser?.name || currentUser?.email || currentUser?.phone || 'Security Analyst';
  const displaySubtext = currentUser?.email || currentUser?.phone || currentUser?.role || 'Verified Workspace';

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-[#E5E7EB] z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        
        {/* Top Section: Logo & Nav */}
        <div className="p-5 space-y-6">
          
          {/* Logo */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => {
                setActiveTab('dashboard');
                if (setMobileOpen) setMobileOpen(false);
              }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex items-baseline font-sans text-xl font-bold tracking-tight">
                <span className="text-[#111827]">Trust</span>
                <span className="text-[#2563EB]">Vision</span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (setMobileOpen) setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Authenticated User */}
        <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 border border-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {getInitials()}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {displaySubtext}
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

