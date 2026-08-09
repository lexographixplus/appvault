import React, { useState } from 'react';
import { Activity, Clock, Filter, Search, ShieldCheck } from 'lucide-react';
import { ActivityItem } from '../types';

interface ActivityViewProps {
  activities: ActivityItem[];
}

export const ActivityView: React.FC<ActivityViewProps> = ({ activities }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('All');

  const filtered = activities.filter((act) => {
    const matchesSearch =
      act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.entityId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEntity = entityFilter === 'All' || act.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
            Audit Activity Log
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Immutable audit trail of all additions, edits, deletions, and Google Sheets sync operations.
          </p>
        </div>
      </div>

      <div className="bg-[#121216] p-4 rounded-2xl border border-[#1e1e24] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity description..."
            className="w-full bg-[#18181c] border border-[#27272a] rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-[#18181c] border border-[#27272a] rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
        >
          <option value="All">All Entities</option>
          <option value="Application">Application</option>
          <option value="Resource">Resource</option>
          <option value="Connection">Connection</option>
          <option value="Dependency">Dependency</option>
          <option value="Environment">Environment</option>
          <option value="GoogleSheets">Google Sheets</option>
          <option value="System">System</option>
        </select>
      </div>

      <div className="bg-[#121216] rounded-2xl border border-[#1e1e24] p-6 shadow-xs">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">No activity logs recorded.</div>
        ) : (
          <div className="relative border-l-2 border-[#1e1e24] ml-4 pl-6 space-y-6">
            {filtered.map((act) => (
              <div key={act.id} className="relative group">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#121216] shadow-xs" />

                <div className="bg-[#18181c] p-3.5 rounded-xl border border-[#27272a]">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider">
                      {act.entityType} · {act.action}
                    </span>
                    <span className="text-zinc-500 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(act.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    {act.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
