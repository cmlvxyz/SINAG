import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  ShieldAlert, 
  CheckCheck, 
  Trash2, 
  Radio, 
  Send, 
  Volume2, 
  AlertTriangle 
} from 'lucide-react';
import { PushNotificationItem } from '../types';
import { pushService } from '../services/pushNotificationService';
import { soundEffects } from '../services/soundEffects';

interface PushNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectIncident?: (incidentId?: string) => void;
}

export const PushNotificationDrawer: React.FC<PushNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectIncident,
}) => {
  const [permissionStatus, setPermissionStatus] = useState<string>(pushService.getPermissionStatus());
  const [simTitle, setSimTitle] = useState('NDRRMC / PAGASA Heavy Rainfall Warning');
  const [simBody, setSimBody] = useState('Orange Rainfall advisory hoisted for Metro Manila. Rapid response teams on standby.');

  const handleRequestPermission = async () => {
    const perm = await pushService.requestPermission();
    setPermissionStatus(perm);
    if (perm === 'granted') {
      pushService.sendPushAlert(
        '🔔 PUSH NOTIFICATIONS ENABLED',
        'SINAG will now deliver real-time emergency dispatch warnings.',
        'SYSTEM'
      );
    }
  };

  const handleDispatchSimulation = () => {
    pushService.sendPushAlert(simTitle, simBody, 'CALAMITY_BROADCAST');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#141026] p-6 shadow-2xl border-l border-purple-200 dark:border-[#272044] flex flex-col justify-between text-slate-900 dark:text-white transition-colors duration-200">
          
          {/* Drawer Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-purple-100 dark:border-[#272044]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Push Notification Center</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time emergency broadcast pipeline
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Browser Permission Prompt Banner */}
            <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/80 dark:bg-[#1C1635] border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  Web Push Alerts: {permissionStatus.toUpperCase()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {permissionStatus === 'granted'
                    ? 'Ready to receive alerts even when minimized.'
                    : 'Allow permissions for fast push notifications.'}
                </p>
              </div>
              {permissionStatus !== 'granted' && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold whitespace-nowrap shadow-sm shadow-purple-600/30"
                >
                  Enable
                </button>
              )}
            </div>

            {/* Quick Simulation Testing Box */}
            <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/40 dark:bg-[#18132D] border border-purple-100 dark:border-[#282144]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Test Push Alert Broadcast
                </span>
                <button
                  onClick={handleDispatchSimulation}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Test</span>
                </button>
              </div>
              <input
                type="text"
                value={simTitle}
                onChange={(e) => setSimTitle(e.target.value)}
                placeholder="Alert Title"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 mb-1.5"
              />
              <textarea
                value={simBody}
                onChange={(e) => setSimBody(e.target.value)}
                placeholder="Alert Message Body"
                rows={2}
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 resize-none"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between mt-4 px-1 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Alert History ({notifications.length})
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onMarkAllAsRead}
                  className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark All Read</span>
                </button>
                <button
                  onClick={onClearAll}
                  className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Scroll List */}
          <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No alerts at the moment
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.incidentId) {
                      onClose();
                      onSelectIncident?.(n.incidentId);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-purple-50/60 dark:bg-[#1C1635] border-purple-200 dark:border-purple-800/60'
                      : 'bg-white dark:bg-[#161228] border-purple-100/40 dark:border-[#221B3B] opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      {n.timestamp}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                    {n.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-purple-100 dark:border-[#272044] text-center">
            <button
              onClick={() => soundEffects.playPushAlertPing()}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Test Push Alert Sound Tone</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
