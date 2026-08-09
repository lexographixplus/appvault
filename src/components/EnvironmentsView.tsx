import React, { useState } from 'react';
import { Globe, Plus, ExternalLink, CheckCircle2, RefreshCw } from 'lucide-react';
import { EnvironmentItem, AppItem } from '../types';
import { safeUrl } from '../lib/url';

interface EnvironmentsViewProps {
  environments: EnvironmentItem[];
  apps: AppItem[];
  onOpenAddEnvironmentModal: () => void;
  onNavigateApp: (appId: string) => void;
}

export const EnvironmentsView: React.FC<EnvironmentsViewProps> = ({
  environments,
  apps,
  onOpenAddEnvironmentModal,
  onNavigateApp,
}) => {
  const [checking, setChecking] = useState(false);

  const simulatePing = () => {
    setChecking(true);
    setTimeout(() => setChecking(false), 800);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Deployment Environments
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Monitor target deployment endpoints across Production, Staging, QA, and Development.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={simulatePing}
            disabled={checking}
            className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-[#18181c] border border-[#27272a] rounded-xl hover:bg-[#202026] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Check Health Pings</span>
          </button>
          <button
            onClick={onOpenAddEnvironmentModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 border border-emerald-400/30"
          >
            <Plus className="w-3.5 h-3.5" /> Add Environment
          </button>
        </div>
      </div>

      {environments.length === 0 ? (
        <div className="bg-[#121216] rounded-2xl border border-dashed border-[#27272a] p-12 text-center">
          <Globe className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-200">No environments yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
            Record where each application is deployed — production, staging, QA, or sandbox
            endpoints.
          </p>
          <button
            onClick={onOpenAddEnvironmentModal}
            className="px-4 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 border border-emerald-400/30"
          >
            <Plus className="w-4 h-4" /> Add Environment
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {environments.map((env) => {
          const app = apps.find((a) => a.id === env.appId);
          const envHref = safeUrl(env.url);
          return (
            <div
              key={env.id}
              className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs hover:border-[#27272a] transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-100">
                  {env.name} Target
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {env.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Application:</span>
                <button
                  onClick={() => app && onNavigateApp(app.id)}
                  className="font-bold text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  {app?.name || 'App'}
                </button>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 block mb-0.5">Endpoint URL:</span>
                {envHref ? (
                  <a
                    href={envHref}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-300 font-mono hover:text-emerald-400 inline-flex items-center gap-1 truncate max-w-full"
                  >
                    {env.url} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500 font-mono">{env.url || 'No URL set'}</span>
                )}
              </div>

              <div className="pt-2 border-t border-[#1e1e24] text-[10px] text-zinc-500 flex justify-between">
                <span>Last Pinged:</span>
                <span>{new Date(env.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
