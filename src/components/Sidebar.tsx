import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Box,
  Server,
  Cable,
  Package,
  Globe,
  GitBranch,
  Activity,
  FileSpreadsheet,
  Settings,
  Layers,
  X,
} from 'lucide-react';
import { appStore } from '../lib/store';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const [counts, setCounts] = useState({
    apps: appStore.getApps().length,
    resources: appStore.getResources().length,
    connections: appStore.getConnections().length,
    dependencies: appStore.getDependencies().length,
    environments: appStore.getEnvironments().length,
  });

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setCounts({
        apps: appStore.getApps().length,
        resources: appStore.getResources().length,
        connections: appStore.getConnections().length,
        dependencies: appStore.getDependencies().length,
        environments: appStore.getEnvironments().length,
      });
    });
    return unsubscribe;
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: Box, count: counts.apps },
    { id: 'resources', label: 'Resources', icon: Server, count: counts.resources },
    { id: 'connections', label: 'Connections', icon: Cable, count: counts.connections },
    { id: 'dependencies', label: 'Dependencies', icon: Package, count: counts.dependencies },
    { id: 'environments', label: 'Environments', icon: Globe, count: counts.environments },
    { id: 'architecture', label: 'Architecture Map', icon: GitBranch },
    { id: 'activity', label: 'Activity Log', icon: Activity },
    { id: 'sheets', label: 'Google Sheets Sync', icon: FileSpreadsheet, highlight: true },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0f0f12] text-zinc-300 flex flex-col border-r border-[#1e1e24] transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-[#1e1e24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-xs shadow-emerald-500/10">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-zinc-100 tracking-wide block leading-none">
                APPVAULT
              </span>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wider uppercase mt-1 block">
                Infrastructure Hub
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden text-zinc-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs shadow-emerald-500/10'
                    : item.highlight
                    ? 'text-emerald-400 hover:bg-[#15151a] hover:text-emerald-300'
                    : 'text-zinc-400 hover:bg-[#15151a] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : item.highlight ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-[#18181c] text-zinc-400 border border-[#27272a]'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[#1e1e24]">
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentView === 'settings'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-xs'
                : 'text-zinc-400 hover:bg-[#15151a] hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
