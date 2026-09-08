import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileSearch, 
  History, 
  Settings, 
  FolderCheck,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze', icon: FileSearch },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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

        {/* Bottom Section: Workspace Info */}
        <div className="p-4 border-t border-[#E5E7EB] bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-semibold text-xs font-mono">
              LW
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-slate-800 truncate">
                Local Workspace
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <FolderCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Media Integrity Environment</span>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
