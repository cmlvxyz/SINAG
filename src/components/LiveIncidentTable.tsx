import React, { useState } from 'react';
import { 
  HeartPulse, 
  Flame, 
  CloudRain, 
  ShieldAlert, 
  Car, 
  LifeBuoy, 
  Clock, 
  MapPin, 
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { IncidentAlert, IncidentCategory } from '../types';

interface LiveIncidentTableProps {
  incidents: IncidentAlert[];
  onSelectIncident: (incident: IncidentAlert) => void;
  onTrackIncidentGps: (incident: IncidentAlert) => void;
}

export const LiveIncidentTable: React.FC<LiveIncidentTableProps> = ({
  incidents,
  onSelectIncident,
  onTrackIncidentGps,
}) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const getCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'MEDICAL':
        return <HeartPulse className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'FIRE':
        return <Flame className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'FLOOD':
        return <CloudRain className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'POLICE':
        return <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'ACCIDENT':
        return <Car className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'RESCUE':
        return <LifeBuoy className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getStatusBadge = (status: IncidentAlert['status']) => {
    switch (status) {
      case 'DISPATCHED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            Dispatched
          </span>
        );
      case 'EN_ROUTE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            En Route
          </span>
        );
      case 'ON_SCENE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            On Scene
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Resolved
          </span>
        );
    }
  };

  const filteredIncidents = incidents.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.category === filter;
    const matchesSearch = 
      item.citizenName.toLowerCase().includes(search.toLowerCase()) ||
      item.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
      item.location.barangay.toLowerCase().includes(search.toLowerCase()) ||
      item.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between transition-all duration-200">
      
      {/* Table Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Alert History & Feed
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[11px] font-semibold font-mono">
              {filteredIncidents.length} Active
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sub-second real-time emergency logging
          </p>
        </div>

        {/* Category Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'MEDICAL', 'FIRE', 'FLOOD', 'POLICE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-purple-50/70 dark:bg-[#1C1635] text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-purple-100 dark:border-[#272044] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase text-[11px]">
              <th className="pb-3 pl-2">Incident / Citizen</th>
              <th className="pb-3 hidden sm:table-cell">Date</th>
              <th className="pb-3">Time & Latency</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 hidden md:table-cell">Distance & ETA</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-50 dark:divide-[#1E1838]">
            {filteredIncidents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No alerts found for this filter.
                </td>
              </tr>
            ) : (
              filteredIncidents.map((inc) => (
                <tr 
                  key={inc.id}
                  className="hover:bg-purple-50/50 dark:hover:bg-[#1A1433] transition-colors group cursor-pointer"
                  onClick={() => onSelectIncident(inc)}
                >
                  {/* Citizen & Type */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center shrink-0 border border-purple-200/50 dark:border-purple-800/40">
                        {getCategoryIcon(inc.category)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{inc.citizenName}</span>
                          <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-normal">
                            #{inc.incidentCode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {inc.location.barangay}, {inc.location.city}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 text-slate-600 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                    {inc.date}
                  </td>

                  {/* Time & Response Latency */}
                  <td className="py-3.5 whitespace-nowrap">
                    <div className="font-mono text-slate-900 dark:text-white">
                      {inc.time}
                    </div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                      ⚡ {inc.responseTimeMs}ms pipeline
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 whitespace-nowrap">
                    {getStatusBadge(inc.status)}
                  </td>

                  {/* Distance & ETA */}
                  <td className="py-3.5 hidden md:table-cell whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <span>{inc.assignedResponder ? `${inc.assignedResponder.distanceKm} km` : '1.2 km'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ETA ~{inc.assignedResponder ? `${inc.assignedResponder.etaMinutes} mins` : '3 mins'}
                    </p>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTrackIncidentGps(inc);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-[11px] border border-purple-200/50 dark:border-purple-800/40 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Live Map</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
