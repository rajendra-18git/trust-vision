import React from 'react';
import { Lock, Cpu, CheckCircle2, ShieldAlert, FileCode2 } from 'lucide-react';

export default function CryptographicVsAiCard({ hashVerified, sha256, authenticProb }) {
  return (
    <div className="trust-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          <span>Pipeline Trust Architecture Separation</span>
        </h3>
        <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
          Dual Validation
        </span>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed font-sans">
        This platform explicitly decouples <strong className="text-slate-900 font-semibold">Cryptographic Data Integrity</strong> (unaltered bits via immutable hash verification) from <strong className="text-slate-900 font-semibold">AI-Based Visual Forensics</strong> (deepfake / editing / synthetic generation probability).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
        
        {/* Cryptographic Layer */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>1. Cryptographic Hash Layer</span>
          </div>
          <p className="text-xs text-slate-500">
            Verifies bitwise identity against pipeline ledger. Prevents unrecorded file swapping in multi-contributor pipelines.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-sans">Status:</span>
            {hashVerified ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Immutable Bit Match
              </span>
            ) : (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Bitwise Discrepancy
              </span>
            )}
          </div>
        </div>

        {/* AI Model Layer */}
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold">
            <Cpu className="w-4 h-4" />
            <span>2. Vision Transformer AI Layer</span>
          </div>
          <p className="text-xs text-slate-500">
            Analyzes spatial boundaries, patch anomalies, and generative artifacts to estimate physical image authenticity.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500 font-sans">Inference Output:</span>
            <span className="text-purple-800 font-semibold">
              {authenticProb}% Authentic ViT Score
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
