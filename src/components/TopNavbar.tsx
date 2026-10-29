import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { CITIZEN_USER } from '../data/mockData';

export interface OperatorSession {
  token: string;
  username: string;
  role: string;
}

interface TopNavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenSosModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  session: OperatorSession | null;
  onLogin: (username: string, password: string) => Promise<void>;
  onLogout: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  unreadCount,
  onOpenNotifications,
  onOpenSosModal,
  activeTab,
  onSelectTab,
  soundMuted,
  onToggleSound,
  session,
  onLogin,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'gps', label: 'Live Map' },
    { id: 'responders', label: 'Responders' },
    { id: 'broadcasts', label: 'Broadcasts' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginBusy) return;
    setLoginError(null);
    setLoginBusy(true);
    try {
      await onLogin(username.trim(), password);
      setUsername('');
      setPassword('');
      setMenuOpen(false);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoginBusy(false);
    }
  };

  return (
    <header className="sticky top-1 sm:top-2 z-40 w-full px-4 sm:px-6 lg:px-8 mb-1">
      {/* Outer Floating Rounded Capsule Pill Header (Matching uploaded image exactly) */}
      <div className="max-w-[1520px] mx-auto bg-white/95 dark:bg-[#140F28]/95 backdrop-blur-md rounded-full px-5 sm:px-7 py-2 sm:py-2.5 shadow-sm border border-[#EBE6F5] dark:border-[#241C3F] flex items-center justify-between gap-4 transition-colors duration-200">

        {/* Left: Brand Logo & Wordmark (Matching logo style in reference) */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/bayani-logo.png"
            alt="SINAG logo"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.src.endsWith('/logo.svg')) img.src = '/logo.svg';
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain bg-white shadow-md shadow-purple-600/20 ring-1 ring-purple-200/60 dark:ring-purple-800/40"
          />
          <button
            onClick={() => onSelectTab('dashboard')}
            className="text-left cursor-pointer focus:outline-none flex items-center"
          >
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SINAG
            </span>
          </button>
        </div>

        {/* Center: Inner Capsule Navigation Pill Container (Exact match to middle pill in reference) */}
        <nav className="hidden md:flex items-center">
          <div className="bg-[#F2EEFA] dark:bg-[#1C1635] p-1 rounded-full border border-purple-200/50 dark:border-purple-800/40 shadow-xs flex items-center gap-1">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-purple-600 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Right: Minimalist Circular Action Icons & Profile (Matching right cluster in reference) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundMuted ? "Unmute Sound" : "Mute Sound"}
            className="w-8 h-8 rounded-full bg-[#F2EEFA] dark:bg-[#1C1635] text-slate-600 dark:text-slate-300 hover:text-purple-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="w-8 h-8 rounded-full bg-[#F2EEFA] dark:bg-[#1C1635] text-slate-600 dark:text-slate-300 hover:text-purple-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-700" />}
          </button>

          {/* Push Notification Bell with unread indicator */}
          <button
            onClick={onOpenNotifications}
            className="relative w-8 h-8 rounded-full bg-[#F2EEFA] dark:bg-[#1C1635] text-slate-600 dark:text-slate-300 hover:text-purple-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-purple-600 rounded-full ring-2 ring-white dark:ring-[#140F28]" />
            )}
          </button>

          {/* Operator profile / sign-in (avatar dropdown) */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 pl-1 cursor-pointer"
              title={session ? `Signed in as ${session.username}` : 'Operator sign in'}
            >
              <span className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold ring-2 ring-purple-600/30">
                  OP
                </div>
                <span
                  className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#140F28] ${session ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                />
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 z-50 rounded-2xl bg-white dark:bg-[#1C1635] border border-[#EBE6F5] dark:border-[#2A2145] shadow-xl p-4">
                  {session ? (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Operator</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{session.username}</p>
                      <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400">{session.role}</p>
                      <button
                        onClick={() => {
                          onLogout();
                          setMenuOpen(false);
                        }}
                        className="mt-3 w-full py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Operator Sign In</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Sign in for live SOS + online users from the SINAG bridge.
                      </p>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        autoComplete="username"
                        className="mt-2.5 w-full text-xs p-2 rounded-lg bg-[#F2EEFA] dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-400"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete="current-password"
                        className="mt-1.5 w-full text-xs p-2 rounded-lg bg-[#F2EEFA] dark:bg-[#120E22] border border-purple-200/60 dark:border-purple-800/40 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-purple-400"
                      />
                      {loginError && (
                        <p className="mt-1.5 text-[11px] text-rose-500 font-medium">{loginError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={loginBusy}
                        className="mt-2.5 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-xs shadow-sm shadow-purple-600/30 transition-colors"
                      >
                        {loginBusy ? 'Signing in…' : 'Sign In'}
                      </button>
                    </form>
                  )}
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
