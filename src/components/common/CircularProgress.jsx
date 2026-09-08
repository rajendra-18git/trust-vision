import React from 'react';

export default function CircularProgress({ 
  percentage = 0, 
  size = 140, 
  strokeWidth = 10, 
  color = 'cyan', 
  label = '', 
  sublabel = '' 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    cyan: { stroke: '#06b6d4', text: 'text-cyan-400', bg: 'stroke-cyan-950/60' },
    emerald: { stroke: '#10b981', text: 'text-emerald-400', bg: 'stroke-emerald-950/60' },
    amber: { stroke: '#f59e0b', text: 'text-amber-400', bg: 'stroke-amber-950/60' },
    rose: { stroke: '#f43f5e', text: 'text-rose-500', bg: 'stroke-rose-950/60' },
    blue: { stroke: '#3b82f6', text: 'text-blue-400', bg: 'stroke-blue-950/60' }
  };

  const selectedColor = colorMap[color] || colorMap.cyan;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`stroke-slate-800/80 ${selectedColor.bg}`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={selectedColor.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-bold font-mono tracking-tight ${selectedColor.text}`}>
            {percentage}%
          </span>
          {sublabel && (
            <span className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono text-center">
          {label}
        </span>
      )}
    </div>
  );
}
