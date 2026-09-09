import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileImage, 
  FileVideo, 
  FileText, 
  X, 
  ArrowRight, 
  AlertCircle,
  Copy,
  Check,
  Lock
} from 'lucide-react';
import { formatBytes, calculateSHA256 } from '../../utils/hash';
import AnalyzeButton from '../common/AnalyzeButton';

export default function DropZone({ onFileSelected, selectedFile, onClearFile, onStartAnalysis }) {
  const [isDragging, setIsDragging] = useState(false);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setErrorMsg(null);
    const maxSize = 100 * 1024 * 1024; // 100MB limit

    if (file.size > maxSize) {
      setErrorMsg('File size exceeds the maximum limit of 100MB.');
      return;
    }

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }

    // Real Web Crypto SHA-256 calculation
    const hash = await calculateSHA256(file);
    setFileHash(hash);

    onFileSelected(file);
  };

  const handleRemove = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setFilePreviewUrl(null);
    setFileHash('');
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearFile();
  };

  const handleCopyHash = () => {
    if (fileHash) {
      navigator.clipboard.writeText(fileHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="text-left space-y-1">
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
          Analyze Media
        </h1>
        <p className="text-sm text-[#64748B] font-normal">
          Upload an image, video, or document to verify its integrity.
        </p>
      </div>

      {/* Empty Upload Dropzone */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center space-y-4 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/40 shadow-sm'
              : 'border-[#CBD5E1] hover:border-blue-400 hover:bg-slate-50/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
            accept="image/*,video/*,.pdf,.docx,.txt"
          />

          <div className="p-3 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <UploadCloud className="w-7 h-7 stroke-[1.8]" />
          </div>

          <div className="space-y-1">
            <div className="text-base font-semibold text-[#111827]">
              Upload media
            </div>
            <p className="text-xs text-[#64748B]">
              Drag and drop a file here or browse
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-medium">
            <span>Images · Videos · Documents</span>
            <span>•</span>
            <span>Maximum file size: 100MB</span>
          </div>

          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-colors mt-1"
          >
            Browse files
          </button>
        </div>
      ) : (
        /* Selected File Panel */
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            
            <div className="flex items-center gap-4">
              {/* Media Thumbnail / Icon */}
              <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {selectedFile.type.startsWith('image/') && filePreviewUrl ? (
                  <img src={filePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : selectedFile.type.startsWith('video/') && filePreviewUrl ? (
                  <video src={filePreviewUrl} className="w-full h-full object-cover" />
                ) : selectedFile.type.startsWith('video/') ? (
                  <FileVideo className="w-7 h-7 text-purple-600" />
                ) : selectedFile.type.includes('pdf') || selectedFile.type.includes('document') ? (
                  <FileText className="w-7 h-7 text-emerald-600" />
                ) : (
                  <FileImage className="w-7 h-7 text-blue-600" />
                )}
              </div>

              {/* File Details */}
              <div className="space-y-0.5">
                <div className="font-semibold text-[#111827] text-sm truncate max-w-sm" title={selectedFile.name}>
                  {selectedFile.name}
                </div>

                <div className="text-xs text-[#64748B] flex items-center gap-2 font-mono">
                  <span>{selectedFile.type || 'Standard File'}</span>
                  <span>·</span>
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-semibold font-sans">Status: Ready</span>
                </div>
              </div>
            </div>

            {/* Remove File Button */}
            <button
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cryptographic SHA-256 Light Technical Panel */}
          {fileHash && (
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>SHA-256</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-xs font-mono text-[#111827] break-all select-all pr-2">
                  {fileHash}
                </div>
                <button
                  onClick={handleCopyHash}
                  className="px-3 py-1 rounded-md bg-white hover:bg-slate-100 border border-[#CBD5E1] text-[#111827] text-xs font-medium shrink-0 flex items-center gap-1 shadow-2xs self-start sm:self-auto"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              onClick={handleRemove}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#111827] hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <AnalyzeButton onClick={onStartAnalysis}>
              <span>Run Integrity Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </AnalyzeButton>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

    </div>
  );
}
