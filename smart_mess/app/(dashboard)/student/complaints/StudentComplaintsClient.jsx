'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { AlertCircle, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function StudentComplaintsClient({ userName, role }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'food_quality',
    priority: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data.complaints);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setMessage('Your complaint has been submitted successfully.');
        setForm({ title: '', description: '', category: 'food_quality', priority: 'medium' });
        fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Complaints & Grievances" subtitle="Report issues directly to mess management" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Your Registered Complaints</h3>
            <p className="text-xs text-slate-400">Track resolution progress and manager responses</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Raise New Complaint
          </button>
        </div>

        {/* Complaints list */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400">
              No complaints filed. We hope your mess experience is smooth!
            </div>
          ) : (
            complaints.map(c => (
              <div key={c._id} className="glass-card p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-slate-400 capitalize">
                      Category: {c.category.replace('_', ' ')} • Filed on {formatDate(c.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      c.priority === 'urgent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      c.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-slate-800 text-slate-400 border-white/5'
                    }`}>
                      {c.priority}
                    </span>

                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${
                      c.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      c.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300">{c.description}</p>

                {c.resolution && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5 text-emerald-200">
                      <ShieldCheck className="w-4 h-4" /> Resolution:
                    </p>
                    <p className="text-slate-300">{c.resolution}</p>
                    {c.resolvedAt && (
                      <p className="text-[10px] text-slate-500 mt-1">Resolved on {formatDate(c.resolvedAt)}</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Lodge a Complaint
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Complaint Title *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Cold food served during dinner"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="food_quality">Food Quality</option>
                    <option value="hygiene">Hygiene & Cleanliness</option>
                    <option value="service">Service & Speed</option>
                    <option value="billing">Billing Issue</option>
                    <option value="staff">Staff Behavior</option>
                    <option value="facilities">Mess Facilities</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm({ ...form, priority: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Please provide details regarding the issue..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
