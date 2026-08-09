import React, { useState, useEffect } from 'react';
import { X, Box, Server, Cable, Package, Globe } from 'lucide-react';
import {
  AppItem,
  ResourceItem,
  AppType,
  AppStatus,
  AppPriority,
  ResourceCategory,
  ResourceStatus,
  EnvironmentName,
} from '../types';

/** Closes the modal on Escape while it is open. */
function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
}

interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AppItem> & { name: string }) => void;
  initialData?: AppItem | null;
}

export const AppFormModal: React.FC<AppModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'Web App' as AppType,
    status: 'Active' as AppStatus,
    platform: '',
    version: '1.0.0',
    repoUrl: '',
    prodUrl: '',
    owner: '',
    priority: 'Medium' as AppPriority,
    notes: '',
    tags: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        type: initialData.type || 'Web App',
        status: initialData.status || 'Active',
        platform: initialData.platform || '',
        version: initialData.version || '1.0.0',
        repoUrl: initialData.repoUrl || '',
        prodUrl: initialData.prodUrl || '',
        owner: initialData.owner || '',
        priority: initialData.priority || 'Medium',
        notes: initialData.notes || '',
        tags: (initialData.tags || []).join(', '),
      });
    } else {
      setFormData({
        name: '',
        description: '',
        type: 'Web App',
        status: 'Active',
        platform: '',
        version: '1.0.0',
        repoUrl: '',
        prodUrl: '',
        owner: '',
        priority: 'Medium',
        notes: '',
        tags: '',
      });
    }
  }, [initialData, isOpen]);

  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSubmit({
      id: initialData?.id,
      ...formData,
      tags: tagsArray,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className="bg-[#121216] border border-[#1e1e24] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#1e1e24] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              {initialData ? 'Edit Application' : 'Create Application'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Application Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Training Tracker"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of the application..."
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e: any) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Web App">Web App</option>
                <option value="Desktop App">Desktop App</option>
                <option value="Mobile App">Mobile App</option>
                <option value="API">API</option>
                <option value="Script/Automation">Script/Automation</option>
                <option value="Microservice">Microservice</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Active">Active</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Archived">Archived</option>
                <option value="Idea">Idea</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Tech Stack / Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="e.g., React 19, TypeScript"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="e.g., 1.4.2"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Owner / Team
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="e.g., Dev Team"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e: any) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Repository URL
              </label>
              <input
                type="url"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Production Endpoint URL
              </label>
              <input
                type="url"
                value={formData.prodUrl}
                onChange={(e) => setFormData({ ...formData, prodUrl: e.target.value })}
                placeholder="https://app.org"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., Core, Volunteer, Public"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Operational Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Operational details, maintenance schedules..."
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-[#1e1e24] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18181c] border border-[#27272a] text-zinc-300 font-medium hover:bg-[#202026] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold cursor-pointer shadow-xs border border-emerald-400/30 transition-colors"
            >
              Save Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Resource Form Modal --- */
interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ResourceItem> & { name: string; category: ResourceCategory }) => void;
  initialData?: ResourceItem | null;
}

export const ResourceFormModal: React.FC<ResourceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Database' as ResourceCategory,
    provider: '',
    status: 'Active' as ResourceStatus,
    url: '',
    purpose: '',
    credLocation: '',
    tier: 'Pro',
    costMonthly: 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category || 'Database',
        provider: initialData.provider || '',
        status: initialData.status || 'Active',
        url: initialData.url || '',
        purpose: initialData.purpose || '',
        credLocation: initialData.credLocation || '',
        tier: initialData.tier || 'Pro',
        costMonthly: initialData.costMonthly || 0,
      });
    } else {
      setFormData({
        name: '',
        category: 'Database',
        provider: '',
        status: 'Active',
        url: '',
        purpose: '',
        credLocation: '',
        tier: 'Pro',
        costMonthly: 0,
      });
    }
  }, [initialData, isOpen]);

  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      id: initialData?.id,
      ...formData,
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className="bg-[#121216] border border-[#1e1e24] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#1e1e24] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              {initialData ? 'Edit Resource' : 'New Infrastructure Resource'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Resource Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Supabase Postgres DB"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Database">Database</option>
                <option value="Storage">Storage</option>
                <option value="Hosting">Hosting</option>
                <option value="Authentication">Authentication</option>
                <option value="API">API</option>
                <option value="Repository">Repository</option>
                <option value="SaaS">SaaS</option>
                <option value="Monitoring">Monitoring</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="e.g., Supabase, GCP, Vercel"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Monthly Spend ($ USD)
              </label>
              <input
                type="number"
                value={formData.costMonthly}
                onChange={(e) => setFormData({ ...formData, costMonthly: Number(e.target.value) })}
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-300 mb-1">
                Tier / Plan
              </label>
              <input
                type="text"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                placeholder="e.g., Pro, Enterprise"
                className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Purpose &amp; Description
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="What is this resource used for?"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Safe Credential Reference Tag (Do NOT store raw passwords)
            </label>
            <input
              type="text"
              value={formData.credLocation}
              onChange={(e) => setFormData({ ...formData, credLocation: e.target.value })}
              placeholder="e.g., 1Password -> AppVault Vault -> Supabase Key"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-[#1e1e24] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18181c] border border-[#27272a] text-zinc-300 font-medium hover:bg-[#202026] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold cursor-pointer shadow-xs border border-emerald-400/30 transition-colors"
            >
              Save Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* --- Connection Linker Modal --- */
interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appId: string, resourceId: string, relationship: string, environment: EnvironmentName) => void;
  apps: AppItem[];
  resources: ResourceItem[];
  preselectedAppId?: string;
}

export const ConnectResourceModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  apps,
  resources,
  preselectedAppId,
}) => {
  const [appId, setAppId] = useState(preselectedAppId || apps[0]?.id || '');
  const [resourceId, setResourceId] = useState(resources[0]?.id || '');
  const [relationship, setRelationship] = useState('Primary Relational DB');
  const [environment, setEnvironment] = useState<EnvironmentName>('Production');

  // Apps and resources arrive asynchronously (initial Sheets pull), so the
  // initial useState values are usually empty. Without this the selects render
  // the first option while state stays "" and submitting silently does nothing.
  useEffect(() => {
    if (!isOpen) return;

    if (preselectedAppId) {
      setAppId(preselectedAppId);
    } else if (!apps.some((a) => a.id === appId)) {
      setAppId(apps[0]?.id || '');
    }

    if (!resources.some((r) => r.id === resourceId)) {
      setResourceId(resources[0]?.id || '');
    }
  }, [preselectedAppId, apps, resources, isOpen, appId, resourceId]);

  useEscapeToClose(isOpen, onClose);

  if (!isOpen) return null;

  const missingData = apps.length === 0 || resources.length === 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !resourceId) return;
    onSubmit(appId, resourceId, relationship, environment);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        className="bg-[#121216] border border-[#1e1e24] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[#1e1e24] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cable className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100">
              Connect Infrastructure to App
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {missingData ? (
          <div className="p-6 space-y-4 text-xs">
            <p className="text-zinc-300 leading-relaxed">
              A link needs at least one application and one infrastructure resource.
              {apps.length === 0 && ' No applications exist yet.'}
              {resources.length === 0 && ' No resources exist yet.'}
            </p>
            <div className="pt-3 border-t border-[#1e1e24] flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#18181c] border border-[#27272a] text-zinc-300 font-medium hover:bg-[#202026] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Select Application *
            </label>
            <select
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Select Infrastructure Resource *
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.category} - {r.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Relationship / Role
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="e.g., Primary Database, File Storage"
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              Target Environment
            </label>
            <select
              value={environment}
              onChange={(e: any) => setEnvironment(e.target.value)}
              className="w-full bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-2 text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Environments</option>
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Development">Development</option>
              <option value="QA">QA</option>
              <option value="Sandbox">Sandbox</option>
            </select>
          </div>

          <div className="pt-3 border-t border-[#1e1e24] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#18181c] border border-[#27272a] text-zinc-300 font-medium hover:bg-[#202026] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold cursor-pointer shadow-xs border border-emerald-400/30 transition-colors"
            >
              Create Link
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
