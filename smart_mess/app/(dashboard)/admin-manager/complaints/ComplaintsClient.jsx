'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { AlertCircle, CheckCircle2, ShieldAlert, Filter, Edit, Clock, ShieldCheck } from 'lucide-react';

export default function ComplaintsClient({ userName, role }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [actionForm, setActionForm] = useState({
    status: 'resolved',
    resolution: '',
    managerNotes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    let url = `/api/complaints?`;
    if (statusFilter) url += `status=${statusFilter}&`;
    if (priorityFilter) url += `priority=${priorityFilter}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setSaving(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedComplaint._id,
          status: actionForm.status,
          resolution: actionForm.resolution,
          managerNotes: actionForm.managerNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedComplaint(null);
        setMessage('Complaint updated successfully.');
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const openActionModal = (c) => {
    setSelectedComplaint(c);
    setActionForm({
      status: c.status === 'open' ? 'in_progress' : c.status,
      resolution: c.resolution || '',
      managerNotes: c.managerNotes || '',
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Grievances & Complaints" subtitle="Resolve student food, hygiene and facility tickets" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </span>
            <button onClick={() => setMessage('')} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">{complaints.length} complaints listed</span>
        </div>

        {/* Complaints Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Ticket / Student</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Priority</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Filed Date</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading complaints...</td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No complaints matching the selected filters.</td>
                  </tr>
                ) : (
                  complaints.map(c => (
                    <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-white">{c.title}</p>
                        <p className="text-xs text-slate-400">
                          {c.student?.name} ({c.student?.studentId || 'ID'})
                        </p>
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 text-xs">
                        {c.category?.replace('_', ' ')}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          c.priority === 'urgent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          c.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-slate-800 text-slate-400 border-white/5'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                          c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => openActionModal(c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Update / Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action / Resolution Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Update Complaint Ticket
            </h3>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">{selectedComplaint.title}</p>
              <p className="text-slate-400">{selectedComplaint.description}</p>
            </div>

            <form onSubmit={handleUpdateComplaint} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Status *</label>
                <select
                  value={actionForm.status}
                  onChange={e => setActionForm({ ...actionForm, status: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Resolution Note (Visible to Student)</label>
                <textarea
                  rows={3}
                  value={actionForm.resolution}
                  onChange={e => setActionForm({ ...actionForm, resolution: e.target.value })}
                  placeholder="Explain corrective measures taken..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Internal Manager Notes (Optional)</label>
                <input
                  type="text"
                  value={actionForm.managerNotes}
                  onChange={e => setActionForm({ ...actionForm, managerNotes: e.target.value })}
                  placeholder="Internal notes for mess administration"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {saving ? 'Updating...' : 'Save Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
