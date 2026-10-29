import React, { useState } from 'react';
import {
  Crosshair,
  ExternalLink,
  Layers,
  MapPin,
  Navigation,
  Radio,
} from 'lucide-react';
import { IncidentAlert } from '../types';
import { FALLBACK_COORDS, LiveGoogleMap } from './LiveGoogleMap';
import { isValidCoordinate } from '../utils/coordinates';

interface LiveLocationTrackerProps {
  activeIncident?: IncidentAlert | null;
}

/**
 * Live location of the citizen who pressed SOS — Google Map + live
 * Street View centered on the exact incident coordinates. Follows every
 * location update that arrives over the bridge in real time.
 */
export const LiveLocationTracker: React.FC<LiveLocationTrackerProps> = ({
  activeIncident,
}) => {
  // Street View first — the victim's live street scene shows immediately,
  // just like opening the location directly in Google Maps.
  const [streetView, setStreetView] = useState(true);

  const rawLat = activeIncident?.location.lat;
  const rawLng = activeIncident?.location.lng;
  const hasValidCoords = isValidCoordinate(rawLat, rawLng);

  // Never fall back to 0,0 ("Null Island"). Use a safe center only for the
  // outer map link; the map component itself shows a waiting state.
  // Values actually handed to the map: real coords when valid, 0 otherwise so the
  // map component can render its "waiting for GPS" state instead of Null Island.
  const mapLat = hasValidCoords ? (rawLat as number) : 0;
  const mapLng = hasValidCoords ? (rawLng as number) : 0;
  const lat = hasValidCoords ? (rawLat as number) : FALLBACK_COORDS.lat;
  const lng = hasValidCoords ? (rawLng as number) : FALLBACK_COORDS.lng;
  // Round so tiny GPS jitter doesn't reload the embed on every tick.
  const viewLat = Math.round(lat * 10000) / 10000;
  const viewLng = Math.round(lng * 10000) / 10000;
  const viewKey = `${viewLat},${viewLng}`;

  const mapsUrl = hasValidCoords
    ? `https://www.google.com/maps?q=${lat},${lng}&z=17&hl=en`
    : `https://www.google.com/maps?q=${FALLBACK_COORDS.lat},${FALLBACK_COORDS.lng}&z=17&hl=en`;

  return (
    <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm flex flex-col justify-between transition-all duration-200">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Live Victim Location
            </h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeIncident
              ? `${activeIncident.citizenName} · #${activeIncident.incidentCode}`
              : 'No active SOS — showing default sector'}
          </p>
        </div>

        {/* Map / Street View toggles */}
        <div className="flex items-center gap-1 p-1 bg-purple-50 dark:bg-[#1E1736] rounded-xl border border-purple-100 dark:border-purple-900/40">
          <button
            onClick={() => setStreetView(false)}
            title="Map View"
            className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              !streetView
                ? 'bg-purple-600 text-white'
                : 'text-slate-500 hover:text-purple-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setStreetView(true)}
            title="Live Street View"
            className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              streetView
                ? 'bg-purple-600 text-white'
                : 'text-slate-500 hover:text-purple-600'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Google Map / Street View */}
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-purple-900/30 shadow-inner bg-slate-100 dark:bg-[#0A0815]">
        <div key={`${viewKey}-${streetView ? 'sv' : 'map'}`} className="absolute inset-0">
          <LiveGoogleMap
            lat={mapLat}
            lng={mapLng}
            zoom={17}
            streetView={streetView}
            showMarker
            markerTitle={
              activeIncident
                ? `${activeIncident.incidentCode} — ${activeIncident.citizenName}`
                : 'Default sector'
            }
          />
        </div>

        {/* Live HUD Floating Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 text-white font-mono text-[10px] space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LIVE SOS LOCATION</span>
          </div>
          {hasValidCoords ? (
            <>
              <div>LAT: {lat.toFixed(5)}° N</div>
              <div>LNG: {lng.toFixed(5)}° E</div>
            </>
          ) : (
            <div className="text-amber-300">Waiting for GPS coordinates…</div>
          )}
          {activeIncident && (
            <div className="text-purple-300">
              ACCURACY: ±{activeIncident.location.accuracyRadiusMeters}m
            </div>
          )}
        </div>

        {/* Victim status overlay */}
        {activeIncident && (
          <div className="absolute bottom-2.5 right-2.5 bg-purple-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/30 text-white text-right pointer-events-none">
            <span className="text-purple-300 font-mono text-[10px]">VICTIM STATUS</span>
            <div className="text-sm font-bold tabular-nums">
              {activeIncident.status === 'RESOLVED' ? 'Resolved' : activeIncident.status === 'EN_ROUTE' ? 'On the Way' : activeIncident.status === 'ON_SCENE' ? 'Wait for Me' : 'Dispatched'}
            </div>
            <div className="text-[9px] text-emerald-300 font-mono">
              {activeIncident.location.barangay}
            </div>
          </div>
        )}
      </div>

      {/* Location footer */}
      <div className="mt-4 pt-4 border-t border-purple-50 dark:border-[#272044] flex items-center justify-between gap-2 text-xs">
        <div className="min-w-0">
          <span className="text-slate-400">Victim address:</span>
          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="truncate">
              {hasValidCoords && activeIncident
                ? `${activeIncident.location.address} — ${activeIncident.location.barangay}, ${activeIncident.location.city}`
                : hasValidCoords
                ? 'Location pending'
                : 'Waiting for GPS coordinates…'}
            </span>
          </p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
          title="Open this exact location in Google Maps"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

    </div>
  );
};
