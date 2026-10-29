import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Eye,
  Hand,
  MapPin,
  Navigation,
} from 'lucide-react';
import { IncidentAlert } from '../types';

interface ActiveEmergenciesProps {
  incidents: IncidentAlert[];
  onSelectIncident: (incident: IncidentAlert) => void;
  onTrackIncidentGps: (incident: IncidentAlert) => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentAlert['status']) => void;
}

const statusStyle = (status: IncidentAlert['status']): string => {
  switch (status) {
    case 'DISPATCHED':
      return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300';
    case 'EN_ROUTE':
      return 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300';
    case 'ON_SCENE':
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300';
    default:
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300';
  }
};

const statusLabel = (status: IncidentAlert['status']): string => {
  switch (status) {
    case 'DISPATCHED':
      return 'Dispatched';
    case 'EN_ROUTE':
      return 'On the Way';
    case 'ON_SCENE':
      return 'Wait for Me';
    default:
      return 'Resolved';
  }
};

/**
 * Live SOS signals that still need a response — mirrors the Active Emergency
 * cards of the original Bayani Alert console.
 */
export const ActiveEmergencies: React.FC<ActiveEmergenciesProps> = ({
  incidents,
  onSelectIncident,
  onTrackIncidentGps,
  onUpdateStatus,
}) => {
  const active = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <section aria-label="Active emergencies" className="h-full rounded-3xl border border-red-200/70 dark:border-red-900/40 bg-white dark:bg-[#141026] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-red-50/70 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            {active.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-60" />
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${active.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />
          </span>
          <h2 className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white uppercase">
            Active Emergencies
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold font-mono tabular-nums">
            {active.length} Active
          </span>
        </div>
        <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
          Live SOS signals needing response
        </p>
      </div>

      {active.length === 0 ? (
        <div className="px-5 py-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>All clear — no active emergencies right now.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-4">
          {active.map((inc) => (
            <article
              key={inc.id}
              className="rounded-2xl border-l-4 border-l-red-500 border border-[#E9E3F5] dark:border-[#272044] bg-purple-50/30 dark:bg-[#1A1433]/60 p-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono text-[10px] font-bold">
                        #{inc.incidentCode}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusStyle(inc.status)}`}>
                        {statusLabel(inc.status)}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                      {inc.citizenName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {inc.date} · {inc.time} · {inc.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">
                  {inc.location.address} — {inc.location.barangay}, {inc.location.city}
                </span>
              </p>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onSelectIncident(inc)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
                <button
                  onClick={() => onTrackIncidentGps(inc)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Live Map</span>
                </button>
                <span className="flex-1" />
                <button
                  onClick={() => onUpdateStatus(inc.id, 'EN_ROUTE')}
                  title="Tell the citizen: responder is ON THE WAY"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm shadow-indigo-600/30 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>On the Way</span>
                </button>
                <button
                  onClick={() => onUpdateStatus(inc.id, 'ON_SCENE')}
                  title="Tell the citizen: WAIT FOR ME"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm shadow-amber-500/30 transition-colors"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Wait for Me</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
