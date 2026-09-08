import React from 'react';
import { FileImage, Image as ImageIcon } from 'lucide-react';
import { formatBytes } from '../../utils/hash';

export default function ImageResultView({ file, data }) {
  const fileUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="trust-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-600" />
          <span>Analyzed Image Viewport</span>
        </h3>
        <span className="text-xs font-mono text-slate-500">
          Format: {data.fileType}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 bg-slate-50 rounded-lg border border-[#E5E7EB] overflow-hidden relative max-h-72 flex items-center justify-center p-2">
          {fileUrl ? (
            <img 
              src={fileUrl} 
              alt="Analyzed preview" 
              className="max-h-64 w-auto object-contain rounded"
            />
          ) : (
            <div className="py-12 text-center text-slate-400 font-sans text-xs flex flex-col items-center gap-2">
              <FileImage className="w-10 h-10 text-slate-300 stroke-[1.2]" />
              <span>Image Asset Buffered</span>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-3 text-xs font-sans">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-slate-500 text-[11px] font-semibold uppercase">File Properties</div>
            <div className="flex justify-between font-medium text-slate-900">
              <span>Filename:</span>
              <span className="truncate max-w-[150px]" title={data.filename}>{data.filename}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-mono">
              <span>Size:</span>
              <span>{formatBytes(data.fileSize)}</span>
            </div>
            <div className="flex justify-between text-slate-600 font-mono">
              <span>MIME Type:</span>
              <span>{data.mimeType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
