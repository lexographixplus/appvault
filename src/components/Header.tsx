import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Plus,
  Menu,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { appStore } from '../lib/store';
import { SheetsConfig } from '../types';

interface HeaderProps {
  currentViewTitle: string;
  onOpenCommandPalette: () => void;
  onOpenCreateAppModal: () => void;
  onToggleMobileSidebar: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle,
  onOpenCommandPalette,
  onOpenCreateAppModal,
  onToggleMobileSidebar,
  onNavigate,
}) => {
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfig>(appStore.getSheetsConfig());
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState(appStore.getActivity().slice(0, 5));
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setSheetsConfig(appStore.getSheetsConfig());
      setActivities(appStore.getActivity().slice(0, 5));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSheetsBadge = () => {
    if (!sheetsConfig.webAppUrl) {
      return (
        <button
          onClick={() => onNavigate('sheets')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
          title="Click to set up Google Sheets backend database"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Local Mode</span>
        </button>
      );
    }

    if (sheetsConfig.lastSyncStatus === 'syncing') {
      return (
        <button
          onClick={() => onNavigate('sheets')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all cursor-pointer animate-pulse"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing Sheets...</span>
        </button>
      );
    }

    if (sheetsConfig.lastSyncStatus === 'error') {
      return (
        <button
          onClick={() => onNavigate('sheets')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
          title={sheetsConfig.errorMessage || 'Sync failed'}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sheets Error</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => onNavigate('sheets')}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
        title="Google Sheets database active"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        <span>Sheets Connected</span>
      </button>
    );
  };

  return (
    <header className="h-16 bg-[#0c0c0e] border-b border-[#1e1e24] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-zinc-300 hover:bg-[#18181c] rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
          {currentViewTitle}
        </h1>
        <div className="hidden sm:block ml-2">{getSheetsBadge()}</div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 bg-[#15151a] text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-[#27272a] text-xs font-medium transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search apps, resources...</span>
          <span className="md:hidden">Search</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-[#0f0f12] border border-[#27272a] rounded text-zinc-500">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#18181c] rounded-lg transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121216] border border-[#1e1e24] rounded-xl shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1e1e24]">
                <span className="text-xs font-semibold text-zinc-100">
                  Recent Activities
                </span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-zinc-400 hover:text-zinc-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activities.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-4 text-center">No recent activity.</p>
                ) : (
                  activities.map((act) => (
                    <div
                      key={act.id}
                      className="text-xs p-2 rounded-lg bg-[#18181c] border border-[#27272a]"
                    >
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                        <span className="font-medium text-emerald-400 uppercase tracking-wider">
                          {act.entityType}
                        </span>
                        <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-zinc-300 font-medium leading-snug">
                        {act.description}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2 pt-2 border-t border-[#1e1e24] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onNavigate('activity');
                  }}
                  className="text-xs font-medium text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  View full activity log <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick New App Action Button */}
        <button
          onClick={onOpenCreateAppModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-lg shadow-sm transition-all cursor-pointer border border-emerald-400/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Application</span>
        </button>
      </div>
    </header>
  );
};
