import React from 'react';
import {
  Box,
  Server,
  Cable,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { AppItem, ResourceItem, ActivityItem } from '../types';

interface DashboardViewProps {
  apps: AppItem[];
  resources: ResourceItem[];
  connectionsCount: number;
  activities: ActivityItem[];
  onNavigate: (view: string, entityId?: string) => void;
  onOpenCreateAppModal: () => void;
  onOpenCreateResourceModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  apps,
  resources,
  connectionsCount,
  activities,
  onNavigate,
  onOpenCreateAppModal,
  onOpenCreateResourceModal,
}) => {
  const activeApps = apps.filter((a) => a.status === 'Active').length;
  const devApps = apps.filter((a) => a.status === 'Development' || a.status === 'Testing').length;
  const totalCost = resources.reduce((acc, r) => acc + (r.costMonthly || 0), 0);

  // Group apps by status. Covers every AppStatus so the breakdown percentages
  // add up to 100 instead of quietly dropping Idea apps.
  const statusCounts = {
    Active: apps.filter((a) => a.status === 'Active').length,
    Development: apps.filter((a) => a.status === 'Development').length,
    Testing: apps.filter((a) => a.status === 'Testing').length,
    Maintenance: apps.filter((a) => a.status === 'Maintenance').length,
    Archived: apps.filter((a) => a.status === 'Archived').length,
    Idea: apps.filter((a) => a.status === 'Idea').length,
  };

  const statusBarColor: Record<string, string> = {
    Active: 'bg-emerald-500',
    Development: 'bg-amber-500',
    Testing: 'bg-blue-500',
    Maintenance: 'bg-indigo-500',
    Archived: 'bg-zinc-600',
    Idea: 'bg-purple-500',
  };

  // Group resources by category
  const categoriesMap: Record<string, number> = {};
  resources.forEach((r) => {
    categoriesMap[r.category] = (categoriesMap[r.category] || 0) + 1;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>;
      case 'Development':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Development</span>;
      case 'Testing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Testing</span>;
      case 'Maintenance':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Maintenance</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f0f12] p-6 rounded-2xl border border-[#1e1e24] text-zinc-100 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            Application Ecosystem Overview
          </h2>
          <p className="text-xs text-zinc-400 mt-1.5 max-w-xl leading-relaxed">
            Manage your software portfolio, connected infrastructure, and Google Sheets cloud data sync in one unified console.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={onOpenCreateAppModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" /> New App
          </button>
          <button
            onClick={() => onNavigate('sheets')}
            className="px-3.5 py-2 rounded-xl bg-[#18181c] hover:bg-[#222228] text-zinc-200 text-xs font-semibold transition-all border border-[#27272a] flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Sheets Database
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Apps */}
        <div
          onClick={() => onNavigate('applications')}
          className="bg-[#121216] p-5 rounded-2xl border border-[#1e1e24] hover:border-emerald-500/30 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Total Applications</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100">{apps.length}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> {activeApps} Active
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e1e24] text-[11px] text-zinc-500">
            {devApps} in development / testing
          </div>
        </div>

        {/* Resources */}
        <div
          onClick={() => onNavigate('resources')}
          className="bg-[#121216] p-5 rounded-2xl border border-[#1e1e24] hover:border-emerald-500/30 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Managed Resources</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100">{resources.length}</span>
            <span className="text-xs font-medium text-zinc-400">
              Databases, Cloud, APIs
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e1e24] text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Est. Infrastructure Cost:</span>
            <span className="font-semibold text-zinc-300">${totalCost.toFixed(0)}/mo</span>
          </div>
        </div>

        {/* Active Connections */}
        <div
          onClick={() => onNavigate('connections')}
          className="bg-[#121216] p-5 rounded-2xl border border-[#1e1e24] hover:border-emerald-500/30 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Connected Links</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cable className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100">{connectionsCount}</span>
            <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Healthy topology
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e1e24] text-[11px] text-zinc-500">
            Across Production, Staging & Dev
          </div>
        </div>

        {/* System Health */}
        <div
          onClick={() => onNavigate('environments')}
          className="bg-[#121216] p-5 rounded-2xl border border-[#1e1e24] hover:border-emerald-500/30 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Monthly Cloud Spend</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-zinc-100">${totalCost.toFixed(0)}</span>
            <span className="text-xs font-medium text-emerald-400">USD/mo</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#1e1e24] text-[11px] text-zinc-500">
            Across {resources.filter((r) => r.costMonthly > 0).length} paid subscriptions
          </div>
        </div>
      </div>

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns: Recent Applications Table */}
        <div className="lg:col-span-2 bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100">Recent Applications</h3>
              <p className="text-xs text-zinc-400">Software projects in your ecosystem</p>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View all ({apps.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1e1e24] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pr-4">Application</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Tech Stack</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 pl-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e24]">
                {apps.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No applications yet. Create your first one to get started.
                    </td>
                  </tr>
                )}
                {apps.slice(0, 5).map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[#18181c] transition-colors cursor-pointer group"
                    onClick={() => onNavigate('app-detail', app.id)}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-zinc-100 text-xs group-hover:text-emerald-400 transition-colors">
                        {app.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate max-w-xs">
                        {app.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {app.platform || '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          app.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : app.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {app.priority}
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Distribution & Activity Feed */}
        <div className="space-y-6">
          {/* Status Breakdown Card */}
          <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-zinc-100 mb-3">Portfolio Breakdown</h3>
            <div className="space-y-2.5">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = apps.length > 0 ? Math.round((count / apps.length) * 100) : 0;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-zinc-300">
                      <span>{status}</span>
                      <span className="text-zinc-500">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#18181c] rounded-full h-1.5 overflow-hidden border border-[#27272a]">
                      <div
                        className={`h-full rounded-full ${statusBarColor[status] || 'bg-zinc-600'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Log Preview */}
          <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Recent Activity
              </h3>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {activities.length === 0 && (
                <p className="text-xs text-zinc-500 py-2">No activity recorded yet.</p>
              )}
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-200 font-medium leading-snug line-clamp-2">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
