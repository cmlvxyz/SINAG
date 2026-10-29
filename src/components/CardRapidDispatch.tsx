import React, { useState } from 'react';
import { Wifi, Zap, Compass, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';

interface CardRapidDispatchProps {
  onTriggerSos: () => void;
  gpsAccuracy?: number;
}

export const CardRapidDispatch: React.FC<CardRapidDispatchProps> = ({
  onTriggerSos,
  gpsAccuracy = 3.8,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-200">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Rapid Dispatch Pipeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sub-second emergency gateway
          </p>
        </div>
        <button 
          onClick={onTriggerSos}
          className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          title="Inspect Dispatch Pipeline"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Purple Gradient Glass Card (Mirroring the VISA Card in reference image) */}
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-2xl p-5 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4C1D95] text-white overflow-hidden shadow-lg shadow-purple-900/25 transition-transform duration-300 hover:scale-[1.02]"
      >
        {/* Subtle decorative circuit lines & radar rings */}
        <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-52 h-52 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none" />

        {/* Card Header: Brand & Wireless Symbol */}
        <div className="flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wider text-sm bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20 text-white">
              SINAG RAPID
            </span>
            <span className="text-[11px] text-purple-200 font-medium">Auto-Route</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-200">
            <Wifi className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-mono">5G LIVE</span>
          </div>
        </div>

        {/* Big Metric: Sub-Second Latency */}
        <div className="mb-4 relative z-10">
          <p className="text-[11px] text-purple-200 font-medium tracking-wide uppercase">
            Avg Dispatch Response Time
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums">
              &lt; 0.38s
            </h3>
            <span className="text-xs text-emerald-300 font-medium flex items-center">
              <Zap className="w-3 h-3 mr-0.5 fill-emerald-300 text-emerald-300" />
              Sub-second
            </span>
          </div>
        </div>

        {/* Card Footer: Telemetry Info */}
        <div className="flex items-center justify-between pt-3 border-t border-white/15 text-xs text-purple-100/90 relative z-10 font-mono">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-purple-200" />
            <span>GPS ±{gpsAccuracy}m</span>
          </div>
          <div className="text-[11px]">
            BATTERY 98% · 24/7
          </div>
        </div>
      </div>

      {/* Lower Summary Row */}
      <div className="mt-4 pt-4 border-t border-purple-50 dark:border-[#272044] flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Response Readiness</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            99.94% Uptime
          </p>
        </div>
        <button
          onClick={() => {
            soundEffects.playEmergencySiren(1.2);
            onTriggerSos();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          Test SOS
        </button>
      </div>

    </div>
  );
};
