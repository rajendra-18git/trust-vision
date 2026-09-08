import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  BarChart3, 
  FileText,
  Lock,
  Cpu,
  FileCheck
} from 'lucide-react';
import { getHistory, getDashboardMetrics } from '../services/api';
import { formatDate, shortenHash } from '../utils/formatters';

export default function DashboardPage({ onNavigateAnalyze, onViewHistoryRecord }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [metrics, setMetrics] = useState({ totalAnalyses: 0, trustedCount: 0, suspiciousCount: 0, avgConfidence: 0 });

  useEffect(() => {
    const data = getHistory();
    setHistoryItems(data);
    setMetrics(getDashboardMetrics());
  }, []);

  const recentAnalyses = historyItems.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight font-sans">
            Media Integrity Overview
          </h1>
          <p className="text-sm text-[#64748B] font-normal mt-0.5">
            Review recent integrity analyses and detected anomalies across media assets.
          </p>
        </div>

        <button
          onClick={onNavigateAnalyze}
          className="px-4 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all self-start sm:self-auto"
        >
          <FileSearch className="w-4 h-4" />
          <span>Start New Analysis</span>
        </button>
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="trust-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
            <span>Analyses Performed</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#111827] font-mono">
            {metrics.totalAnalyses}
          </div>
          <p className="text-[11px] text-[#94A3B8]">Total forensic runs</p>
        </div>

        <div className="trust-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
            <span>Trusted Files</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {metrics.trustedCount}
          </div>
          <p className="text-[11px] text-[#94A3B8]">Authenticity signals verified</p>
        </div>

        <div className="trust-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
            <span>Suspicious Files</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono">
            {metrics.suspiciousCount}
          </div>
          <p className="text-[11px] text-[#94A3B8]">Potential manipulation detected</p>
        </div>

        <div className="trust-card p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#64748B] font-medium">
            <span>Average Confidence</span>
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#111827] font-mono">
            {metrics.avgConfidence > 0 ? `${metrics.avgConfidence}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-[#94A3B8]">Mean model assessment</p>
        </div>

      </div>

      {/* Recent Analyses Data Table */}
      <div className="trust-card space-y-0 overflow-hidden">
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">
              Recent Analyses
            </h2>
            <p className="text-xs text-[#64748B]">
              Audit log of recently verified files and media outputs.
            </p>
          </div>

          {recentAnalyses.length > 0 && (
            <button
              onClick={() => onNavigateAnalyze('history')}
              className="text-xs text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-[#94A3B8] mx-auto" />
            <div className="text-sm font-medium text-[#111827]">No analyses yet</div>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              Upload your first image, video, or document to begin a media integrity analysis.
            </p>
            <button
              onClick={onNavigateAnalyze}
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-xs font-medium"
            >
              Analyze Media
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-medium text-xs uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3">Analysis ID</th>
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Media Type</th>
                  <th className="px-5 py-3">Analyzed</th>
                  <th className="px-5 py-3">Result</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] text-xs">
                {recentAnalyses.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onViewHistoryRecord(item)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors bg-white"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {item.id}
                    </td>

                    <td className="px-5 py-3.5 font-medium text-[#111827] truncate max-w-[200px]" title={item.filename}>
                      {item.filename}
                    </td>

                    <td className="px-5 py-3.5 text-[#64748B]">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                        {item.fileType}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-[#64748B]">
                      {formatDate(item.timestamp)}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] uppercase font-semibold ${
                        item.status === 'TRUSTED'
                          ? 'badge-trusted'
                          : item.status === 'INCONCLUSIVE'
                            ? 'badge-inconclusive'
                            : 'badge-suspicious'
                      }`}>
                        {item.status === 'TRUSTED' ? 'Trusted' : item.status === 'INCONCLUSIVE' ? 'Inconclusive' : 'Suspicious'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-[#111827] font-mono">
                      {item.overallConfidence}%
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewHistoryRecord(item);
                        }}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
