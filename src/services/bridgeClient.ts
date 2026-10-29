/**
 * Bayani Bridge client — Response Center (bayani-alert2) side.
 *
 * Mirrors the original Bayani Alert bridge integration:
 * - Subscribes to SOS incidents pushed by the Bayani App (SSE /stream)
 * - Receives live location updates + resolve/delete broadcasts
 * - Tracks bridge online/offline so the UI can show a connection pill
 * - Fetches persisted incidents + online citizen accounts (needs operator session)
 *
 * Without an operator session the bridge still reports health and public
 * broadcasts (resolve / accounts_update); live SOS frames and the incident
 * list require an RC role, so those calls throw UNAUTHORIZED and the app
 * falls back to its local demo data.
 */

import { IncidentAlert, IncidentCategory, IncidentStatus, ResponderUnit } from '../types';

// Bridge base URL — same default as the Bayani App (port 8000 on the same
// host, so it works from other PCs on the LAN). Override via VITE_BRIDGE_URL.
export const BRIDGE_URL =
  import.meta.env.VITE_BRIDGE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

const TOKEN_KEY = 'bayani_rc_token';

export interface OperatorSession {
  token: string;
  username: string;
  role: string;
}

export function getStoredSession(): OperatorSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.username) return parsed as OperatorSession;
    return null;
  } catch {
    return null;
  }
}

function storeSession(session: OperatorSession | null) {
  try {
    if (session) localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — ignore
  }
}

function authHeaders(): Record<string, string> {
  const session = getStoredSession();
  return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
}

/** Operator sign in (uses the bridge admin login, same as the original console). */
export async function loginOperator(username: string, password: string): Promise<OperatorSession> {
  const res = await fetch(`${BRIDGE_URL}/auth/admin-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || !data?.token) {
    throw new Error(data?.error || 'Invalid username or password');
  }
  const session: OperatorSession = {
    token: data.token,
    username: data.user?.username ?? username,
    role: data.user?.role ?? 'admin',
  };
  storeSession(session);
  return session;
}

export async function logoutOperator(): Promise<void> {
  const session = getStoredSession();
  try {
    await fetch(`${BRIDGE_URL}/auth/logout`, {
      method: 'POST',
      headers: { ...authHeaders() },
    });
  } catch {
    // offline — ignore
  }
  void session;
  storeSession(null);
  try {
    await fetch(`${BRIDGE_URL}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'citizen', type: 'logout', payload: {} }),
    }).catch(() => {});
  } catch {
    // ignore
  }
}

/**
 * Make sure alert2 holds a working operator session, so SOS frames from the
 * Bayani App show up without any manual sign-in.
 *
 * - If a stored token still validates (/auth/me), it is reused.
 * - Otherwise it signs in with the auto operator credentials
 *   (VITE_RC_USERNAME / VITE_RC_PASSWORD, default admin/admin123 — the
 *   seeded dev account, same as the original console).
 * - Returns null when the bridge is unreachable (offline demo mode).
 *
 * NOTE: default credentials are a dev convenience. For any shared/production
 * setup, set VITE_RC_USERNAME/VITE_RC_PASSWORD to a dedicated dispatcher
 * account and change the seeded admin password.
 */
export async function ensureOperatorSession(): Promise<OperatorSession | null> {
  const stored = getStoredSession();
  if (stored?.token) {
    try {
      const me = await fetch(`${BRIDGE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${stored.token}` },
      });
      if (me.ok) return stored;
    } catch {
      // Bridge unreachable — keep the stored session for later.
      return stored;
    }
    // Stored token is stale (backend sessions reset on server restart).
  }
  const username = import.meta.env.VITE_RC_USERNAME || 'admin';
  const password = import.meta.env.VITE_RC_PASSWORD || 'admin123';
  try {
    return await loginOperator(username, password);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Bridge event subscription (SSE + health poll)
// ---------------------------------------------------------------------------

export interface BridgeIncidentPayload {
  id: string;
  incidentCode: string;
  userName?: string;
  userPhone?: string;
  userProfile?: { username?: string; fullName?: string; avatar?: string };
  timeActivated?: string;
  date?: string;
  receivedAt?: string;
  status?: string;
  source?: string;
  notes?: string;
  location?: {
    address?: string;
    barangay?: string;
    city?: string;
    lat?: number;
    lng?: number;
    accuracyRadiusMeters?: number;
  };
  gpsStatus?: string;
  assignedResponder?: {
    id?: string;
    name?: string;
    unit?: string;
    role?: string;
    phone?: string;
    eta?: string;
    coordinates?: { lat: number; lng: number };
  };
  timeline?: { id?: string; title?: string; description?: string; status?: string; timestamp?: string }[];
}

export interface ResponseBridgeHandlers {
  onSOS?: (inc: BridgeIncidentPayload) => void;
  onHardwareSOS?: (inc: BridgeIncidentPayload) => void;
  onResolve?: (incidentCode: string) => void;
  onDelete?: (incidentId: string) => void;
  onAccountsUpdate?: () => void;
  onLocationUpdate?: (payload: { id: string; location?: BridgeIncidentPayload['location']; gpsStatus?: string }) => void;
  onOnlineChange?: (online: boolean) => void;
}

export function connectBridge(handlers: ResponseBridgeHandlers): () => void {
  let online = false;
  let stopped = false;

  const setOnline = (v: boolean) => {
    if (v !== online) {
      online = v;
      handlers.onOnlineChange?.(v);
    }
  };

  const token = getStoredSession()?.token || '';
  const es = new EventSource(`${BRIDGE_URL}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`);
  es.onopen = () => setOnline(true);
  es.onerror = () => setOnline(false); // EventSource auto-reconnects

  es.onmessage = (ev: MessageEvent) => {
    try {
      const msg = JSON.parse(ev.data);
      if (!msg) return;
      if (msg.source === 'citizen' && msg.type === 'sos' && handlers.onSOS) {
        handlers.onSOS(msg.payload);
      } else if (msg.source === 'hardware' && msg.type === 'hardware_sos' && handlers.onHardwareSOS) {
        handlers.onHardwareSOS(msg.payload);
      } else if (msg.source === 'citizen' && msg.type === 'resolve' && handlers.onResolve) {
        handlers.onResolve(String(msg.payload));
      } else if (msg.source === 'response' && msg.type === 'resolve' && handlers.onResolve) {
        handlers.onResolve(String(msg.payload));
      } else if (msg.source === 'server' && msg.type === 'incident_deleted' && handlers.onDelete) {
        handlers.onDelete(String(msg.payload?.id ?? ''));
      } else if (msg.source === 'server' && msg.type === 'accounts_update' && handlers.onAccountsUpdate) {
        handlers.onAccountsUpdate();
      } else if (msg.source === 'citizen' && msg.type === 'location_update' && handlers.onLocationUpdate) {
        handlers.onLocationUpdate({
          id: String(msg.payload?.id ?? ''),
          location: msg.payload?.location,
          gpsStatus: msg.payload?.gpsStatus,
        });
      }
    } catch {
      // ignore malformed frames
    }
  };

  const healthTimer = window.setInterval(async () => {
    if (stopped) return;
    try {
      const r = await fetch(`${BRIDGE_URL}/health`);
      setOnline(r.ok);
    } catch {
      setOnline(false);
    }
  }, 5000);

  return () => {
    stopped = true;
    window.clearInterval(healthTimer);
    es.close();
  };
}

/** Incidents persisted on the backend (newest first). Needs an operator session. */
export async function fetchBridgeIncidents(): Promise<BridgeIncidentPayload[]> {
  const res = await fetch(`${BRIDGE_URL}/incidents`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) throw new Error(`Bridge unreachable (GET /incidents → ${res.status})`);
  const data = await res.json();
  return Array.isArray(data?.incidents) ? data.incidents : [];
}

/** Logged-in Bayani App accounts currently online (from citizen heartbeats). */
export async function fetchOnlineAccounts(): Promise<{ count: number; accounts: string[] }> {
  const res = await fetch(`${BRIDGE_URL}/accounts`, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) throw new Error('UNAUTHORIZED');
  if (!res.ok) return { count: 0, accounts: [] };
  const data = await res.json();
  return {
    count: typeof data?.count === 'number' ? data.count : 0,
    accounts: Array.isArray(data?.accounts) ? data.accounts.map(String) : [],
  };
}

/** Broadcast a resolution so the citizen app clears the SOS too. */
export function emitResolve(incidentCode: string) {
  post({ source: 'response', type: 'resolve', payload: incidentCode });
}

/**
 * Push a responder status update to the citizen app
 * (WAIT FOR ME / ON THE WAY), persisted on the backend.
 * Unknown statuses are never sent — the server ignores them anyway.
 */
export function emitStatusUpdate(incident: { id: string; status: string }) {
  const ALLOWED = new Set([
    'ACTIVE',
    'WAIT FOR ME',
    'ON THE WAY',
    'RESPONDER EN ROUTE',
    'RESOLVED',
    'CANCELLED',
  ]);
  if (!incident?.id || !ALLOWED.has(incident.status)) return;
  post({ source: 'response', type: 'status_update', payload: incident });
}

/**
 * Permanently delete one incident on the backend (needs dispatcher/admin).
 * The server broadcasts `incident_deleted` so every console removes it too.
 */
export async function deleteBridgeIncident(id: string): Promise<void> {
  const res = await fetch(`${BRIDGE_URL}/incidents/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete incident (DELETE /incidents/${id} → ${res.status})`);
}

function post(msg: unknown) {
  try {
    fetch(`${BRIDGE_URL}/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(msg),
    }).catch(() => {});
  } catch {
    // offline — ignore
  }
}

// ---------------------------------------------------------------------------
// Mapping: bridge incident -> alert2 IncidentAlert
// ---------------------------------------------------------------------------

function inferCategory(payload: BridgeIncidentPayload): IncidentCategory {
  const text = `${payload.notes ?? ''} ${payload.location?.address ?? ''}`.toLowerCase();
  if (/fire|sunog|smoke|gas leak|burn/.test(text)) return 'FIRE';
  if (/flood|baha|water|rain|submerge/.test(text)) return 'FLOOD';
  if (/medical|chest|heart|ambulance|injur|bleed|breath|unconscious/.test(text)) return 'MEDICAL';
  if (/crime|police|pulis|assault|harass|threat|vawc|robber|snatch/.test(text)) return 'POLICE';
  if (/accident|collision|crash|bangga|vehicle|motor/.test(text)) return 'ACCIDENT';
  return 'RESCUE';
}

function mapStatus(status?: string): IncidentStatus {
  switch ((status ?? '').toUpperCase()) {
    case 'RESPONDING':
    case 'ON THE WAY':
    case 'RESPONDER EN ROUTE':
      return 'EN_ROUTE';
    case 'ON SCENE':
    case 'WAIT FOR ME':
      return 'ON_SCENE';
    case 'RESOLVED':
    case 'CANCELLED':
      return 'RESOLVED';
    default:
      return 'DISPATCHED';
  }
}

function mapResponder(
  raw: BridgeIncidentPayload['assignedResponder'],
  category: IncidentCategory
): ResponderUnit | undefined {
  if (!raw) return undefined;
  const etaMinutes = Math.max(1, parseInt(String(raw.eta ?? '3'), 10) || 3);
  return {
    id: raw.id ?? `bridge-${raw.unit ?? 'unit'}`,
    name: raw.name ?? 'Assigned Responder',
    role: raw.role ?? 'Responder',
    unitCode: raw.unit ?? 'UNIT-01',
    category,
    phone: raw.phone ?? '',
    avatar: '/logo.svg',
    status: 'RESPONDING',
    distanceKm: 1.2,
    etaMinutes,
    coordinates: raw.coordinates ?? { lat: 14.6507, lng: 121.0498 },
    resolvedCount: 0,
  };
}

export function mapBridgeIncident(payload: BridgeIncidentPayload): IncidentAlert {
  const category = inferCategory(payload);
  const name =
    payload.userProfile?.fullName ||
    payload.userName ||
    payload.userProfile?.username ||
    'Unknown Citizen';
  const loc = payload.location ?? {};
  const timestampMs = payload.receivedAt ? Date.parse(payload.receivedAt) : Date.now();

  return {
    id: payload.id || `bridge-${Date.now()}`,
    incidentCode: payload.incidentCode || 'BAY-0000',
    citizenName: name,
    citizenPhone: payload.userPhone ?? '',
    citizenAvatar: payload.userProfile?.avatar,
    category,
    title: `Emergency SOS from ${name}`,
    description:
      payload.notes ||
      `Live SOS raised via SINAG (${payload.source === 'HARDWARE' ? 'wearable device' : 'mobile app'}). ${payload.gpsStatus ?? ''}`.trim(),
    priority: 'CRITICAL',
    status: mapStatus(payload.status),
    date: payload.date || new Date(timestampMs).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: payload.timeActivated || new Date(timestampMs).toLocaleTimeString(),
    timestampMs: Number.isFinite(timestampMs) ? timestampMs : Date.now(),
    responseTimeMs: 380,
    location: {
      address: loc.address ?? 'Unknown address',
      barangay: loc.barangay ?? 'Unknown barangay',
      city: loc.city ?? 'Quezon City',
      lat: typeof loc.lat === 'number' ? loc.lat : 14.6507,
      lng: typeof loc.lng === 'number' ? loc.lng : 121.0498,
      accuracyRadiusMeters: loc.accuracyRadiusMeters ?? 5,
    },
    assignedResponder: mapResponder(payload.assignedResponder, category),
    timeline: (payload.timeline ?? []).map((step, idx) => ({
      timeOffsetMs: idx * 120,
      label: step.title || `Update ${idx + 1}`,
      detail: step.description || '',
      timestamp: step.timestamp || '',
      completed: step.status === 'completed',
    })),
  };
}
