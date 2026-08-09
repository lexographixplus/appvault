import React, { useState } from 'react';
import {
  Server,
  Database,
  Cloud,
  Key,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Search,
  DollarSign,
  Tag,
} from 'lucide-react';
import { ResourceItem, ResourceCategory } from '../types';

interface ResourcesViewProps {
  resources: ResourceItem[];
  connectionsCountByResourceId: Record<string, number>;
  onOpenCreateResourceModal: () => void;
  onOpenEditResourceModal: (resource: ResourceItem) => void;
  onDeleteResource: (id: string) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  connectionsCountByResourceId,
  onOpenCreateResourceModal,
  onOpenEditResourceModal,
  onDeleteResource,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'All',
    'Database',
    'Storage',
    'Hosting',
    'Authentication',
    'API',
    'Repository',
    'SaaS',
    'Monitoring',
    'Other',
  ];

  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalCost = resources.reduce((sum, r) => sum + (r.costMonthly || 0), 0);

  const getCategoryIcon = (cat: ResourceCategory) => {
    switch (cat) {
      case 'Database':
        return <Database className="w-4 h-4 text-emerald-400" />;
      case 'Storage':
        return <Cloud className="w-4 h-4 text-emerald-400" />;
      case 'Hosting':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'Authentication':
        return <Key className="w-4 h-4 text-amber-400" />;
      default:
        return <Server className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Infrastructure &amp; Managed Resources
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Centralized inventory of databases, cloud storage, API servers, and SaaS providers.
          </p>
        </div>
        <button
          onClick={onOpenCreateResourceModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-400/30"
        >
          <Plus className="w-3.5 h-3.5" /> New Resource
        </button>
      </div>

      {/* Credential Safety Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
        <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">Security Best Practice for Credentials:</span>
          Never store raw API keys, production database passwords, or secret tokens directly in this system. Use safe reference strings such as <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px] text-amber-200">1Password -&gt; Vault -&gt; Supabase Secret Key</code> or <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[11px] text-amber-200">GCP Secret Manager -&gt; DB_PASS_V2</code>.
        </div>
      </div>

      {/* Toolbar: Category Filter & Search */}
      <div className="bg-[#121216] p-4 rounded-2xl border border-[#1e1e24] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-[#18181c] border border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:bg-[#202026]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <span className="text-xs font-semibold text-zinc-400 whitespace-nowrap">
            Est. Total Spend: <span className="text-zinc-100">${totalCost.toFixed(0)}/mo</span>
          </span>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {filteredResources.length === 0 ? (
        <div className="bg-[#121216] rounded-2xl border border-dashed border-[#27272a] p-12 text-center">
          <Server className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-200">No resources found</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            No infrastructure resources matched your category or search query.
          </p>
          <button
            onClick={onOpenCreateResourceModal}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => {
            const usageCount = connectionsCountByResourceId[res.id] || 0;
            return (
              <div
                key={res.id}
                className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs hover:border-[#27272a] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(res.category)}
                      <h3 className="text-sm font-bold text-zinc-100">
                        {res.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {res.category}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                    {res.purpose || 'No purpose description provided.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-zinc-300 pt-3 border-t border-[#1e1e24]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Provider:</span>
                      <span className="font-semibold text-zinc-200">{res.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tier / Plan:</span>
                      <span className="text-zinc-300">{res.tier || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Monthly Cost:</span>
                      <span className="font-semibold text-zinc-200">
                        ${res.costMonthly || 0}/mo
                      </span>
                    </div>
                    {res.credLocation && (
                      <div className="pt-1.5">
                        <span className="text-[10px] text-zinc-500 block mb-0.5">Credential Reference:</span>
                        <code className="text-[10px] font-mono bg-[#18181c] border border-[#27272a] px-2 py-1 rounded block text-zinc-300 truncate">
                          {res.credLocation}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1e1e24] flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px] font-medium">
                    Linked in <strong className="text-emerald-400">{usageCount}</strong> app(s)
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditResourceModal(res)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-[#18181c] transition-colors cursor-pointer"
                      title="Edit resource"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteResource(res.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
