import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import { appStore } from '../lib/store';
import { SheetsConfig } from '../types';
import { GOOGLE_APPS_SCRIPT_CODE } from '../lib/appsScriptTemplate';

export const GoogleSheetsView: React.FC = () => {
  const [config, setConfig] = useState<SheetsConfig>(appStore.getSheetsConfig());
  const [urlInput, setUrlInput] = useState(config.webAppUrl);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      const latest = appStore.getSheetsConfig();
      setConfig(latest);
    });
    return unsubscribe;
  }, []);

  const handleSaveUrl = () => {
    appStore.updateSheetsConfig({ webAppUrl: urlInput.trim() });
    setActionMessage({ type: 'success', text: 'Google Sheets Web App URL saved successfully!' });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await appStore.testSheetsConnection(urlInput);
    setTestResult(result);
    setTesting(false);
  };

  const handlePushToSheets = async () => {
    setPushing(true);
    setActionMessage(null);
    const res = await appStore.pushToSheets(false);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    setPushing(false);
  };

  const handlePullFromSheets = async () => {
    setPulling(true);
    setActionMessage(null);
    const res = await appStore.pullFromSheets(false);
    setActionMessage({ type: res.success ? 'success' : 'error', text: res.message });
    setPulling(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-[#121216] p-6 rounded-2xl border border-[#1e1e24] text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              Google Sheets Cloud Database Sync
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Use any Google Sheet as your cloud database. AppVault synchronizes applications, infrastructure resources, connections, dependencies, and audit logs automatically in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://sheets.new"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm cursor-pointer border border-emerald-400/30"
          >
            Create New Sheet <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Connection Config Card */}
      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e1e24] pb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Web App Endpoint Configuration
            </h3>
            <p className="text-xs text-zinc-400">Paste your deployed Google Apps Script Web App URL below</p>
          </div>

          <div className="flex items-center gap-2">
            {config.lastSyncStatus === 'success' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            )}
            {config.lastSyncTime && (
              <span className="text-[11px] text-zinc-500">
                Last sync: {new Date(config.lastSyncTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Input & Action buttons */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-zinc-300 block">
            Google Apps Script Web App URL:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 bg-[#18181c] border border-[#27272a] rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={handleSaveUrl}
              className="px-4 py-2 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 border border-emerald-400/30"
            >
              Save URL
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 bg-[#18181c] border border-[#27272a] hover:bg-[#202026] text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {testResult.message}{' '}
              {testResult.latencyMs && (
                <span className="font-mono text-[11px]">({testResult.latencyMs}ms response latency)</span>
              )}
            </div>
          )}

          {actionMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {actionMessage.text}
            </div>
          )}
        </div>

        {/* Sync Action Buttons */}
        <div className="pt-4 border-t border-[#1e1e24] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePushToSheets}
              disabled={pushing}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs border border-emerald-400/30"
            >
              <ArrowUpRight className={`w-4 h-4 ${pushing ? 'animate-spin' : ''}`} />
              <span>Push Local State to Sheets</span>
            </button>

            <button
              onClick={handlePullFromSheets}
              disabled={pulling}
              className="px-4 py-2 bg-[#18181c] border border-[#27272a] hover:bg-[#202026] text-zinc-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <ArrowDownRight className={`w-4 h-4 ${pulling ? 'animate-spin' : ''}`} />
              <span>Pull Sheets Data to Local</span>
            </button>
          </div>

          {/* Auto-sync Settings */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-300">
              <input
                type="checkbox"
                checked={config.autoSyncEnabled}
                onChange={(e) => appStore.updateSheetsConfig({ autoSyncEnabled: e.target.checked })}
                className="rounded border-[#27272a] text-emerald-500 focus:ring-emerald-500 bg-[#18181c]"
              />
              <span>Background Auto-Sync</span>
            </label>

            <select
              value={config.pollIntervalSeconds}
              onChange={(e) => appStore.updateSheetsConfig({ pollIntervalSeconds: Number(e.target.value) })}
              className="bg-[#18181c] border border-[#27272a] rounded-lg px-2 py-1 text-xs text-zinc-200 cursor-pointer"
            >
              <option value={10}>Every 10s</option>
              <option value={15}>Every 15s</option>
              <option value={30}>Every 30s</option>
              <option value={60}>Every 60s</option>
            </select>
          </div>
        </div>
      </div>

      {/* Apps Script Setup Instructions & Code Copy */}
      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e1e24] pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Google Apps Script Backend Code
            </h3>
            <p className="text-xs text-zinc-400">Copy &amp; paste this script into Google Sheets Apps Script</p>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs border border-emerald-400/30"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Code Copied!' : 'Copy Script Code'}</span>
          </button>
        </div>

        {/* Step by step guide */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#18181c] rounded-xl border border-[#27272a]">
            <span className="font-bold text-emerald-400 block mb-1">Step 1</span>
            Open a Google Sheet (<code className="bg-[#27272a] px-1 rounded text-emerald-400">sheets.new</code>)
          </div>
          <div className="p-3 bg-[#18181c] rounded-xl border border-[#27272a]">
            <span className="font-bold text-emerald-400 block mb-1">Step 2</span>
            Click <strong>Extensions &gt; Apps Script</strong>
          </div>
          <div className="p-3 bg-[#18181c] rounded-xl border border-[#27272a]">
            <span className="font-bold text-emerald-400 block mb-1">Step 3</span>
            Paste the copied snippet and click <strong>Deploy &gt; New deployment</strong>
          </div>
          <div className="p-3 bg-[#18181c] rounded-xl border border-[#27272a]">
            <span className="font-bold text-emerald-400 block mb-1">Step 4</span>
            Set <em>Execute as: Me</em> &amp; <em>Access: Anyone</em>, then copy Web App URL
          </div>
        </div>

        {/* Code View Box */}
        <div className="relative rounded-xl overflow-hidden bg-[#09090B] text-zinc-300 border border-[#27272a] p-4 font-mono text-xs max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
        </div>
      </div>

      {/* Sheet Structure Preview */}
      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-zinc-100">
          Database Sheet Schema Blueprint
        </h3>
        <p className="text-xs text-zinc-400">
          The Apps Script backend will automatically create and format the following tabs in your Google Sheet:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
          {['Apps', 'Resources', 'Connections', 'Dependencies', 'Environments', 'Activity'].map((tab) => (
            <div
              key={tab}
              className="p-3 bg-[#18181c] border border-[#27272a] rounded-xl text-center"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="font-bold text-zinc-100 block">{tab}</span>
              <span className="text-[10px] text-zinc-500 block">Tab Sheet</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
