import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export default function StageProgress({ currentStage, progressPercent, fileName }) {
  const STAGES = [
    { key: 'RECEIVING_FILE', label: 'File received' },
    { key: 'CALCULATING_HASH', label: 'SHA-256 calculated' },
    { key: 'VALIDATING_FILE', label: 'File validated' },
    { key: 'RUNNING_AI', label: 'Metadata analysis' },
    { key: 'CHECKING_INDICATORS', label: 'Visual forensic analysis' },
    { key: 'GENERATING_REPORT', label: 'Evidence aggregation' }
  ];

  const currentIdx = STAGES.findIndex(s => s.key === currentStage);
  const activeIdx = currentIdx >= 0 ? currentIdx : 3;

  return (
    <div className="max-w-2xl mx-auto bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6 my-8 shadow-sm">
      
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#111827] tracking-tight">
            Analysis in progress
          </h2>
          <p className="text-xs text-[#64748B] font-mono mt-0.5">
            File: <span className="font-semibold text-[#111827]">{fileName}</span>
          </p>
        </div>

        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>

      {/* Thin Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-[#64748B]">
          <span>Processing pipeline</span>
          <span className="font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stepper Pipeline Ticks */}
      <div className="bg-[#F8FAFC] rounded-lg p-4 border border-[#E2E8F0] space-y-3 text-xs font-sans">
        {STAGES.map((stage, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={stage.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`font-medium ${
                  isDone 
                    ? 'text-[#111827]' 
                    : isCurrent 
                      ? 'text-blue-700 font-semibold' 
                      : 'text-[#94A3B8]'
                }`}>
                  {stage.label}
                </span>
              </div>

              <div>
                {isDone && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                {isCurrent && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                )}
                {idx > activeIdx && (
                  <div className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
