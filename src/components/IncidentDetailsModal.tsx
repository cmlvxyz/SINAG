import React from 'react';
import {
  X,
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Zap,
  AlertOctagon,
  ArrowRight,
  Hand,
  Navigation
} from 'lucide-react';
import { IncidentAlert } from '../types';
import { soundEffects } from '../services/soundEffects';

interface IncidentDetailsModalProps {
  incident: IncidentAlert | null;
  onClose: () => void;
  onUpdateStatus: (incidentId: string, newStatus: IncidentAlert['status']) => void;
  onTrackOnRadar: (incident: IncidentAlert) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  onClose,
  onUpdateStatus,
  onTrackOnRadar,
}) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#141026] w-full max-w-xl rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-[#272044] shadow-2xl relative overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-purple-100 dark:border-[#272044]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-600 text-white font-mono text-xs font-bold">
                #{incident.incidentCode}
              </span>
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                {incident.category} DISPATCH
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {incident.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {incident.date} · {incident.time} · Latency: <strong>{incident.responseTimeMs}ms</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="my-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Citizen & Location Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Citizen Information</p>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                {incident.citizenName}
              </p>
              <p className="text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {incident.citizenPhone}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">GPS Location Fix</p>
              <div className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span className="truncate">{incident.location.address}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                {incident.location.barangay}, {incident.location.city} (±{incident.location.accuracyRadiusMeters}m)
              </p>
            </div>
          </div>

          {/* Assigned Responder Unit */}
          {incident.assignedResponder && (
            <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-[#18132D] border border-purple-100 dark:border-[#272044] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold ring-2 ring-purple-600/40">
                  {incident.assignedResponder.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {incident.assignedResponder.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono text-[10px] font-bold">
                      {incident.assignedResponder.unitCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {incident.assignedResponder.role} · Distance: {incident.assignedResponder.distanceKm} km (ETA {incident.assignedResponder.etaMinutes} mins)
                  </p>
                </div>
              </div>
              <a
                href={`tel:${incident.assignedResponder.phone}`}
                className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-sm flex items-center justify-center transition-colors"
                title="Direct Phone Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Timeline of sub-second events */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
              Sub-Second Execution Log
            </h4>
            <div className="space-y-2 border-l-2 border-purple-300 dark:border-purple-800/80 pl-3 ml-2 text-xs font-mono">
              {incident.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-purple-600 dark:bg-purple-400 ring-2 ring-white dark:ring-[#141026]" />
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {step.timestamp} (+{step.timeOffsetMs}ms)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-purple-100 dark:border-[#272044] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              onTrackOnRadar(incident);
            }}
            className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-purple-200 dark:border-purple-800/40 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
          >
            <span>Open in Live Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {incident.status !== 'RESOLVED' ? (
              <>
                <button
                  onClick={() => {
                    soundEffects.playDispatchPing();
                    onUpdateStatus(incident.id, 'EN_ROUTE');
                  }}
                  title="Tell the citizen: responder is ON THE WAY"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>On the Way</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playDispatchPing();
                    onUpdateStatus(incident.id, 'ON_SCENE');
                  }}
                  title="Tell the citizen: WAIT FOR ME"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Wait for Me</span>
                </button>
                <button
                  onClick={() => {
                    soundEffects.playSuccessTone();
                    onUpdateStatus(incident.id, 'RESOLVED');
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Resolved</span>
                </button>
              </>
            ) : (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Incident Resolved</span>
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
