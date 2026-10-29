import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  X, 
  HeartPulse, 
  Flame, 
  CloudRain, 
  Car, 
  Radio, 
  Zap, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { IncidentCategory, IncidentAlert, ResponderUnit } from '../types';
import { soundEffects } from '../services/soundEffects';
import { pushService } from '../services/pushNotificationService';
import { INITIAL_RESPONDERS, CITIZEN_USER } from '../data/mockData';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewIncidentDispatched: (incident: IncidentAlert) => void;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  onNewIncidentDispatched,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('MEDICAL');
  const [countdown, setCountdown] = useState<number>(3);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);

  const categories: { type: IncidentCategory; label: string; icon: React.ElementType; sub: string }[] = [
    { type: 'MEDICAL', label: 'Medical / Trauma', icon: HeartPulse, sub: 'Ambulance / EMT' },
    { type: 'FIRE', label: 'Fire / Gas Leak', icon: Flame, sub: 'BFP Fire Brigade' },
    { type: 'FLOOD', label: 'Flood / Calamity', icon: CloudRain, sub: 'DRRMC Rescue Boat' },
    { type: 'POLICE', label: 'Crime / Security', icon: ShieldAlert, sub: 'PNP Patrol Police' },
    { type: 'ACCIDENT', label: 'Accident / Collision', icon: Car, sub: 'Traffic & First Aid' },
  ];

  // Abort countdown timer
  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setIsDispatched(false);
      setElapsedMs(0);
      setActiveStep(0);
      return;
    }

    if (countdown > 0 && !isDispatched) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isDispatched) {
      executeRapidDispatch();
    }
  }, [isOpen, countdown, isDispatched]);

  const executeRapidDispatch = () => {
    setIsDispatched(true);
    soundEffects.playEmergencySiren(2.0);

    const startTime = performance.now();
    const interval = setInterval(() => {
      const current = Math.round(performance.now() - startTime);
      setElapsedMs(current);
      if (current > 120) setActiveStep(1);
      if (current > 240) setActiveStep(2);
      if (current > 380) {
        setActiveStep(3);
        clearInterval(interval);
      }
    }, 30);

    const assigned: ResponderUnit = INITIAL_RESPONDERS.find(r => r.category === selectedCategory) || INITIAL_RESPONDERS[0];

    const newIncident: IncidentAlert = {
      id: 'inc-' + Date.now(),
      incidentCode: 'BAY-' + Math.floor(1000 + Math.random() * 9000),
      citizenName: CITIZEN_USER.name,
      citizenPhone: CITIZEN_USER.phone,
      citizenAvatar: CITIZEN_USER.avatar,
      category: selectedCategory,
      title: `Emergency ${selectedCategory} Alert Triggered`,
      description: `Rapid citizen distress beacon raised from ${CITIZEN_USER.barangay}. High priority dispatch.`,
      priority: 'CRITICAL',
      status: 'EN_ROUTE',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      timestampMs: Date.now(),
      responseTimeMs: 382,
      location: {
        address: '74 Malakas St., Diliman',
        barangay: 'Brgy. Central',
        city: 'Quezon City',
        lat: 14.6507 + (Math.random() - 0.5) * 0.005,
        lng: 121.0498 + (Math.random() - 0.5) * 0.005,
        accuracyRadiusMeters: 3.8,
        altitude: 44,
        speed: 0,
        heading: 90,
      },
      assignedResponder: assigned,
      timeline: [
        {
          timeOffsetMs: 40,
          label: 'SOS Signal Transmitted',
          detail: 'Rapid button pressed by citizen',
          timestamp: new Date().toLocaleTimeString(),
          completed: true,
        },
        {
          timeOffsetMs: 140,
          label: 'GPS Coordinates Locked',
          detail: 'High-precision fix ±3.8m',
          timestamp: new Date().toLocaleTimeString(),
          completed: true,
        },
        {
          timeOffsetMs: 280,
          label: 'Central Dispatch Command Acknowledged',
          detail: 'Nearest unit designated',
          timestamp: new Date().toLocaleTimeString(),
          completed: true,
        },
        {
          timeOffsetMs: 382,
          label: `${assigned.unitCode} En Route`,
          detail: `${assigned.name} deployed. ETA ~${assigned.etaMinutes} mins`,
          timestamp: new Date().toLocaleTimeString(),
          completed: true,
        },
      ],
    };

    onNewIncidentDispatched(newIncident);

    // Send push notification
    pushService.sendPushAlert(
      `🚨 EMERGENCY SOS: ${selectedCategory} IN BRGY. CENTRAL`,
      `Unit ${assigned.unitCode} dispatched in 0.38s. ETA: ${assigned.etaMinutes} mins. Tracking beacon active.`,
      'SOS_DISPATCH',
      newIncident.id
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-[#141026] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-purple-200 dark:border-[#272044] shadow-2xl relative overflow-hidden text-slate-900 dark:text-white">
        
        {/* Subtle Purple Background Glow */}
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Close Button */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Rapid Emergency SOS</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sub-second automated dispatch pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isDispatched ? (
          <div>
            {/* Category Selector */}
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Select Emergency Type (Category):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.type;
                return (
                  <button
                    key={cat.type}
                    onClick={() => setSelectedCategory(cat.type)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]'
                        : 'bg-purple-50/50 dark:bg-[#1C1635] border-purple-100 dark:border-purple-900/40 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <div className="font-bold text-xs leading-tight">{cat.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                      {cat.sub}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Countdown Banner */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-center mb-6">
              <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                Auto-dispatching in <strong className="font-mono text-lg font-bold text-purple-700 dark:text-purple-200">{countdown}s</strong>...
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Press the instant trigger or cancel if pressed accidentally.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRapidDispatch}
                className="py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/40 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>DISPATCH NOW</span>
              </button>
            </div>
          </div>
        ) : (
          /* Execution & Sub-Second Latency Progress State */
          <div>
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3 border border-purple-500/30">
                <Zap className="w-8 h-8 fill-purple-600 dark:fill-purple-400 animate-bounce" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Emergency Alert Dispatched!
              </h4>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono mt-1">
                Sub-Second Pipeline Latency: <strong>{elapsedMs}ms</strong>
              </p>
            </div>

            {/* Real-time Sub-Second Execution Steps */}
            <div className="space-y-2.5 my-4 p-4 rounded-2xl bg-purple-50/60 dark:bg-[#1A1433] border border-purple-100 dark:border-purple-900/40 text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>T+0.04s SOS Signal Captured</span>
                </span>
                <span className="font-bold">OK</span>
              </div>
              <div className={`flex items-center justify-between ${activeStep >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>T+0.14s GPS Fix Locked (±3.8m)</span>
                </span>
                <span className="font-bold">{activeStep >= 1 ? 'OK' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${activeStep >= 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>T+0.28s Local Command Center Acknowledged</span>
                </span>
                <span className="font-bold">{activeStep >= 2 ? 'OK' : '...'}</span>
              </div>
              <div className={`flex items-center justify-between ${activeStep >= 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>T+0.38s Push Notifications Broadcasted</span>
                </span>
                <span className="font-bold">{activeStep >= 3 ? 'OK' : '...'}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
            >
              Close & Track on Live Map
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
