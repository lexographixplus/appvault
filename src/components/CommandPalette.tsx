import React, { useState, useEffect, useRef } from 'react';
import { Search, Box, Server, ArrowRight, X, Sparkles, Plus, FileSpreadsheet } from 'lucide-react';
import { appStore } from '../lib/store';
import { AppItem, ResourceItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, entityId?: string) => void;
  onOpenCreateAppModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenCreateAppModal,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Esc closes. ⌘K/Ctrl+K is owned by App, which can open the palette as well
  // as close it — this component is unmounted while hidden.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const apps = appStore.getApps();
  const resources = appStore.getResources();

  const filteredApps = query.trim()
    ? apps.filter(
        (a) =>
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.description.toLowerCase().includes(query.toLowerCase()) ||
          a.platform.toLowerCase().includes(query.toLowerCase())
      )
    : apps.slice(0, 4);

  const filteredResources = query.trim()
    ? resources.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.category.toLowerCase().includes(query.toLowerCase()) ||
          r.provider.toLowerCase().includes(query.toLowerCase())
      )
    : resources.slice(0, 4);

  const handleSelectApp = (app: AppItem) => {
    onNavigate('app-detail', app.id);
    onClose();
  };

  const handleSelectResource = (res: ResourceItem) => {
    onNavigate('resources');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      role="presentation"
      className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150"
    >
      <div
        className="bg-[#121216] border border-[#1e1e24] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-[#1e1e24] flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applications, resources, or commands..."
            className="w-full bg-transparent text-sm font-medium text-zinc-100 focus:outline-none placeholder-zinc-500"
          />
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Scroll Area */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-96">
          {/* Quick Actions */}
          {!query.trim() && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                Quick Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenCreateAppModal();
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#18181c] hover:bg-[#202026] text-xs font-medium text-zinc-200 hover:text-emerald-400 transition-all cursor-pointer border border-[#27272a]"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Create Application</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate('sheets');
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#18181c] hover:bg-[#202026] text-xs font-medium text-zinc-200 hover:text-emerald-400 transition-all cursor-pointer border border-[#27272a]"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Google Sheets Sync</span>
                </button>
              </div>
            </div>
          )}

          {/* Applications */}
          {filteredApps.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Applications</span>
                <span className="text-[10px] text-zinc-500">{filteredApps.length} items</span>
              </div>
              <div className="space-y-1">
                {filteredApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleSelectApp(app)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18181c] text-left transition-colors cursor-pointer group border border-transparent hover:border-[#27272a]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Box className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                          <span>{app.name}</span>
                          <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#27272a] text-zinc-400">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate max-w-sm">
                          {app.platform || app.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Infrastructure Resources */}
          {filteredResources.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                <span>Resources</span>
                <span className="text-[10px] text-zinc-500">{filteredResources.length} items</span>
              </div>
              <div className="space-y-1">
                {filteredResources.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleSelectResource(res)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#18181c] text-left transition-colors cursor-pointer group border border-transparent hover:border-[#27272a]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-zinc-100">
                          {res.name}
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {res.provider} · {res.category}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredApps.length === 0 && filteredResources.length === 0 && (
            <div className="py-8 text-center text-zinc-500 text-xs">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0f0f12] border-t border-[#1e1e24] text-[11px] text-zinc-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Click a result to open it
          </span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
