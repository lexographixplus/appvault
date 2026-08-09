import React from 'react';
import { Download, Upload, RotateCcw, ShieldAlert, Palette } from 'lucide-react';
import { appStore } from '../lib/store';
import { downloadBlob } from '../lib/download';

interface SettingsViewProps {
  onShowToast: (msg: string, type?: 'success' | 'error') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const handleExport = () => {
    const blob = new Blob([appStore.exportFullJson()], { type: 'application/json' });
    downloadBlob(blob, `appvault-backup-${new Date().toISOString().slice(0, 10)}.json`);
    onShowToast('Database exported successfully as JSON!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = appStore.importFullJson(content);
        onShowToast(
          ok ? 'Database successfully restored from JSON backup!' : 'Failed to parse JSON backup file.',
          ok ? 'success' : 'error'
        );
      }
      // Reset so re-selecting the same file fires another change event.
      input.value = '';
    };
    reader.onerror = () => {
      onShowToast('Could not read the selected file.', 'error');
      input.value = '';
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset database back to default seed data? All custom edits will be replaced.')) {
      appStore.resetToDemoData();
      onShowToast('Database reset to original seed blueprint.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            AppVault Settings &amp; Data Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Appearance themes, JSON backups, and seed data controls.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance Card */}
        <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-400" />
            Appearance
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            AppVault ships with a single dark theme tuned for long console sessions. A light
            theme is not available yet.
          </p>
          <div className="flex items-center gap-2 py-2 px-4 rounded-xl bg-[#18181c] border border-[#27272a]">
            <span className="w-3.5 h-3.5 rounded-full bg-[#09090b] border border-[#3f3f46]" />
            <span className="text-xs font-semibold text-zinc-200">Dark (default)</span>
          </div>
        </div>

        {/* Backup & Data Card */}
        <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" /> Backup &amp; Restore
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Export a complete JSON snapshot of your applications, resources, and connections.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs border border-emerald-400/30"
            >
              <Download className="w-3.5 h-3.5" /> Export Backup
            </button>
            <label className="flex-1 py-2 px-3 bg-[#18181c] hover:bg-[#202026] text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 border border-[#27272a]">
              <Upload className="w-3.5 h-3.5" /> Import Backup
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" /> Database Reset
        </h3>
        <p className="text-xs text-rose-300 leading-relaxed">
          Need to start over? Reset your local database back to the default organizational seed data.
        </p>
        <button
          onClick={handleResetDemo}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset Database to Seed Data
        </button>
      </div>
    </div>
  );
};
