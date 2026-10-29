import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Filter, 
  ChevronDown, 
  ShieldAlert, 
  Radio, 
  Activity, 
  Users, 
  BellRing, 
  BarChart3, 
  AlertTriangle,
  Zap,
  Sparkles
} from 'lucide-react';

import { TopNavbar } from './components/TopNavbar';
import { SidebarDock } from './components/SidebarDock';
import { CardRapidDispatch } from './components/CardRapidDispatch';
import { CardAlertDistribution } from './components/CardAlertDistribution';
import { CardReadinessScore } from './components/CardReadinessScore';
import { LiveIncidentTable } from './components/LiveIncidentTable';
import { LiveLocationTracker } from './components/LiveLocationTracker';
import { OnDutyResponders } from './components/OnDutyResponders';
import { ActiveEmergencies } from './components/ActiveEmergencies';
import { ResolvedIncidents } from './components/ResolvedIncidents';
import { IncidentArchive } from './components/IncidentArchive';
import { EmergencySosModal } from './components/EmergencySosModal';
import { PushNotificationDrawer } from './components/PushNotificationDrawer';
import { PushToastStack } from './components/PushToastStack';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';

import { 
  IncidentAlert, 
  PushNotificationItem, 
  ResponderUnit 
} from './types';
import { 
  INITIAL_INCIDENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_RESPONDERS, 
  CITIZEN_USER 
} from './data/mockData';
import { pushService } from './services/pushNotificationService';
import { soundEffects } from './services/soundEffects';
import {
  connectBridge,
  deleteBridgeIncident,
  emitResolve as emitBridgeResolve,
  emitStatusUpdate as emitBridgeStatusUpdate,
  ensureOperatorSession,
  fetchBridgeIncidents,
  fetchOnlineAccounts,
  getStoredSession,
  loginOperator,
  logoutOperator,
  mapBridgeIncident,
  BridgeIncidentPayload,
} from './services/bridgeClient';
import type { OperatorSession } from './components/TopNavbar';

export default function App() {
  // Theme & Sound state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(soundEffects.isMuted);

  // App Navigation & Modals state
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentAlert | null>(null);

  // Live Data state
  const [incidents, setIncidents] = useState<IncidentAlert[]>(INITIAL_INCIDENTS);
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [toasts, setToasts] = useState<PushNotificationItem[]>([]);
  const [activeIncidentForGps, setActiveIncidentForGps] = useState<IncidentAlert | null>(INITIAL_INCIDENTS[0]);

  // Bridge (Bayani App backend) state — mirrors the original Bayani Alert console
  const [session, setSession] = useState<OperatorSession | null>(() => getStoredSession());
  const [bridgeOnline, setBridgeOnline] = useState<boolean>(false);
  const [onlineAccounts, setOnlineAccounts] = useState<{ count: number; accounts: string[] }>({ count: 0, accounts: [] });
  // Ids that are known to exist on the bridge (live SOS + initial fetch).
  // Status updates are only pushed for these, so local demo incidents
  // never write ghost rows to the backend.
  const bridgeIds = useRef<Set<string>>(new Set());

  // Synchronize Dark Mode with Document Element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auto operator session on startup so Bayani App SOS frames arrive
  // without manual sign-in (falls back to offline demo mode).
  useEffect(() => {
    let cancelled = false;
    ensureOperatorSession()
      .then((s) => {
        if (!cancelled && s) {
          setSession((prev) => (prev?.token === s.token ? prev : s));
        }
      })
      .catch(() => {
        // Bridge offline — stay in demo mode.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Push notification subscription
  useEffect(() => {    const unsubscribe = pushService.subscribe((newItem) => {
      setNotifications((prev) => [newItem, ...prev]);
      setToasts((prev) => [newItem, ...prev.slice(0, 3)]);

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newItem.id));
      }, 6000);
    });

    return () => unsubscribe();
  }, []);

  // Bayani App bridge: live SOS + resolve + online citizen accounts.
  // Reconnects whenever the operator session changes (the stream carries the
  // session token so the backend can deliver the sensitive SOS frames).
  useEffect(() => {
    const handleBridgeSOS = (payload: BridgeIncidentPayload) => {
      const mapped = mapBridgeIncident(payload);
      bridgeIds.current.add(mapped.id);
      setIncidents((prev) => {
        if (prev.some((i) => i.id === mapped.id)) {
          return prev.map((i) => (i.id === mapped.id ? mapped : i));
        }
        return [mapped, ...prev];
      });
      setActiveIncidentForGps(mapped);
      pushService.sendPushAlert(
        `🚨 LIVE SOS: ${mapped.category} — ${mapped.location.barangay}`,
        `${mapped.citizenName} needs help at ${mapped.location.address}. Tracking beacon active.`,
        'SOS_DISPATCH',
        mapped.id
      );
    };

    const refreshOnlineAccounts = async () => {
      try {
        const info = await fetchOnlineAccounts();
        setOnlineAccounts(info);
      } catch {
        // Unauthorized or bridge offline — keep the last known value.
      }
    };

    const disconnect = connectBridge({
      onSOS: handleBridgeSOS,
      onHardwareSOS: handleBridgeSOS,
      onResolve: (incidentCode) => {
        setIncidents((prev) =>
          prev.map((inc) => (inc.incidentCode === incidentCode ? { ...inc, status: 'RESOLVED' } : inc))
        );
      },
      onDelete: (incidentId) => {
        bridgeIds.current.delete(incidentId);
        setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId));
      },
      onLocationUpdate: ({ id, location, gpsStatus }) => {
        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === id
              ? {
                  ...inc,
                  location: {
                    ...inc.location,
                    address: location?.address ?? inc.location.address,
                    barangay: location?.barangay ?? inc.location.barangay,
                    city: location?.city ?? inc.location.city,
                    lat: location?.lat ?? inc.location.lat,
                    lng: location?.lng ?? inc.location.lng,
                    accuracyRadiusMeters: location?.accuracyRadiusMeters ?? inc.location.accuracyRadiusMeters,
                  },
                  description: gpsStatus ? `${inc.description} (GPS: ${gpsStatus})` : inc.description,
                }
              : inc
          )
        );
      },
      onAccountsUpdate: () => void refreshOnlineAccounts(),
      onOnlineChange: setBridgeOnline,
    });

    // Initial load of persisted bridge incidents (needs operator session,
    // otherwise the backend answers 401 and we keep the local demo data).
    if (session?.token) {
      fetchBridgeIncidents()
        .then((rows) => {
          if (rows.length > 0) {
            const mapped = rows.map(mapBridgeIncident);
            mapped.forEach((m) => bridgeIds.current.add(m.id));
            setIncidents(mapped);
            setActiveIncidentForGps(mapped[0]);
          }
        })
        .catch(() => {
          // Bridge offline or unauthorized — keep local demo data.
        });
      void refreshOnlineAccounts();
      const pollId = window.setInterval(() => void refreshOnlineAccounts(), 5000);
      return () => {
        window.clearInterval(pollId);
        disconnect();
      };
    }

    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token]);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setSoundMuted(muted);
  };

  const handleNewIncident = (incident: IncidentAlert) => {
    setIncidents((prev) => [incident, ...prev]);
    setActiveIncidentForGps(incident);
  };

  const handleUpdateStatus = (incidentId: string, newStatus: IncidentAlert['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    // Sync back to the Bayani App backend so the citizen sees the update.
    // Only for incidents known to exist on the bridge (never demo rows).
    if (bridgeOnline && bridgeIds.current.has(incidentId)) {
      const target = incidents.find((inc) => inc.id === incidentId);
      if (newStatus === 'RESOLVED') {
        if (target) emitBridgeResolve(target.incidentCode);
      } else {
        const LOCAL_TO_BRIDGE: Record<IncidentAlert['status'], string> = {
          DISPATCHED: 'ACTIVE',
          EN_ROUTE: 'ON THE WAY',
          ON_SCENE: 'WAIT FOR ME',
          RESOLVED: 'RESOLVED',
        };
        emitBridgeStatusUpdate({ id: incidentId, status: LOCAL_TO_BRIDGE[newStatus] });
      }
    }
  };

  const handleOperatorLogin = async (username: string, password: string) => {
    const s = await loginOperator(username, password);
    setSession(s);
  };

  const handleOperatorLogout = () => {
    void logoutOperator();
    setSession(null);
    setOnlineAccounts({ count: 0, accounts: [] });
  };

  const handleDeleteIncident = (incidentId: string) => {
    bridgeIds.current.delete(incidentId);
    setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId));
    if (selectedIncident?.id === incidentId) setSelectedIncident(null);
    if (activeIncidentForGps?.id === incidentId) setActiveIncidentForGps(null);
    if (bridgeOnline) {
      void deleteBridgeIncident(incidentId).catch(() => {
        // Bridge rejected or offline — local removal already done.
      });
    }
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8F6FC] dark:bg-[#0B0914] text-[#1E192B] dark:text-[#F3EEFF] transition-colors duration-200">
      
      {/* Top Bar Contract (Wordmark - Navigation - Affordances) */}
      <TopNavbar
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenSosModal={() => setIsSosModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        soundMuted={soundMuted}
        onToggleSound={handleToggleSound}
        session={session}
        onLogin={handleOperatorLogin}
        onLogout={handleOperatorLogout}
      />

      {/* Main Layout Container */}
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-10 flex items-start gap-6">
        
        {/* Left Side Minimalist Floating Dock (Mirroring Reference Design) */}
        <SidebarDock
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSosModal={() => setIsSosModalOpen(true)}
        />

        {/* Center/Right Dynamic Viewport */}
        <main className="flex-1 min-w-0">
          
          {/* Hero Greeting Section (Matching "Welcome Back, Sujon" in the reference image) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  DASHBOARD
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  All Systems Armed
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Real-Time Citizen Protection & Sub-Second Emergency Dispatch Console
              </p>
            </div>

            {/* Quick Actions (Date filter + Primary Emergency Alert Trigger) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Online citizen users (mirrors the original Bayani Alert KPI) */}
              <div
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#141026] border border-[#E9E3F5] dark:border-[#272044] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm"
                title={
                  bridgeOnline
                    ? `Online SINAG users: ${onlineAccounts.accounts.join(', ') || 'none'}`
                    : 'Bridge offline — start the SINAG backend (port 8000) and sign in as operator'
                }
              >
                <span className="relative flex h-2 w-2">
                  {onlineAccounts.count > 0 && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${onlineAccounts.count > 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                </span>
                <span className="tabular-nums">
                  {onlineAccounts.count} Online{session ? '' : ' · Demo'}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#141026] border border-[#E9E3F5] dark:border-[#272044] text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="tabular-nums">16 Oct, 2026 - Live Feed</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>

            </div>
          </div>

          {/* TAB: DASHBOARD VIEW (Default layout matching uploaded image) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">

              {/* ACTIVE + RESOLVED ROW (one row, two columns) */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ACTIVE EMERGENCIES (live SOS signals needing response) */}
                <ActiveEmergencies
                  incidents={incidents}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                  onTrackIncidentGps={(inc) => {
                    setActiveIncidentForGps(inc);
                    // Scroll to GPS radar widget on mobile
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  onUpdateStatus={handleUpdateStatus}
                />

                {/* RESOLVED INCIDENTS (closed case history) */}
                <ResolvedIncidents
                  incidents={incidents}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                />
              </div>

              {/* TOP 3 CARDS ROW (Mirroring the 3 cards in reference image) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Card 1: Rapid Dispatch Ready (Like VISA Card in image) */}
                <CardRapidDispatch
                  onTriggerSos={() => setIsSosModalOpen(true)}
                  gpsAccuracy={3.8}
                />

                {/* Card 2: Engagement / Alert Volume Bar Chart (Like Middle Card in image) */}
                <CardAlertDistribution />

                {/* Card 3: Readiness Score & Fleet Sparkline (Like Right Card in image) */}
                <CardReadinessScore
                  onOpenSos={() => setIsSosModalOpen(true)}
                  onTestPush={() => {
                    pushService.sendPushAlert(
                      '🚨 DRILL ALERT: HIGH-PRIORITY EMERGENCY PUSH',
                      'BDRRMC Rapid Team deployed for flood surge response in Sector 4. Sub-second dispatch test verified.',
                      'SOS_DISPATCH'
                    );
                  }}
                />

              </div>

              {/* LOWER SECTION: 2-COLUMN SPLIT (Matching Payment History + Right Cards) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left/Center (2 Columns wide): Live Incident Table */}
                <div className="xl:col-span-2">
                  <LiveIncidentTable
                    incidents={incidents}
                    onSelectIncident={(inc) => setSelectedIncident(inc)}
                    onTrackIncidentGps={(inc) => {
                      setActiveIncidentForGps(inc);
                      // Scroll to GPS radar widget on mobile
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                  />
                </div>

                {/* Right Column (1 Column wide): Live Victim Location + On-Duty Responders */}
                <div className="space-y-6">

                  {/* Live Google Map + Street View of the SOS location */}
                  <LiveLocationTracker
                    activeIncident={activeIncidentForGps}
                  />

                  {/* On-Duty Bayani Responders (Avatar Row like Mandatory Payments in image) */}
                  <OnDutyResponders
                    onSelectResponder={(resp) => {
                      soundEffects.playDispatchPing();
                      pushService.sendPushAlert(
                        `📻 RADIO LINK: ${resp.unitCode}`,
                        `Direct frequency open with ${resp.name} (${resp.role}). Ready for voice relay.`,
                        'SYSTEM'
                      );
                    }}
                  />

                </div>

              </div>

            </div>
          )}

          {/* TAB: LIVE INCIDENTS VIEW (mirrors the original Bayani Alert archive) */}
          {activeTab === 'incidents' && (
            <IncidentArchive
              incidents={incidents}
              onOpenDetails={(inc) => setSelectedIncident(inc)}
              onTrackIncidentGps={(inc) => {
                setActiveIncidentForGps(inc);
                setActiveTab('gps');
              }}
              onUpdateStatus={handleUpdateStatus}
              onDeleteIncident={handleDeleteIncident}
              onNewSos={() => setIsSosModalOpen(true)}
            />
          )}

          {/* TAB: LIVE MAP FULL VIEW */}
          {activeTab === 'gps' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <LiveLocationTracker activeIncident={activeIncidentForGps} />
                </div>
                <div>
                  <OnDutyResponders
                    onSelectResponder={(resp) => {
                      soundEffects.playDispatchPing();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: RESPONDERS FLEET */}
          {activeTab === 'responders' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <OnDutyResponders />
                <CardReadinessScore
                  onOpenSos={() => setIsSosModalOpen(true)}
                  onTestPush={() => {
                    pushService.sendPushAlert(
                      '📻 ALL-HANDS FLEET CHECK',
                      'Testing multi-channel VHF radio relay across Quezon City responder teams.',
                      'SYSTEM'
                    );
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB: BROADCASTS & NOTIFICATIONS */}
          {activeTab === 'broadcasts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#141026] rounded-3xl p-6 border border-[#E9E3F5] dark:border-[#272044] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Disaster Alerts & Public Broadcasts
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      PAGASA, NDRRMC, and Local Barangay Warning Feeds
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      pushService.sendPushAlert(
                        '🌊 FLOOD LEVEL ALERT: BRGY. BAGONG SILANGAN',
                        'Water level at Marikina river tributary reached 16.5m. Pre-emptive evacuation advised.',
                        'CALAMITY_BROADCAST'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>Broadcast Warning</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-4 rounded-2xl bg-purple-50/50 dark:bg-[#18132D] border border-purple-100 dark:border-[#272044] flex items-start justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {notif.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardAlertDistribution />
                <CardRapidDispatch onTriggerSos={() => setIsSosModalOpen(true)} />
              </div>
            </div>
          )}

        </main>

      </div>

      {/* Floating Push Notification Toast Stack */}
      <PushToastStack
        toasts={toasts}
        onDismiss={handleDismissToast}
        onOpenIncident={(incId) => {
          const found = incidents.find((i) => i.id === incId);
          if (found) {
            setSelectedIncident(found);
            setActiveIncidentForGps(found);
          }
        }}
      />

      {/* Mobile Floating Pill Dock (for screens below lg) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-[#140F28]/95 backdrop-blur-md px-3 py-2 rounded-full border border-purple-200/60 dark:border-[#241C3F] shadow-xl flex items-center gap-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-colors ${
            activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <Activity className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-colors ${
            activeTab === 'incidents' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActiveTab('gps')}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-colors ${
            activeTab === 'gps' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500'
          }`}
        >
          <Radio className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsSosModalOpen(true)}
          className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md animate-pulse"
        >
          <Zap className="w-4 h-4" />
        </button>
      </div>

      {/* Slide-out Push Notification Drawer */}
      <PushNotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllRead}
        onClearAll={handleClearNotifications}
        onSelectIncident={(incId) => {
          const found = incidents.find((i) => i.id === incId);
          if (found) {
            setSelectedIncident(found);
            setActiveIncidentForGps(found);
          }
        }}
      />

      {/* Rapid Emergency SOS Modal */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onNewIncidentDispatched={handleNewIncident}
      />

      {/* Incident Details & Timeline Log Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdateStatus={handleUpdateStatus}
        onTrackOnRadar={(inc) => {
          setActiveIncidentForGps(inc);
          setActiveTab('dashboard');
        }}
      />

    </div>
  );
}
