import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, ShieldCheck } from 'lucide-react';

export default function ModelInfoAccordion({ modelInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="trust-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <Cpu className="w-4 h-4 text-blue-600" />
          <span>Model & Pipeline Information</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-sans">
          <span>{isOpen ? 'Collapse Details' : 'Expand Specification'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-[#E5E7EB] bg-white space-y-4 font-sans text-xs text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">AI Detector Engine</span>
              <p className="font-semibold text-slate-900">
                {modelInfo?.aiDetector || 'ViT (Vision Transformer) Forensic Classifier'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Image Tampering Model</span>
              <p className="font-semibold text-purple-900">
                {modelInfo?.imageTamperingDetector || 'ViT Spatial Anomaly Network'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Video Sequence Engine</span>
              <p className="font-semibold text-emerald-900">
                {modelInfo?.videoAnalysis || 'ViT frame-level analysis + temporal analysis'}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Document Forensics</span>
              <p className="font-semibold text-amber-900">
                {modelInfo?.documentDetector || 'Trained document neural structure model'}
              </p>
            </div>

          </div>

          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-700 text-[11px] leading-relaxed flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Multi-Contributor Integrity Guarantee:</strong> Models are executed inside isolated containerized inference nodes. Results are cryptographically signed before being broadcast to downstream pipeline consumers.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
