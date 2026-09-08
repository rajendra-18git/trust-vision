import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Filter } from 'lucide-react';
import { getHistory, clearHistory } from '../services/api';
import { formatDate, shortenHash } from '../utils/formatters';

export default function HistoryPage({ onViewRecord, onNavigateAnalyze }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterResult, setFilterResult] = useState('ALL');

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear analysis history logs?')) {
      clearHistory();
      setHistoryItems([]);
    }
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = (item.filename || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.sha256 || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || item.fileType === filterType;
    const matchesResult = filterResult === 'ALL' || item.status === filterResult;

    return matchesSearch && matchesType && matchesResult;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
            Analysis History
          </h1>
          <p className="text-sm text-[#64748B]">
            Review past media integrity verification reports and cryptographic audit records.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-300 text-[#64748B] font-medium text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="trust-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, filename, or SHA-256..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <span className="text-[#64748B] font-medium hidden sm:inline">Type:</span>
          {['ALL', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                filterType === type
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-white text-[#64748B] border-slate-300 hover:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-[#64748B] font-medium hidden sm:inline">Result:</span>
          {['ALL', 'TRUSTED', 'SUSPICIOUS', 'INCONCLUSIVE'].map(res => (
            <button
              key={res}
              onClick={() => setFilterResult(res)}
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] transition-colors ${
                filterResult === res
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                  : 'bg-white text-[#64748B] border-slate-300 hover:bg-slate-50'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* History Log Data Table */}
      {filteredItems.length === 0 ? (
        <div className="trust-card p-12 text-center space-y-3">
          <History className="w-8 h-8 text-[#94A3B8] mx-auto" />
          <div className="text-base font-semibold text-[#111827]">
            {historyItems.length === 0 ? 'No analyses yet' : 'No matching records found'}
          </div>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            {historyItems.length === 0
              ? 'Upload your first file to begin an integrity analysis.'
              : 'Try adjusting your search query or clear existing search filters.'}
          </p>
          {historyItems.length === 0 && onNavigateAnalyze && (
            <button
              onClick={() => onNavigateAnalyze('analyze')}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-medium"
            >
              Analyze Media
            </button>
          )}
        </div>
      ) : (
        <div className="trust-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-[#F8FAFC] text-[#64748B] font-semibold uppercase tracking-wider border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-5 py-3">Analysis ID</th>
                  <th className="px-5 py-3">Filename</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Date / Time</th>
                  <th className="px-5 py-3">Result</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">SHA-256 (Short)</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] bg-white">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id}
                    onClick={() => onViewRecord(item)}
                    className="hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-semibold text-blue-600">
                      {item.id}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-[#111827] truncate max-w-[180px]" title={item.filename}>
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
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                        item.status === 'TRUSTED'
                          ? 'badge-trusted'
                          : item.status === 'INCONCLUSIVE'
                            ? 'badge-inconclusive'
                            : 'badge-suspicious'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-[#111827] font-mono">
                      {item.overallConfidence}%
                    </td>

                    <td className="px-5 py-3.5 text-[#64748B] font-mono text-[11px]" title={item.sha256}>
                      {shortenHash(item.sha256, 6, 6)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewRecord(item);
                        }}
                        className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium text-[11px] transition-colors"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
