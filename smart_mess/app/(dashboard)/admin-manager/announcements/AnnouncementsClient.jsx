'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Bell, Plus, Pin, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AnnouncementsClient({ userName, role }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'general',
    targetRoles: ['all'],
    isPublished: true,
    pinned: false,
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.data.announcements);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setMessage('Announcement created and published successfully!');
        setForm({
          title: '',
          content: '',
          type: 'general',
          targetRoles: ['all'],
          isPublished: true,
          pinned: false,
          expiresAt: '',
        });
        fetchAnnouncements();
      } else {
        setError(data.message || 'Failed to create announcement');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage('Announcement deleted.');
        fetchAnnouncements();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Notice Board & Announcements" subtitle="Broadcast holidays, menu updates and maintenance notices" role={role} userName={userName} />

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

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Active Notices</h3>
            <p className="text-xs text-slate-400">Broadcasted to students, kitchen staff, or all dashboards</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        </div>

        {/* Notices Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-slate-400">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="col-span-2 glass-card p-12 text-center rounded-2xl border border-white/5 text-slate-400">
              No announcements posted yet.
            </div>
          ) : (
            announcements.map(ann => (
              <div
                key={ann._id}
                className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  ann.pinned ? 'border-indigo-500/30 bg-indigo-500/[0.03]' : 'border-white/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {ann.pinned && (
                        <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                          <Pin className="w-3.5 h-3.5 fill-indigo-400" />
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                        {ann.type.replace('_', ' ')}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400">{formatDate(ann.createdAt)}</span>
                  </div>

                  <h4 className="text-base font-bold text-white">{ann.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 whitespace-pre-line leading-relaxed">{ann.content}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                  <span>Target: <strong className="text-slate-400 capitalize">{ann.targetRoles.join(', ')}</strong></span>
                  <button
                    onClick={() => handleDelete(ann._id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Announcement Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Post Notice Announcement
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notice Title *</label>
                <input
                  required
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Special Diwali Dinner & Mess Holiday Schedule"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Notice Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General Notice</option>
                    <option value="menu_change">Menu Change</option>
                    <option value="holiday">Holiday Notice</option>
                    <option value="timing_change">Timing Change</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Audience</label>
                  <select
                    value={form.targetRoles[0]}
                    onChange={e => setForm({ ...form, targetRoles: [e.target.value] })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="kitchen">Kitchen Staff Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notice Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  placeholder="Write announcement description..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pinned}
                    onChange={e => setForm({ ...form, pinned: e.target.checked })}
                    className="rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
                  />
                  Pin to Top
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={e => setForm({ ...form, isPublished: e.target.checked })}
                    className="rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
                  />
                  Publish Immediately
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {saving ? 'Posting...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
