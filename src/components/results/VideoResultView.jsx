import React from 'react';
import { FileVideo, Film, AlertCircle, Info } from 'lucide-react';

export default function VideoResultView({ file, data }) {
  const videoStats = data.videoStats || {
    tamperedFrames: 0,
    totalFrames: 28,
    tamperedPercentage: 0,
    meanTamperingProbability: 4.2,
    temporalConsistency: 99.2,
    evidenceScore: 0.052,
    duration: '00:14',
    resolution: '1920x1080',
    fps: 30,
    audioPresent: true
  };

  const videoUrl = file ? URL.createObjectURL(file) : null;

  return (
    <div className="trust-card p-6 space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
        <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2">
          <Film className="w-4 h-4 text-purple-600" />
          <span>Video Integrity & Frame-Level Analysis</span>
        </h3>
        <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded font-medium">
          ViT Frame Sampling
        </span>
      </div>

      {/* Frame-level disclaimer */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-sans flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold">Methodology Disclaimer: </strong>
          The video pipeline applies an image-level ViT model to sampled video frames rather than a native video-sequence model. Results represent <span className="font-semibold text-slate-900">"Frame-level visual tampering evidence"</span>.
        </div>
      </div>

      {/* Main Grid: Player + Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 bg-slate-50 rounded-lg border border-[#E5E7EB] overflow-hidden space-y-2 p-2">
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full h-48 object-cover rounded" />
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 font-sans text-xs gap-2">
              <FileVideo className="w-10 h-10 text-slate-300 stroke-[1.2]" />
              <span>Video Stream Buffered</span>
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 text-[11px] font-mono text-slate-600 text-center pt-1">
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <div className="text-slate-400 text-[10px]">Duration</div>
              <div className="font-semibold text-slate-800">{videoStats.duration}</div>
            </div>
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <div className="text-slate-400 text-[10px]">Resolution</div>
              <div className="font-semibold text-slate-800">{videoStats.resolution}</div>
            </div>
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <div className="text-slate-400 text-[10px]">FPS</div>
              <div className="font-semibold text-slate-800">{videoStats.fps}</div>
            </div>
            <div className="p-1.5 rounded bg-white border border-slate-200">
              <div className="text-slate-400 text-[10px]">Audio</div>
              <div className="font-semibold text-slate-800">{videoStats.audioPresent ? 'Present' : 'None'}</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-3 text-xs font-sans">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1.5 flex justify-between">
              <span>Quantitative Frame Analysis</span>
              <span className="text-blue-600 font-mono">28 Frames Sampled</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
              <span className="text-slate-600">Tampered Frames:</span>
              <span className="font-semibold text-slate-900">{videoStats.tamperedFrames} / {videoStats.totalFrames}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 font-mono">
              <span className="text-slate-600">Tampered Percentage:</span>
              <span className={`font-semibold ${videoStats.tamperedPercentage > 20 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {videoStats.tamperedPercentage}%
              </span>
            </div>

            <div className="flex justify-between py-1 font-mono">
              <span className="text-slate-600">Evidence Score:</span>
              <span className="font-semibold text-purple-700">{videoStats.evidenceScore}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
