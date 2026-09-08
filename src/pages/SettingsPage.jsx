import React from 'react';
import { Server, Shield } from 'lucide-react';

export default function SettingsPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          View system environment configurations, backend API services, and model thresholds.
        </p>
      </div>

      {/* API Configuration Card */}
      <div className="trust-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-[#111827]">Backend API Configuration</h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Read-only
          </span>
        </div>

        <div className="space-y-3 font-sans text-xs">
          <div>
            <label className="text-slate-500 font-medium block mb-1">FastAPI Service Endpoint (VITE_API_URL):</label>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-slate-800 font-semibold select-all">
              {apiUrl}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              To update this endpoint, edit the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> file in your frontend root directory.
            </p>
          </div>
        </div>
      </div>

      {/* Model Thresholds Card */}
      <div className="trust-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-semibold text-[#111827]">Vision Transformer Model Thresholds</h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Read-only
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">Trusted Authenticity Score:</div>
            <div className="text-base font-bold text-emerald-700 font-mono">≥ 85%</div>
            <p className="text-[11px] text-slate-400">Strict baseline for positive evidence tag</p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-slate-500 font-medium">Suspicious Anomaly Score:</div>
            <div className="text-base font-bold text-rose-700 font-mono">≥ 40%</div>
            <p className="text-[11px] text-slate-400">Threshold triggering critical evidence alert</p>
          </div>
        </div>
      </div>

    </div>
  );
}
