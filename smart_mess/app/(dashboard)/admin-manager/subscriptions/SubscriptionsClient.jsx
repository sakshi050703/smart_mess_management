'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Calendar, Plus, Search, Filter, CheckCircle2, AlertTriangle, User } from 'lucide-react';

export default function SubscriptionsClient({ userName, role }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    studentId: '',
    mealPlanId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    let url = `/api/subscriptions?`;
    if (statusFilter) url += `status=${statusFilter}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSubscriptions(data.data.subscriptions);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Load students & plans when modal opens
  const openModal = async () => {
    setError('');
    setShowAddModal(true);
    try {
      const [uRes, pRes] = await Promise.all([
        fetch('/api/users?role=student&limit=100'),
        fetch('/api/meal-plans?activeOnly=true'),
      ]);
      const uData = await uRes.json();
      const pData = await pRes.json();
      if (uData.success) setStudents(uData.data.users);
      if (pData.success) {
        setPlans(pData.data.mealPlans);
        if (pData.data.mealPlans.length > 0) {
          const firstPlan = pData.data.mealPlans[0];
          const start = new Date();
          const end = new Date(start);
          end.setDate(end.getDate() + (firstPlan.durationDays || 30));
          setForm(prev => ({
            ...prev,
            mealPlanId: firstPlan._id,
            endDate: end.toISOString().split('T')[0],
          }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(p => p._id === planId);
    let newEnd = form.endDate;
    if (selectedPlan && form.startDate) {
      const start = new Date(form.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + (selectedPlan.durationDays || 30));
      newEnd = end.toISOString().split('T')[0];
    }
    setForm({ ...form, mealPlanId: planId, endDate: newEnd });
  };

  const handleAddSubscription = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setMessage('Subscription created and bill generated automatically!');
        fetchSubscriptions();
      } else {
        setError(data.message || 'Failed to create subscription');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Subscriptions" subtitle="Manage student meal plans and active memberships" role={role} userName={userName} />

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

        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Subscription Statuses</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <span className="text-xs text-slate-400">Total: {subscriptions.length}</span>
          </div>

          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Assign Subscription
          </button>
        </div>

        {/* Subscriptions Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5">Plan</th>
                  <th className="py-4 px-5">Duration</th>
                  <th className="py-4 px-5">Fee</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">Loading subscriptions...</td>
                  </tr>
                ) : subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-slate-400">No subscriptions found.</td>
                  </tr>
                ) : (
                  subscriptions.map(sub => (
                    <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-white">{sub.student?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400 font-mono">{sub.student?.studentId || sub.student?.email}</p>
                      </td>
                      <td className="py-4 px-5 text-slate-200 font-medium">
                        {sub.mealPlan?.name || 'Custom Plan'}
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs">
                        {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                      </td>
                      <td className="py-4 px-5 font-semibold text-indigo-400">
                        {formatCurrency(sub.priceInPaise)}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                          sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          sub.status === 'expired' ? 'bg-slate-800 text-slate-400 border-white/5' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {formatDate(sub.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Subscription Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Assign Student Subscription
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Select Student *</label>
                <select
                  required
                  value={form.studentId}
                  onChange={e => setForm({ ...form, studentId: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Select Meal Plan *</label>
                <select
                  required
                  value={form.mealPlanId}
                  onChange={e => handlePlanChange(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {plans.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {formatCurrency(p.priceInPaise)} ({p.durationDays} days)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Start Date *</label>
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">End Date *</label>
                  <input
                    required
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional notes"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * An invoice bill will automatically be generated for this student with payment due 7 days after period end.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {saving ? 'Creating...' : 'Assign & Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
