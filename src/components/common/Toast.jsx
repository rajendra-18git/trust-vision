import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-slate-900 text-white border-slate-800',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400'
    },
    error: {
      bg: 'bg-slate-900 text-white border-slate-800',
      icon: AlertCircle,
      iconColor: 'text-rose-400'
    },
    info: {
      bg: 'bg-slate-900 text-white border-slate-800',
      icon: Info,
      iconColor: 'text-blue-400'
    }
  };

  const cfg = typeConfig[type] || typeConfig.info;
  const IconComponent = cfg.icon;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-xs font-sans ${cfg.bg}`}>
        <IconComponent className={`w-4 h-4 shrink-0 ${cfg.iconColor}`} />
        <span>{message}</span>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:text-slate-300 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
