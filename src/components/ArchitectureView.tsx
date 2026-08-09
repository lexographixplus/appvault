import React, { useState, useEffect } from 'react';
import { Box, Server, Globe, Database, Info, ArrowDown } from 'lucide-react';
import { AppItem, ResourceItem, ConnectionItem } from '../types';

interface ArchitectureViewProps {
  apps: AppItem[];
  resources: ResourceItem[];
  connections: ConnectionItem[];
  onNavigateApp: (appId: string) => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  apps,
  resources,
  connections,
  onNavigateApp,
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(apps[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState<{ type: 'app' | 'resource'; item: any } | null>(null);

  // Apps load asynchronously from the Sheets pull, so the initial state is
  // usually "". Fall back to the first app whenever the selection is not (or is
  // no longer) a real app, otherwise the dropdown shows a name while the canvas
  // insists nothing is selected.
  useEffect(() => {
    if (!apps.some((a) => a.id === selectedAppId)) {
      setSelectedAppId(apps[0]?.id || '');
      setSelectedNode(null);
    }
  }, [apps, selectedAppId]);

  const selectedApp = apps.find((a) => a.id === selectedAppId);
  const appConnections = connections.filter((c) => c.appId === selectedAppId);

  const connectedResources = appConnections
    .map((c) => {
      const res = resources.find((r) => r.id === c.resourceId);
      return res ? { resource: res, connection: c } : null;
    })
    .filter(Boolean);

  const hostingResources = connectedResources.filter((cr) => cr?.resource.category === 'Hosting');
  const databaseResources = connectedResources.filter(
    (cr) => cr?.resource.category === 'Database' || cr?.resource.category === 'Storage'
  );
  const serviceResources = connectedResources.filter(
    (cr) =>
      cr?.resource.category !== 'Hosting' &&
      cr?.resource.category !== 'Database' &&
      cr?.resource.category !== 'Storage'
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            System Topology Map
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Visual architectural node diagram mapping ingress, application code, and data stores.
          </p>
        </div>

        {/* Application Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-zinc-400">Target App:</label>
          <select
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value);
              setSelectedNode(null);
            }}
            className="bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none cursor-pointer"
          >
            {apps.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Canvas + Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Topology Node Canvas */}
        <div className="lg:col-span-2 bg-[#121216] rounded-2xl border border-[#1e1e24] p-8 shadow-xs flex flex-col items-center justify-center space-y-6 min-h-[420px]">
          {!selectedApp ? (
            <p className="text-xs text-zinc-400">
              {apps.length === 0
                ? 'No applications yet. Create one to see its topology here.'
                : 'Please select an application to view topology.'}
            </p>
          ) : (
            <div className="w-full space-y-6">
              {/* Tier 1: Ingress / Edge Hosting */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block text-center">
                  Tier 1: Client Ingress &amp; Hosting
                </span>
                <div className="flex flex-wrap justify-center gap-4">
                  {hostingResources.length === 0 ? (
                    <div className="p-3 bg-[#18181c] border border-dashed border-[#27272a] rounded-xl text-center w-48 text-zinc-500 text-xs">
                      Default Edge Ingress
                    </div>
                  ) : (
                    hostingResources.map((item) => (
                      <div
                        key={item!.resource.id}
                        onClick={() => setSelectedNode({ type: 'resource', item: item!.resource })}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center w-48 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
                      >
                        <Globe className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-zinc-100 block truncate">
                          {item!.resource.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{item!.resource.provider}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-center text-zinc-600">
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>

              {/* Tier 2: Application Core */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block text-center">
                  Tier 2: Primary Application Logic
                </span>
                <div className="flex justify-center">
                  <div
                    onClick={() => setSelectedNode({ type: 'app', item: selectedApp })}
                    className="p-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-2xl text-center w-72 shadow-lg shadow-emerald-500/20 border border-emerald-400/40 cursor-pointer transition-all transform hover:scale-102"
                  >
                    <Box className="w-6 h-6 mx-auto mb-1 text-zinc-950" />
                    <span className="text-sm font-bold block text-zinc-950">{selectedApp.name}</span>
                    <span className="text-[11px] text-zinc-900 block font-normal">{selectedApp.platform}</span>
                    <span className="text-[10px] bg-zinc-950/20 text-zinc-900 px-2 py-0.5 rounded-full inline-block mt-1 font-mono">
                      v{selectedApp.version}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-zinc-600">
                <ArrowDown className="w-5 h-5 animate-bounce" />
              </div>

              {/* Tier 3: Databases & Storage */}
              <div className="space-y-2">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block text-center">
                  Tier 3: Backing Databases &amp; Storage
                </span>
                <div className="flex flex-wrap justify-center gap-4">
                  {databaseResources.length === 0 ? (
                    <div className="p-3 bg-[#18181c] border border-dashed border-[#27272a] rounded-xl text-center w-48 text-zinc-500 text-xs">
                      No databases linked
                    </div>
                  ) : (
                    databaseResources.map((item) => (
                      <div
                        key={item!.resource.id}
                        onClick={() => setSelectedNode({ type: 'resource', item: item!.resource })}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center w-48 shadow-xs hover:border-emerald-400 cursor-pointer transition-all"
                      >
                        <Database className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-zinc-100 block truncate">
                          {item!.resource.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{item!.resource.provider}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tier 4: SaaS / Third-Party Services */}
              {serviceResources.length > 0 && (
                <div className="pt-4 border-t border-[#1e1e24] space-y-2">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block text-center">
                    External SaaS &amp; APIs
                  </span>
                  <div className="flex flex-wrap justify-center gap-3">
                    {serviceResources.map((item) => (
                      <div
                        key={item!.resource.id}
                        onClick={() => setSelectedNode({ type: 'resource', item: item!.resource })}
                        className="p-2.5 bg-[#18181c] border border-[#27272a] rounded-xl text-center w-40 hover:border-zinc-500 cursor-pointer transition-all"
                      >
                        <Server className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-zinc-200 block truncate">
                          {item!.resource.name}
                        </span>
                        <span className="text-[10px] text-zinc-400 block">{item!.resource.category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Col: Node Inspector */}
        <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1e1e24] pb-3">
            <Info className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">Node Inspector</h3>
          </div>

          {!selectedNode ? (
            <div className="py-12 text-center text-zinc-500 text-xs">
              Click any node in the topology diagram to inspect detailed metadata and configuration.
            </div>
          ) : selectedNode.type === 'app' ? (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="font-bold text-zinc-100 block text-sm">
                  {selectedNode.item.name}
                </span>
                <span className="text-emerald-400 font-medium text-[11px]">{selectedNode.item.type}</span>
              </div>

              <div className="space-y-2 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block">Status:</span>
                  <span className="font-semibold text-zinc-200">{selectedNode.item.status}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Tech Stack:</span>
                  <span className="font-semibold text-zinc-200">{selectedNode.item.platform}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Owner:</span>
                  <span className="font-semibold text-zinc-200">{selectedNode.item.owner}</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateApp(selectedNode.item.id)}
                className="w-full mt-4 py-2 bg-emerald-500 text-zinc-950 font-semibold rounded-xl text-xs hover:bg-emerald-400 transition-colors cursor-pointer border border-emerald-400/30"
              >
                Open Application View
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <span className="font-bold text-zinc-100 block text-sm">
                  {selectedNode.item.name}
                </span>
                <span className="text-emerald-400 font-semibold text-[11px]">
                  {selectedNode.item.category}
                </span>
              </div>

              <div className="space-y-2 text-zinc-300">
                <div>
                  <span className="text-zinc-500 block">Provider:</span>
                  <span className="font-semibold text-zinc-200">{selectedNode.item.provider}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Monthly Cost:</span>
                  <span className="font-semibold text-zinc-200">${selectedNode.item.costMonthly}/mo</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Purpose:</span>
                  <span className="text-zinc-300">{selectedNode.item.purpose}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
