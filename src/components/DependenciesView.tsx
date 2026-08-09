import React, { useState } from 'react';
import { Package, Plus, Search, AlertCircle, CheckCircle2, Box } from 'lucide-react';
import { DependencyItem, AppItem } from '../types';

interface DependenciesViewProps {
  dependencies: DependencyItem[];
  apps: AppItem[];
  onOpenAddDependencyModal: () => void;
  onNavigateApp: (appId: string) => void;
}

export const DependenciesView: React.FC<DependenciesViewProps> = ({
  dependencies,
  apps,
  onOpenAddDependencyModal,
  onNavigateApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filtered = dependencies.filter((dep) => {
    const app = apps.find((a) => a.id === dep.appId);
    const matchesSearch =
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || dep.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Ecosystem Dependencies
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Audit software packages, framework versions, and SDKs used across applications.
          </p>
        </div>
        <button
          onClick={onOpenAddDependencyModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-400/30"
        >
          <Plus className="w-3.5 h-3.5" /> Add Dependency
        </button>
      </div>

      <div className="bg-[#121216] p-4 rounded-2xl border border-[#1e1e24] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search package name or app..."
            className="w-full bg-[#18181c] border border-[#27272a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Framework">Framework</option>
          <option value="Library">Library</option>
          <option value="SDK">SDK</option>
          <option value="Database Driver">Database Driver</option>
          <option value="DevDependency">DevDependency</option>
          <option value="External API">External API</option>
        </select>
      </div>

      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#18181c] border-b border-[#1e1e24] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Application</th>
              <th className="py-3 px-4">Dependency / Package</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Installed Version</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e24]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-400">
                  No dependencies found matching filters.
                </td>
              </tr>
            ) : (
              filtered.map((dep) => {
                const app = apps.find((a) => a.id === dep.appId);
                return (
                  <tr key={dep.id} className="hover:bg-[#18181c]">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => app && onNavigateApp(app.id)}
                        className="font-bold text-zinc-100 hover:text-emerald-400 text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Box className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{app?.name || 'App'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-zinc-100">
                      {dep.name}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">{dep.type}</td>
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      v{dep.version}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
