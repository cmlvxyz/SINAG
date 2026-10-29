import React from 'react';
import { PushNotificationItem } from '../types';
import { ShieldAlert, Bell, Radio, X, ArrowUpRight } from 'lucide-react';

interface PushToastStackProps {
  toasts: PushNotificationItem[];
  onDismiss: (id: string) => void;
  onOpenIncident?: (incidentId?: string) => void;
}

export const PushToastStack: React.FC<PushToastStackProps> = ({
  toasts,
  onDismiss,
  onOpenIncident,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 dark:bg-[#18132D]/95 backdrop-blur-md rounded-2xl p-4 border border-purple-300/80 dark:border-purple-600/40 shadow-xl shadow-purple-900/20 text-slate-900 dark:text-white flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-top-4"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/30">
            {toast.type === 'SOS_DISPATCH' ? (
              <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <Bell className="w-5 h-5 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold uppercase">
                Push Alert · {toast.timestamp}
              </span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {toast.title}
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {toast.body}
            </p>

            {toast.incidentId && (
              <button
                onClick={() => {
                  onDismiss(toast.id);
                  onOpenIncident?.(toast.incidentId);
                }}
                className="mt-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View Live Victim Map</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
