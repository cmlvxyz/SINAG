import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Crosshair,
  Eye,
  FileText,
  Inbox,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { IncidentAlert } from '../types';

interface IncidentArchiveProps {
  incidents: IncidentAlert[];
  onOpenDetails: (incident: IncidentAlert) => void;
  onTrackIncidentGps: (incident: IncidentAlert) => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentAlert['status']) => void;
  onDeleteIncident: (incidentId: string) => void;
  onNewSos: () => void;
}

/** Presentation-only status tone. Never changes the underlying status value. */
const statusTone = (status: IncidentAlert['status']): string => {
  switch (status) {
    case 'DISPATCHED':
      return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50';
    case 'EN_ROUTE':
      return 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50';
    case 'ON_SCENE':
      return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
    case 'RESOLVED':
      return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
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
    case 'RESOLVED':
      return 'Resolved';
    default:
      return status;
  }
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'EN_ROUTE', label: 'On the Way' },
  { value: 'ON_SCENE', label: 'Wait for Me' },
  { value: 'RESOLVED', label: 'Resolved' },
];

/**
 * Incident Management & Archive — mirrors the original Bayani Alert
 * ResponderIncidentsView: searchable/sortable incident list on the left,
 * full inspection dossier on the right.
 */
export const IncidentArchive: React.FC<IncidentArchiveProps> = ({
  incidents,
  onOpenDetails,
  onTrackIncidentGps,
  onUpdateStatus,
  onDeleteIncident,
  onNewSos,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(incidents[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDesc, setSortDesc] = useState(true);

  // Keep the selection in sync with store updates (status / delete / live SOS).
  useEffect(() => {
    if (incidents.length === 0) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) =>
      prev && incidents.some((i) => i.id === prev) ? prev : incidents[0].id
    );
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const rows = incidents.filter((i) => {
      const matchesFilter = statusFilter === 'ALL' || i.status === statusFilter;
      const addr = `${i.location?.address ?? ''} ${i.location?.barangay ?? ''} ${i.location?.city ?? ''}`.toLowerCase();
      const matchesSearch =
        q === '' ||
        addr.includes(q) ||
        (i.incidentCode ?? '').toLowerCase().includes(q) ||
        (i.citizenName ?? '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
    return rows.sort((a, b) =>
      sortDesc
        ? b.timestampMs - a.timestampMs
        : a.timestampMs - b.timestampMs
    );
  }, [incidents, statusFilter, searchQuery, sortDesc]);

  const selected = incidents.find((i) => i.id === selectedId) ?? null;

  // Only show lifecycle-legal next steps (a resolved alert can't reopen).
  const statusOptions: IncidentAlert['status'][] =
    selected && selected.status !== 'RESOLVED'
      ? (['EN_ROUTE', 'ON_SCENE', 'RESOLVED'] as IncidentAlert['status'][]).filter(
          (opt) => opt !== selected.status
        )
      : [];

  const handleDelete = (inc: IncidentAlert) => {
    onDeleteIncident(inc.id);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Incident Management &amp; Archive</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time intake, tracking, and case documentation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search code, citizen, barangay…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#141026] border border-[#E9E3F5] dark:border-[#272044] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-purple-400 focus:outline-none w-52 sm:w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#141026] border border-[#E9E3F5] dark:border-[#272044] text-xs text-slate-600 dark:text-slate-300 font-bold focus:border-purple-400 focus:outline-none"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <button
            onClick={() => setSortDesc((v) => !v)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#141026] border border-[#E9E3F5] dark:border-[#272044] text-xs text-slate-600 dark:text-slate-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex items-center gap-1.5"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            {sortDesc ? 'Newest' : 'Oldest'}
          </button>

          <button
            onClick={onNewSos}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>File New SOS</span>
          </button>
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident list */}
        <section className="lg:col-span-1 bg-white dark:bg-[#141026] rounded-3xl border border-[#E9E3F5] dark:border-[#272044] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100 dark:border-[#272044]">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Incidents</span>
            <span className="text-[11px] font-mono text-slate-400">{filteredIncidents.length} shown</span>
          </div>

          <div className="max-h-[640px] overflow-y-auto divide-y divide-purple-50 dark:divide-[#1E1838]">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center">
                <Inbox className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 mt-2">No incidents match the current filters.</p>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isSelected = selected?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedId(inc.id)}
                    className={`w-full text-left p-4 transition-colors border-l-4 ${
                      isSelected
                        ? 'bg-purple-50/70 dark:bg-purple-950/30 border-l-purple-600'
                        : 'border-l-transparent hover:bg-purple-50/40 dark:hover:bg-[#1A1433]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-sm truncate">
                        #{inc.incidentCode}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusTone(inc.status)}`}>
                          {statusLabel(inc.status)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(inc);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              handleDelete(inc);
                            }
                          }}
                          aria-label={`Delete incident ${inc.incidentCode}`}
                          title="Delete incident"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </span>
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 dark:text-white text-xs mt-1.5 truncate">
                      {inc.citizenName?.trim() || 'Unknown Citizen'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {inc.location?.address || (inc.location?.barangay ? `${inc.location.barangay}${inc.location.city ? ', ' + inc.location.city : ''}` : 'Location unavailable')}
                    </div>

                    <div className="pt-2 mt-2 border-t border-purple-50 dark:border-[#1E1838] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{inc.time}</span>
                      <span>{inc.date}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Incident inspector / dossier */}
        <section className="lg:col-span-2">
          {selected ? (
            <div className="bg-white dark:bg-[#141026] rounded-3xl border border-[#E9E3F5] dark:border-[#272044] shadow-sm p-5 sm:p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-4 border-b border-purple-100 dark:border-[#272044]">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
                    Incident Dossier
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
                    #{selected.incidentCode} — {selected.citizenName?.trim() || 'Unknown'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Activated {selected.date} at {selected.time} · Latency {selected.responseTimeMs}ms
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onOpenDetails(selected)}
                    className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center gap-1.5 hover:bg-purple-100 dark:hover:bg-purple-900/40 active:scale-95 transition-colors"
                    title="Open full details modal"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => onTrackIncidentGps(selected)}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-colors"
                    title="Track this incident on the GPS radar"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Live Map</span>
                  </button>

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Status:</span>
                  {statusOptions.length > 0 ? (
                    <select
                      value={selected.status}
                      onChange={(e) => onUpdateStatus(selected.id, e.target.value as IncidentAlert['status'])}
                      className="px-3 py-2 rounded-xl bg-white dark:bg-[#120E22] border border-[#E9E3F5] dark:border-purple-800/40 text-xs font-bold text-slate-800 dark:text-slate-200 focus:border-purple-400 focus:outline-none"
                    >
                      <option value={selected.status}>{statusLabel(selected.status)}</option>
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>{statusLabel(opt)}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`px-3 py-2 rounded-xl border text-xs font-bold ${statusTone(selected.status)}`}>
                      {statusLabel(selected.status)}
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(selected)}
                    aria-label={`Delete incident ${selected.incidentCode}`}
                    title="Delete incident"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 active:scale-95 transition-all border border-[#E9E3F5] dark:border-[#272044]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Telemetry summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
                  {selected.location?.address ? (
                    <>
                      <span className="font-bold text-slate-900 dark:text-white block truncate mt-0.5">{selected.location.address}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                        {selected.location.barangay}
                        {selected.location.barangay && selected.location.city ? ', ' : ''}
                        {selected.location.city}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-slate-400 block mt-0.5">Location unavailable</span>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Coordinates &amp; Precision</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                    {selected.location.lat.toFixed(5)}° N, {selected.location.lng.toFixed(5)}° E
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                    Accuracy ±{selected.location.accuracyRadiusMeters}m
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Responder</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 block truncate mt-0.5">
                    {selected.assignedResponder?.name || 'None Assigned'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
                    ETA: {selected.assignedResponder ? `${selected.assignedResponder.etaMinutes} mins` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Exact location CTA (radar lives in its own tab) */}
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40 px-4 py-3">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span className="font-mono truncate">
                    {selected.location.lat.toFixed(5)}°, {selected.location.lng.toFixed(5)}° · ±{selected.location.accuracyRadiusMeters}m · {selected.priority} priority
                  </span>
                </p>
                <button
                  onClick={() => onTrackIncidentGps(selected)}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Open in Live Map</span>
                </button>
              </div>

              {/* Event timeline */}
              <div className="space-y-3 pt-1">
                <h4 className="font-extrabold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Detailed Event Timeline</h4>
                <ol className="relative space-y-3 pl-5 before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-purple-200 dark:before:bg-purple-800/60">
                  {selected.timeline.map((step, idx) => (
                    <li key={idx} className="relative text-xs">
                      <span className="absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-700 dark:text-slate-200">{step.label}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{step.timestamp} (+{step.timeOffsetMs}ms)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{step.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#141026] rounded-3xl border border-[#E9E3F5] dark:border-[#272044] shadow-sm p-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <Inbox className="w-7 h-7 text-slate-300" />
              Select an incident from the list to inspect its dossier.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
