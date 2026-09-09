import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCheck, ShieldCheck, Database, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function AuditTrail({ auditTrail, rawText, title = "Verification Audit Trail" }) {
  const [copied, setCopied] = useState(false);

  if (!auditTrail || !Array.isArray(auditTrail) || auditTrail.length === 0) {
    return null;
  }

  // Generate default raw text if not provided
  const formattedRawText = rawText || (() => {
    let text = "AUDIT TRAIL\n\n";
    auditTrail.forEach(step => {
      text += `● ${step.time}   ${step.event}\n`;
      if (step.details) {
        step.details.forEach(d => {
          text += `  ${d.label}: ${d.value}\n`;
        });
      }
      text += "\n";
    });
    return text.trim();
  })();

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedRawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEventBadgeColor = (event) => {
    if (event.includes('UPLOAD') || event.includes('RECEIVED')) return 'text-[#3B82F6] bg-blue-50 border-blue-200';
    if (event.includes('VERIFIED') || event.includes('VALID')) return 'text-[#10B981] bg-emerald-50 border-emerald-200';
    if (event.includes('COMPLETED') || event.includes('RECORDED')) return 'text-[#8B5CF6] bg-purple-50 border-purple-200';
    if (event.includes('REJECT') || event.includes('TAMPER')) return 'text-[#EF4444] bg-rose-50 border-rose-200';
    return 'text-slate-600 bg-slate-100 border-slate-200';
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 text-white shadow-xs">
            <Terminal className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#111827]">
              {title}
            </h3>
            <p className="text-xs text-[#64748B]">
              Immutable event log and chain-of-custody verification steps.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-[#CBD5E1] text-xs font-medium text-[#111827] flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Copy raw audit trail text format"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-600 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Copy Raw Trail</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Timeline View */}
      <div className="space-y-4 pt-1">
        {auditTrail.map((step, idx) => (
          <div key={idx} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-l-0 last:pb-0">
            {/* Timeline bullet */}
            <span className="absolute -left-[7px] top-0.5 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </span>

            {/* Step header */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-slate-500">
                {step.time}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border uppercase tracking-wider ${getEventBadgeColor(step.event)}`}>
                {step.event}
              </span>
            </div>

            {/* Step details list */}
            {step.details && step.details.length > 0 && (
              <div className="mt-2 ml-1 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 font-mono text-xs">
                {step.details.map((d, dIdx) => {
                  const isDecision = d.label === 'Decision';
                  const isVerified = d.value === 'VERIFIED' || d.value === 'VALID' || d.value === 'SAVED';
                  const isReject = d.value === 'REJECT';

                  return (
                    <div key={dIdx} className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">{d.label}:</span>
                      <span className={`font-semibold ${
                        isDecision 
                          ? (isReject ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold') 
                          : isVerified 
                            ? 'text-emerald-700' 
                            : 'text-slate-900'
                      }`}>
                        {d.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Raw Code Box Preview */}
      <div className="pt-2">
        <details className="group">
          <summary className="text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1 select-none">
            <span>Show Raw Terminal Audit Format</span>
          </summary>
          <div className="mt-2 p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-inner">
            <pre className="whitespace-pre">{formattedRawText}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}
