import React from 'react';
import { 
  LayoutGrid, 
  Activity, 
  MapPin, 
  ClipboardList, 
  Shield, 
  Radio, 
  BarChart2, 
  Settings, 
  LogOut,
  AlertTriangle
} from 'lucide-react';

interface SidebarDockProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSosModal: () => void;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeTab,
  onSelectTab,
  onOpenSosModal,
}) => {
  return (
    <aside className="hidden lg:flex flex-col items-center gap-4 py-1 self-start sticky top-24 z-30">
      
      {/* ISLAND 1: TOP VERTICAL CAPSULE PILL (Exactly matching Image 2 top pill) */}
      <div className="w-14 bg-white dark:bg-[#140F28] rounded-full p-2 py-2.5 flex flex-col items-center gap-3.5 shadow-sm border border-[#EBE6F5] dark:border-[#241C3F] transition-colors">
        
        {/* Top Active Circle Button with 4 Grid Dots (Exact match to green 4-dot circle in image) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          title="Dashboard"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer relative group ${
            activeTab === 'dashboard'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 hover:bg-purple-600 hover:text-white'
          }`}
        >
          <LayoutGrid className="w-5 h-5 fill-current" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Dashboard
          </span>
        </button>

        {/* Minimalist Outline Icon 2: Activity / Chart */}
        <button
          onClick={() => onSelectTab('incidents')}
          title="Live Incidents"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative group ${
            activeTab === 'incidents'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Activity className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Live Incidents
          </span>
        </button>

        {/* Minimalist Outline Icon 3: MapPin / GPS */}
        <button
          onClick={() => onSelectTab('gps')}
          title="Live Victim Map"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative group ${
            activeTab === 'gps'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <MapPin className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Live Map
          </span>
        </button>

        {/* Minimalist Outline Icon 4: Clipboard Logs */}
        <button
          onClick={() => onSelectTab('incidents')}
          title="Dispatch Logs"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer relative group"
        >
          <ClipboardList className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Dispatch History
          </span>
        </button>

      </div>

      {/* ISLAND 2: MIDDLE VERTICAL CAPSULE PILL (Exactly matching Image 2 middle pill) */}
      <div className="w-14 bg-white dark:bg-[#140F28] rounded-full p-2 py-4 flex flex-col items-center gap-3.5 shadow-sm border border-[#EBE6F5] dark:border-[#241C3F] transition-colors">
        
        {/* Minimalist Outline Icon 5: Shield / Responders */}
        <button
          onClick={() => onSelectTab('responders')}
          title="SINAG Responders"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative group ${
            activeTab === 'responders'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Responders
          </span>
        </button>

        {/* Minimalist Outline Icon 6: Radio / Broadcasts */}
        <button
          onClick={() => onSelectTab('broadcasts')}
          title="Broadcasts & Public Warning"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative group ${
            activeTab === 'broadcasts'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Radio className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Broadcast Alerts
          </span>
        </button>

        {/* Minimalist Outline Icon 7: Analytics */}
        <button
          onClick={() => onSelectTab('analytics')}
          title="Response Analytics"
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer relative group ${
            activeTab === 'analytics'
              ? 'text-purple-600 dark:text-purple-400 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Response Velocity
          </span>
        </button>

      </div>

      {/* ISLAND 3: BOTTOM VERTICAL CAPSULE PILL (Exactly matching Image 2 bottom pill) */}
      <div className="w-14 bg-white dark:bg-[#140F28] rounded-full p-2 py-3 flex flex-col items-center gap-3.5 shadow-sm border border-[#EBE6F5] dark:border-[#241C3F] transition-colors">
        
        {/* Settings Gear (Exact match to bottom gear in image) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          title="Settings"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer relative group"
        >
          <Settings className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Settings
          </span>
        </button>

        {/* LogOut / Emergency SOS Action (Exact match to bottom exit icon in image) */}
        <button
          onClick={onOpenSosModal}
          title="Rapid SOS Trigger"
          className="w-9 h-9 rounded-full flex items-center justify-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer relative group"
        >
          <LogOut className="w-5 h-5 stroke-[1.75]" />
          <span className="absolute left-16 px-2.5 py-1 rounded-lg bg-purple-900 text-white text-[11px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
            Rapid SOS
          </span>
        </button>

      </div>

    </aside>
  );
};
