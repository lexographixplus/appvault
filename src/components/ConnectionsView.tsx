import React, { useState } from 'react';
import { Cable, Plus, Unlink, ExternalLink, Box, Server, Search } from 'lucide-react';
import { AppItem, ResourceItem, ConnectionItem } from '../types';

interface ConnectionsViewProps {
  connections: ConnectionItem[];
  apps: AppItem[];
  resources: ResourceItem[];
  onOpenConnectModal: () => void;
  onDeleteConnection: (id: string) => void;
  onNavigateApp: (appId: string) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({
  connections,
  apps,
  resources,
  onOpenConnectModal,
  onDeleteConnection,
  onNavigateApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [envFilter, setEnvFilter] = useState<string>('All');

  const filteredConnections = connections.filter((conn) => {
    const app = apps.find((a) => a.id === conn.appId);
    const res = resources.find((r) => r.id === conn.resourceId);

    const matchesSearch =
      (app?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (conn.relationship || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEnv = envFilter === 'All' || conn.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Application-Resource Relationships
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Link applications to databases, file buckets, authorization providers, and API endpoints.
          </p>
        </div>
        <button
          onClick={onOpenConnectModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-400/30"
        >
          <Plus className="w-3.5 h-3.5" /> Connect Resource to App
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#121216] p-4 rounded-2xl border border-[#1e1e24] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search connections..."
            className="w-full bg-[#18181c] border border-[#27272a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={envFilter}
          onChange={(e) => setEnvFilter(e.target.value)}
          className="bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
        >
          <option value="All">All Environments</option>
          <option value="Production">Production</option>
          <option value="Staging">Staging</option>
          <option value="Development">Development</option>
          <option value="QA">QA</option>
          <option value="Sandbox">Sandbox</option>
        </select>
      </div>

      {/* Connections Table */}
      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#18181c] border-b border-[#1e1e24] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Connected Resource</th>
                <th className="py-3 px-3">Role / Relationship</th>
                <th className="py-3 px-3">Target Environment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e24]">
              {filteredConnections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-400">
                    No connections found matching filters.
                  </td>
                </tr>
              ) : (
                filteredConnections.map((conn) => {
                  const app = apps.find((a) => a.id === conn.appId);
                  const res = resources.find((r) => r.id === conn.resourceId);
                  if (!app || !res) return null;

                  return (
                    <tr
                      key={conn.id}
                      className="hover:bg-[#18181c] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <button
                          onClick={() => onNavigateApp(app.id)}
                          className="font-bold text-zinc-100 hover:text-emerald-400 text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Box className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{app.name}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-200 inline-flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{res.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block ml-5">
                          {res.provider} ({res.category})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-medium">
                        {conn.relationship || 'Connected'}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#18181c] border border-[#27272a] text-zinc-300">
                          {conn.environment}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteConnection(conn.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Disconnect resource"
                        >
                          <Unlink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
