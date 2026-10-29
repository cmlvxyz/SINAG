import React from 'react';
import { CheckCircle2, ChevronRight, History } from 'lucide-react';
import { IncidentAlert } from '../types';

interface ResolvedIncidentsProps {
  incidents: IncidentAlert[];
  onSelectIncident: (incident: IncidentAlert) => void;
}

/**
 * Resolved case history strip on the dashboard — every closed incident
 * in one place, newest first. Click a row to reopen its full dossier.
 */
export const ResolvedIncidents: React.FC<ResolvedIncidentsProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const resolved = incidents.filter((i) => i.status === 'RESOLVED');

  return (
    <section aria-label="Resolved incidents" className="h-full rounded-3xl border border-emerald-200/70 dark:border-emerald-900/40 bg-white dark:bg-[#141026] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2.5">
          <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-extrabold tracking-wide text-slate-900 dark:text-white uppercase">
            Resolved Incidents
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold font-mono tabular-nums">
            {resolved.length} Resolved
          </span>
        </div>
        <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400">
          Closed case history
        </p>
      </div>

      {resolved.length === 0 ? (
        <div className="px-5 py-4 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-slate-300" />
          <span>No resolved cases yet — they will appear here once closed.</span>
        </div>
      ) : (
        <ul className="max-h-56 overflow-y-auto divide-y divide-emerald-50 dark:divide-[#1E1838]">
          {resolved.map((inc) => (
            <li key={inc.id}>
              <button
                onClick={() => onSelectIncident(inc)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 transition-colors group"
              >
                <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <strong className="text-xs text-slate-900 dark:text-white">
                      {inc.citizenName}
                    </strong>
                    <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                      #{inc.incidentCode}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {inc.category}
                    </span>
                  </span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {inc.title} · {inc.location.barangay}, {inc.location.city}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[10px] font-mono text-slate-400 tabular-nums">
                    {inc.date}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-400 tabular-nums">
                    {inc.time}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
