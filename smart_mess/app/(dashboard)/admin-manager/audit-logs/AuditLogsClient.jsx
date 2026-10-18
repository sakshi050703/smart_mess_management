'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, Filter, Clock, UserCheck } from 'lucide-react';

export default function AuditLogsClient({ userName, role }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let url = `/api/audit-logs?`;
    if (actionFilter) url += `action=${actionFilter}&`;
    if (entityFilter) url += `entity=${entityFilter}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data.logs);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [actionFilter, entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="System Audit Logs" subtitle="Immutable activity ledger of administrative modifications" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Filter bar */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Entities</option>
              <option value="Payment">Payment</option>
              <option value="Bill">Bill</option>
              <option value="User">User</option>
              <option value="Subscription">Subscription</option>
              <option value="Menu">Menu</option>
              <option value="Inventory">Inventory</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">Total Audit Events: {logs.length}</span>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Action</th>
                  <th className="py-4 px-5">Entity</th>
                  <th className="py-4 px-5">Performed By</th>
                  <th className="py-4 px-5">Summary / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">Loading audit trail...</td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">No audit log entries found.</td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-slate-400 text-xs font-mono">
                        {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-semibold text-white">
                        {log.entity}
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs">
                        {log.performedBy?.name || 'System / Admin'}
                        <p className="text-slate-500 text-[10px]">{log.performedBy?.email}</p>
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs max-w-sm truncate">
                        {log.notes || (log.newData ? JSON.stringify(log.newData) : '—')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
