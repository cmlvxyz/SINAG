import React, { useState } from 'react';
import { ArrowUpRight, PhoneCall, Radio, CheckCircle2 } from 'lucide-react';
import { INITIAL_RESPONDERS } from '../data/mockData';
import { ResponderUnit } from '../types';
import { soundEffects } from '../services/soundEffects';

interface OnDutyRespondersProps {
  onSelectResponder?: (responder: ResponderUnit) => void;
}

export const OnDutyResponders: React.FC<OnDutyRespondersProps> = ({
  onSelectResponder,
}) => {
  const [calledUnit, setCalledUnit] = useState<string | null>(null);

  const handleRadioCall = (unit: ResponderUnit) => {
    soundEffects.playDispatchPing();
    setCalledUnit(unit.unitCode);
    setTimeout(() => {
      setCalledUnit(null);
    }, 3500);
  };

  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between transition-all duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            On-Duty SINAG Responders
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active certified rescue & medical units
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Responders List (Mirroring the avatar row / items in the image) */}
      <div className="space-y-3.5 my-1">
        {INITIAL_RESPONDERS.map((responder) => (
          <div
            key={responder.id}
            onClick={() => onSelectResponder?.(responder)}
            className="flex items-center justify-between p-2.5 rounded-2xl bg-purple-50/40 dark:bg-[#1A1433] hover:bg-purple-100/60 dark:hover:bg-[#221B42] transition-colors group cursor-pointer"
          >
            {/* Avatar & Role Info */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold ring-2 ring-purple-500/30">
                  {responder.name.charAt(0).toUpperCase()}
                </div>
                <span 
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#141026] ${
                    responder.status === 'RESPONDING'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`} 
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {responder.name}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    {responder.unitCode}
                  </span>
                  <span>·</span>
                  <span>{responder.role}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRadioCall(responder);
              }}
              title="Radio Dispatch Connect"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                calledUnit === responder.unitCode
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-600/30'
              }`}
            >
              {calledUnit === responder.unitCode ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>Radio</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="pt-3 mt-2 border-t border-purple-50 dark:border-[#272044] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Average Responder Rating: <strong className="text-purple-600 dark:text-purple-400 font-semibold">4.98 ★</strong></span>
        <span className="font-mono text-[11px]">4 Units in Radius</span>
      </div>

    </div>
  );
};
