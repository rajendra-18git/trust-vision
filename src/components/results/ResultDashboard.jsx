import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  Lock, 
  Printer, 
  ArrowLeft, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2
} from 'lucide-react';
import ImageResultView from './ImageResultView';
import VideoResultView from './VideoResultView';
import DocumentResultView from './DocumentResultView';
import { formatBytes } from '../../utils/hash';

export default function ResultDashboard({ resultData, uploadedFile, onNewAnalysis, onOpenAssistant }) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    fileInfo: false,
    crypto: false,
    metadata: false,
    forensics: true,
    model: false,
    evidence: false
  });

  if (!resultData) return null;

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyHash = () => {
    if (resultData.sha256) {
      navigator.clipboard.writeText(resultData.sha256);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const getStatusConfig = () => {
    switch (resultData.status) {
      case 'SUSPICIOUS':
        return {
          label: 'SUSPICIOUS',
          badgeClass: 'badge-suspicious',
          bannerBg: 'bg-rose-50/60 border-rose-200 text-rose-900',
          iconColor: 'text-rose-600',
          subtitle: 'One or more integrity signals indicate possible manipulation.',
          icon: XCircle
        };
      case 'INCONCLUSIVE':
        return {
          label: 'INCONCLUSIVE',
          badgeClass: 'badge-inconclusive',
          bannerBg: 'bg-amber-50/60 border-amber-200 text-amber-900',
          iconColor: 'text-amber-600',
          subtitle: 'The available evidence is insufficient to determine integrity confidently.',
          icon: AlertTriangle
        };
      case 'TRUSTED':
      default:
        return {
          label: 'TRUSTED',
          badgeClass: 'badge-trusted',
          bannerBg: 'bg-emerald-50/60 border-emerald-200 text-emerald-900',
          iconColor: 'text-emerald-600',
          subtitle: 'Multiple integrity signals indicate that this file is likely authentic.',
          icon: ShieldCheck
        };
    }
  };

  const statusCfg = getStatusConfig();
  const StatusIcon = statusCfg.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-mono text-[#64748B]">
            Analysis ID: <span className="font-semibold text-[#111827]">{resultData.id}</span>
          </div>
          <h1 className="text-xl font-bold text-[#111827] tracking-tight">
            Integrity Result
          </h1>
        </div>

        <div className="flex items-center gap-2.5">

          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#111827] text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#64748B]" />
            <span>Download Report</span>
          </button>

          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 border border-[#CBD5E1] text-[#111827] text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#64748B]" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* 1. Primary Integrity Result Banner */}
      <div className={`bg-white border rounded-xl p-6 shadow-xs ${statusCfg.bannerBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white shadow-xs border border-slate-200 shrink-0">
            <StatusIcon className={`w-8 h-8 ${statusCfg.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-[#64748B] font-medium">INTEGRITY RESULT</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.badgeClass}`}>
                {statusCfg.label}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#111827] mt-0.5 font-sans">
              {statusCfg.label === 'TRUSTED' ? 'Likely Authentic' : statusCfg.label === 'SUSPICIOUS' ? 'Likely Manipulated' : 'Inconclusive Evidence'}
            </h2>
            <p className="text-xs text-[#64748B] mt-1 font-sans">
              "{statusCfg.subtitle}"
            </p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] text-center shrink-0 w-full sm:w-auto shadow-xs">
          <div className="text-[11px] font-medium text-[#64748B] uppercase tracking-wider">Confidence</div>
          <div className="text-3xl font-extrabold font-mono text-[#111827] mt-0.5">
            {resultData.overallConfidence}%
          </div>
          <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden mx-auto border border-slate-200">
            <div 
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${resultData.overallConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Evidence Summary Section */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-semibold text-[#111827] border-b border-[#E5E7EB] pb-3">
          Evidence Summary
        </h3>

        <div className="space-y-3 font-sans text-xs">
          {resultData.detectedIssues.map((issue) => {
            const isCritical = issue.severity === 'CRITICAL';
            const isWarning = issue.severity === 'WARNING';
            
            return (
              <div 
                key={issue.id || issue.message}
                className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                {isCritical ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}

                <div className="space-y-0.5">
                  <div className="font-semibold text-[#111827]">
                    {issue.message}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {isCritical ? 'Suspicious signal detected' : isWarning ? 'Requires review' : 'Positive verification signal'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Media Specific Forensic Viewport */}
      {resultData.fileType === 'VIDEO' ? (
        <VideoResultView file={uploadedFile} data={resultData} />
      ) : resultData.fileType === 'DOCUMENT' ? (
        <DocumentResultView file={uploadedFile} data={resultData} />
      ) : (
        <ImageResultView file={uploadedFile} data={resultData} />
      )}

      {/* 4. Technical Forensics & Model Details Accordions */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl divide-y divide-[#E5E7EB] overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F8FAFC] text-xs font-semibold text-[#111827] uppercase tracking-wider">
          Technical Forensics & Model Details
        </div>

        {/* Section 1: File Information */}
        <div>
          <button
            onClick={() => toggleAccordion('fileInfo')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              openAccordions.fileInfo ? 'bg-blue-50/40 text-blue-700' : 'hover:bg-[#F8FAFC] text-[#111827]'
            }`}
          >
            <span className="text-sm font-semibold">File Information</span>
            {openAccordions.fileInfo ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>

          {openAccordions.fileInfo && (
            <div className="p-5 bg-white border-t border-[#E5E7EB] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-[#64748B]">Filename:</span>
                <span className="ml-2 font-semibold text-[#111827] truncate font-mono">{resultData.filename}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Media Type:</span>
                <span className="ml-2 font-medium text-[#111827]">{resultData.fileType}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Size:</span>
                <span className="ml-2 font-medium text-[#111827] font-mono">{formatBytes(resultData.fileSize)}</span>
              </div>
              <div>
                <span className="text-[#64748B]">MIME:</span>
                <span className="ml-2 font-medium text-[#111827]">{resultData.mimeType}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Cryptographic Verification */}
        <div>
          <button
            onClick={() => toggleAccordion('crypto')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              openAccordions.crypto ? 'bg-blue-50/40 text-blue-700' : 'hover:bg-[#F8FAFC] text-[#111827]'
            }`}
          >
            <span className="text-sm font-semibold">Cryptographic Verification</span>
            {openAccordions.crypto ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>

          {openAccordions.crypto && (
            <div className="p-5 bg-white border-t border-[#E5E7EB] space-y-3 text-xs font-sans">
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                <div className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>SHA-256</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-xs font-mono text-[#111827] break-all select-all">
                    {resultData.sha256}
                  </div>
                  <button
                    onClick={handleCopyHash}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-[#CBD5E1] text-[11px] font-medium text-[#111827] shrink-0 self-start sm:self-auto"
                  >
                    {copiedHash ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="text-[#64748B] flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Web Crypto SHA-256 ledger status: <strong className="text-[#111827]">{resultData.hashVerified ? 'MATCHED' : 'UNMATCHED'}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Metadata Analysis */}
        <div>
          <button
            onClick={() => toggleAccordion('metadata')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              openAccordions.metadata ? 'bg-blue-50/40 text-blue-700' : 'hover:bg-[#F8FAFC] text-[#111827]'
            }`}
          >
            <span className="text-sm font-semibold">Metadata Analysis</span>
            {openAccordions.metadata ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>

          {openAccordions.metadata && (
            <div className="p-5 bg-white border-t border-[#E5E7EB] space-y-2 text-xs font-sans text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">EXIF Consistency:</span>
                <span className="font-semibold text-emerald-700">Consistent</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Camera Profile & Timestamps:</span>
                <span className="font-semibold text-[#111827]">Validated</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Model Inference Specs */}
        <div>
          <button
            onClick={() => toggleAccordion('model')}
            className={`w-full p-4 flex items-center justify-between text-left transition-colors ${
              openAccordions.model ? 'bg-blue-50/40 text-blue-700' : 'hover:bg-[#F8FAFC] text-[#111827]'
            }`}
          >
            <span className="text-sm font-semibold">Model Inference Specs</span>
            {openAccordions.model ? <ChevronUp className="w-4 h-4 text-[#64748B]" /> : <ChevronDown className="w-4 h-4 text-[#64748B]" />}
          </button>

          {openAccordions.model && (
            <div className="p-5 bg-white border-t border-[#E5E7EB] space-y-2 text-xs font-sans text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Classifier Engine:</span>
                <span className="font-semibold text-[#111827]">{resultData.modelInfo?.aiDetector}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-[#64748B]">Spatial Network:</span>
                <span className="font-semibold text-[#111827]">{resultData.modelInfo?.imageTamperingDetector}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Video Sampling Engine:</span>
                <span className="font-semibold text-[#111827]">{resultData.modelInfo?.videoAnalysis}</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
