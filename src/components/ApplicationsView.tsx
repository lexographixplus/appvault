import React, { useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Box,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Download,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AppItem, AppPriority, AppStatus } from '../types';
import { downloadBlob } from '../lib/download';

const PRIORITY_RANK: Record<AppPriority, number> = { High: 0, Medium: 1, Low: 2 };

/**
 * Quotes a CSV field. Every value is quoted rather than only some, so commas,
 * quotes and newlines inside names or owners can't shift columns. The leading
 * apostrophe defuses formula injection when the export is opened in a
 * spreadsheet.
 */
function csvCell(value: unknown): string {
  const text = value == null ? '' : String(value);
  const guarded = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

interface ApplicationsViewProps {
  apps: AppItem[];
  onNavigate: (view: string, entityId?: string) => void;
  onOpenCreateAppModal: () => void;
  onOpenEditAppModal: (app: AppItem) => void;
  onDeleteApp: (id: string) => void;
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  apps,
  onNavigate,
  onOpenCreateAppModal,
  onOpenEditAppModal,
  onDeleteApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'name' | 'updatedAt' | 'priority'>('updatedAt');

  const filteredApps = apps
    .filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.owner.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // Rank by importance, not alphabetically (which would order High, Low, Medium).
      if (sortBy === 'priority') return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Type', 'Status', 'Platform', 'Version', 'Priority', 'Owner', 'RepoUrl', 'ProdUrl'];
    const rows = filteredApps.map((a) => [
      a.id,
      a.name,
      a.type,
      a.status,
      a.platform,
      a.version,
      a.priority,
      a.owner,
      a.repoUrl,
      a.prodUrl,
    ]);

    const csvContent = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `appvault-applications-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const getStatusBadge = (status: AppStatus) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Active</span>;
      case 'Development':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Development</span>;
      case 'Testing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Testing</span>;
      case 'Maintenance':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Maintenance</span>;
      case 'Archived':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">Archived</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">{status}</span>;
    }
  };

  const statusChips = ['All', 'Active', 'Development', 'Testing', 'Maintenance', 'Archived', 'Idea'];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Applications Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Document and organize all software applications in your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-[#121216] border border-[#1e1e24] rounded-xl hover:bg-[#18181c] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" /> Export CSV
          </button>
          <button
            onClick={onOpenCreateAppModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
          >
            <Plus className="w-3.5 h-3.5" /> New Application
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121216] p-4 rounded-2xl border border-[#1e1e24] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setStatusFilter(chip)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === chip
                  ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-xs'
                  : 'bg-[#18181c] text-zinc-400 border border-[#27272a] hover:bg-[#202026] hover:text-zinc-200'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Search, Sort, View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter list..."
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-[#18181c] border border-[#27272a] rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="updatedAt">Sort: Recently Updated</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="priority">Sort: Priority</option>
          </select>

          <div className="flex items-center bg-[#18181c] p-0.5 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'table' ? 'bg-[#121216] text-emerald-400 border border-[#27272a] shadow-xs' : 'text-zinc-500'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#121216] text-emerald-400 border border-[#27272a] shadow-xs' : 'text-zinc-500'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Apps View List */}
      {filteredApps.length === 0 ? (
        <div className="bg-[#121216] rounded-2xl border border-dashed border-[#27272a] p-12 text-center">
          <Box className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-200">No applications found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            No software applications matched your search or status filter. Try clearing filters or create a new application.
          </p>
          <button
            onClick={onOpenCreateAppModal}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create Application
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#18181c] border-b border-[#1e1e24] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Platform / Stack</th>
                  <th className="py-3 px-3">Version</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e24]">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-[#18181c] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onNavigate('app-detail', app.id)}
                        className="font-bold text-zinc-100 hover:text-emerald-400 text-xs transition-colors text-left block cursor-pointer"
                      >
                        {app.name}
                      </button>
                      <p className="text-[11px] text-zinc-400 truncate max-w-md mt-0.5">
                        {app.description}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {app.type}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-3 text-zinc-300 font-medium whitespace-nowrap">
                      {app.platform || '-'}
                    </td>
                    <td className="py-3 px-3 text-zinc-500 whitespace-nowrap font-mono text-[11px]">
                      v{app.version}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 whitespace-nowrap">
                      {app.owner || '-'}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onNavigate('app-detail', app.id)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-400 rounded-lg hover:bg-[#18181c] transition-colors cursor-pointer"
                          title="View detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditAppModal(app)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#18181c] transition-colors cursor-pointer"
                          title="Edit application"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApp(app.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3
                    onClick={() => onNavigate('app-detail', app.id)}
                    className="text-sm font-bold text-zinc-100 hover:text-emerald-400 cursor-pointer transition-colors"
                  >
                    {app.name}
                  </h3>
                  {getStatusBadge(app.status)}
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {app.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-zinc-400 pt-3 border-t border-[#1e1e24]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Stack:</span>
                    <span className="font-medium text-zinc-200">{app.platform || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Owner:</span>
                    <span className="font-medium">{app.owner || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Version:</span>
                    <span className="font-mono text-[11px]">v{app.version}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#1e1e24] flex items-center justify-between text-xs">
                <button
                  onClick={() => onNavigate('app-detail', app.id)}
                  className="text-xs font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Details
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditAppModal(app)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-[#18181c]"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteApp(app.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
