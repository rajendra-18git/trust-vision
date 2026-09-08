import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function DetectedIssuesList({ issues = [] }) {
  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          label: 'CRITICAL'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          label: 'WARNING'
        };
      case 'INFO':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          label: 'INFO'
        };
    }
  };

  return (
    <div className="trust-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Detected Issues & Diagnostic Audit</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {issues.length} Check Points Evaluated
        </span>
      </div>

      <div className="space-y-2.5 font-sans">
        {issues.map((issue) => {
          const badge = getSeverityBadge(issue.severity);
          const IconComponent = badge.icon;

          return (
            <div
              key={issue.id || issue.message}
              className="flex items-center justify-between gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4 h-4 shrink-0 ${
                  issue.severity === 'CRITICAL' ? 'text-rose-600' : issue.severity === 'WARNING' ? 'text-amber-600' : 'text-emerald-600'
                }`} />
                <span className="text-xs font-medium text-slate-800">
                  {issue.message}
                </span>
              </div>

              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border shrink-0 ${badge.bg}`}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
