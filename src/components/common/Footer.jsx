import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white h-14 flex items-center px-4 sm:px-6 lg:px-8 text-xs text-slate-500 font-sans mt-auto">
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="font-semibold text-slate-900">TrustVision</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">AI-powered media integrity & tampering detection</span>
        </div>

        <div className="text-slate-400 text-xs">
          &copy; {new Date().getFullYear()} TrustVision
        </div>

      </div>
    </footer>
  );
}
