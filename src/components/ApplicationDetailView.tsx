import React, { useState } from 'react';
import {
  ArrowLeft,
  Edit2,
  ExternalLink,
  Server,
  Package,
  Globe,
  GitBranch,
  Plus,
  Trash2,
  Unlink,
  CheckCircle2,
  Tag,
  Clock,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AppItem, ResourceItem, ConnectionItem, DependencyItem, EnvironmentItem } from '../types';
import { safeUrl } from '../lib/url';

interface ApplicationDetailViewProps {
  app: AppItem;
  allResources: ResourceItem[];
  connections: ConnectionItem[];
  dependencies: DependencyItem[];
  environments: EnvironmentItem[];
  onBack: () => void;
  onOpenEditAppModal: (app: AppItem) => void;
  onOpenConnectResourceModal: (appId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
  onOpenAddDependencyModal: (appId: string) => void;
  onDeleteDependency: (dependencyId: string) => void;
  onOpenAddEnvironmentModal: (appId: string) => void;
  onDeleteEnvironment: (environmentId: string) => void;
}

export const ApplicationDetailView: React.FC<ApplicationDetailViewProps> = ({
  app,
  allResources,
  connections,
  dependencies,
  environments,
  onBack,
  onOpenEditAppModal,
  onOpenConnectResourceModal,
  onDeleteConnection,
  onOpenAddDependencyModal,
  onDeleteDependency,
  onOpenAddEnvironmentModal,
  onDeleteEnvironment,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'dependencies' | 'environments' | 'architecture'>('overview');

  const repoHref = safeUrl(app.repoUrl);
  const prodHref = safeUrl(app.prodUrl);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>;
      case 'Development':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Development</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Applications List
      </button>

      {/* Header Banner */}
      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-zinc-100 tracking-tight">
                {app.name}
              </h2>
              {getStatusBadge(app.status)}
              <span className="text-xs font-mono text-zinc-500">v{app.version}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              {app.description || 'No description provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {repoHref && (
              <a
                href={repoHref}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-[#18181c] hover:bg-[#202026] border border-[#27272a] rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                Repository <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {prodHref && (
              <a
                href={prodHref}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors inline-flex items-center gap-1.5 border border-emerald-400/30"
              >
                Live App <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={() => onOpenEditAppModal(app)}
              className="p-1.5 text-zinc-300 bg-[#18181c] hover:bg-[#202026] border border-[#27272a] rounded-xl transition-colors cursor-pointer"
              title="Edit Application"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#1e1e24] flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Overview
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'resources'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Connected Resources ({connections.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'dependencies'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Dependencies ({dependencies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('environments')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'environments'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Environments ({environments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'architecture'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Topology Map</span>
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-zinc-100">
                Application Metadata
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">Type</span>
                  <span className="font-semibold text-zinc-200">{app.type}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Tech Stack</span>
                  <span className="font-semibold text-zinc-200">{app.platform || '-'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Owner / Team</span>
                  <span className="font-semibold text-zinc-200">{app.owner || '-'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Priority Level</span>
                  <span className="font-semibold text-zinc-200">{app.priority}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Created Date</span>
                  <span className="font-semibold text-zinc-200">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">Last Updated</span>
                  <span className="font-semibold text-zinc-200">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {app.tags && app.tags.length > 0 && (
                <div className="pt-3 border-t border-[#1e1e24]">
                  <span className="text-zinc-500 text-xs block mb-1.5">Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {app.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#18181c] border border-[#27272a] text-zinc-300"
                      >
                        <Tag className="w-3 h-3 text-zinc-500" /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes Card */}
            <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-zinc-100 mb-2">
                Operational Notes
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-[#18181c] p-3 rounded-xl border border-[#27272a]">
                {app.notes || 'No notes added for this application.'}
              </p>
            </div>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
                Ecosystem Links
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[#1e1e24]">
                  <span className="text-zinc-400">Connected Resources:</span>
                  <span className="font-bold text-emerald-400">{connections.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1e1e24]">
                  <span className="text-zinc-400">Dependencies:</span>
                  <span className="font-bold text-zinc-200">{dependencies.length}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-zinc-400">Active Environments:</span>
                  <span className="font-bold text-zinc-200">{environments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Connected Resources */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">
              Infrastructure &amp; Service Connections
            </h3>
            <button
              onClick={() => onOpenConnectResourceModal(app.id)}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
            >
              <Plus className="w-3.5 h-3.5" /> Connect Resource
            </button>
          </div>

          {connections.length === 0 ? (
            <div className="bg-[#121216] rounded-2xl border border-dashed border-[#27272a] p-8 text-center">
              <Server className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">
                No resources connected to this application yet. Link databases, storage buckets, or APIs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((conn) => {
                const res = allResources.find((r) => r.id === conn.resourceId);
                if (!res) return null;
                return (
                  <div
                    key={conn.id}
                    className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-4 shadow-xs flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-100">
                          {res.name}
                        </h4>
                        <span className="px-2 py-0.5rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {res.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Provider: {res.provider}</p>
                      <div className="mt-2 text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                        <span className="text-zinc-500 text-[11px]">Role:</span>
                        <span>{conn.relationship || 'Connected'}</span>
                        <span className="text-[10px] px-1.5 py-0.5bg-[#18181c] border border-[#27272a] text-zinc-400 rounded">
                          {conn.environment}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteConnection(conn.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 cursor-pointer transition-colors"
                      title="Remove connection"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Dependencies */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">
              Packages &amp; Libraries
            </h3>
            <button
              onClick={() => onOpenAddDependencyModal(app.id)}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
            >
              <Plus className="w-3.5 h-3.5" /> Add Dependency
            </button>
          </div>

          <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#18181c] border-b border-[#1e1e24] text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Dependency</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Current Version</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e24]">
                {dependencies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-400">
                      No dependencies recorded yet.
                    </td>
                  </tr>
                ) : (
                  dependencies.map((dep) => (
                    <tr key={dep.id} className="hover:bg-[#18181c]">
                      <td className="py-3 px-4 font-bold text-zinc-100">
                        {dep.name}
                      </td>
                      <td className="py-3 px-3 text-zinc-400">{dep.type}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">
                        {dep.version}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {dep.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteDependency(dep.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: Environments */}
      {activeTab === 'environments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-100">
              Deployment Environments
            </h3>
            <button
              onClick={() => onOpenAddEnvironmentModal(app.id)}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer border border-emerald-400/30"
            >
              <Plus className="w-3.5 h-3.5" /> Add Environment
            </button>
          </div>

          {environments.length === 0 ? (
            <div className="bg-[#121216] rounded-2xl border border-dashed border-[#27272a] p-8 text-center">
              <Globe className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs text-zinc-400">
                No deployment environments recorded for this application yet.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {environments.map((env) => {
              const envHref = safeUrl(env.url);
              return (
              <div
                key={env.id}
                className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-4 shadow-xs flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-zinc-100">
                      {env.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {env.status}
                    </span>
                  </div>
                  {envHref ? (
                    <a
                      href={envHref}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      {env.url} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-500 mt-1 block">{env.url || 'No URL set'}</span>
                  )}
                </div>

                <button
                  onClick={() => onDeleteEnvironment(env.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Topology Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-8 shadow-xs flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-bold text-zinc-100">
              {app.name} Topology Diagram
            </h3>
            <p className="text-xs text-zinc-400">Resource relationship graph</p>
          </div>

          <div className="w-full max-w-xl space-y-6">
            {/* Top Ingress Node */}
            <div className="flex justify-center">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center w-48 shadow-xs">
                <Globe className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs font-bold text-zinc-100">
                  Edge &amp; CDN Hosting
                </span>
                <span className="text-[10px] text-zinc-400 block">{app.prodUrl || 'Production URL'}</span>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-[#27272a] mx-auto" />

            {/* Core App Node */}
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-500 text-zinc-950 font-bold rounded-2xl text-center w-64 shadow-md shadow-emerald-500/20 border border-emerald-400/40">
                <span className="text-xs font-bold block text-zinc-950">{app.name}</span>
                <span className="text-[10px] text-zinc-900 block font-normal">{app.platform}</span>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-[#27272a] mx-auto" />

            {/* Connected Resources Bottom Row */}
            <div className="flex flex-wrap justify-center gap-3">
              {connections.map((c) => {
                const res = allResources.find((r) => r.id === c.resourceId);
                if (!res) return null;
                return (
                  <div
                    key={c.id}
                    className="p-3 bg-[#18181c] border border-[#27272a] rounded-xl text-center w-40"
                  >
                    <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-xs font-bold text-zinc-200 block truncate">
                      {res.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">{res.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
