'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Trash2, Plus, AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function WastageClient({ userName, role }) {
  const [wastageList, setWastageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    totalQuantityKg: '',
    estimatedValueInRupees: '',
    preparedQuantity: '',
    servedQuantity: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchWastage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wastage');
      const data = await res.json();
      if (data.success) {
        setWastageList(data.data.wastage);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWastage();
  }, [fetchWastage]);

  const handleRecordWastage = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          mealType: form.mealType,
          totalQuantityKg: Number(form.totalQuantityKg || 0),
          estimatedValueInPaise: Math.round(Number(form.estimatedValueInRupees || 0) * 100),
          preparedQuantity: Number(form.preparedQuantity || 0),
          servedQuantity: Number(form.servedQuantity || 0),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setMessage('Food wastage logged successfully.');
        setForm({
          date: new Date().toISOString().split('T')[0],
          mealType: 'lunch',
          totalQuantityKg: '',
          estimatedValueInRupees: '',
          preparedQuantity: '',
          servedQuantity: '',
          notes: '',
        });
        fetchWastage();
      } else {
        setError(data.message || 'Failed to record wastage');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setSaving(false);
  };

  const totalKg = wastageList.reduce((acc, w) => acc + (w.totalQuantityKg || 0), 0);
  const totalCost = wastageList.reduce((acc, w) => acc + (w.estimatedValueInPaise || 0), 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Food Wastage Tracking" subtitle="Log daily left-overs, excess preparation and monetary losses" role={role} userName={userName} />

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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Waste Recorded</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{totalKg.toFixed(1)} Kg</h3>
              <p className="text-xs text-slate-500 mt-1">Total quantity discarded</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Food Cost Loss</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{formatCurrency(totalCost)}</h3>
              <p className="text-xs text-slate-500 mt-1">Financial impact of leftovers</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recorded Incidents</p>
              <h3 className="text-2xl font-bold text-white mt-1">{wastageList.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Meal waste log entries</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Wastage Log History</h3>
            <p className="text-xs text-slate-400">Entries recorded by kitchen staff and mess managers</p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Record Wastage
          </button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Meal</th>
                  <th className="py-4 px-5">Wasted Qty (Kg)</th>
                  <th className="py-4 px-5">Est. Cost Loss</th>
                  <th className="py-4 px-5">Prepared / Served</th>
                  <th className="py-4 px-5">Logged By</th>
                  <th className="py-4 px-5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">Loading wastage entries...</td>
                  </tr>
                ) : wastageList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400">No wastage entries logged. Kitchen efficiency is 100%!</td>
                  </tr>
                ) : (
                  wastageList.map(w => (
                    <tr key={w._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {formatDate(w.date)}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 font-medium">
                        {w.mealType}
                      </td>
                      <td className="py-4 px-5 font-bold text-rose-400">
                        {w.totalQuantityKg} Kg
                      </td>
                      <td className="py-4 px-5 text-amber-400 font-semibold">
                        {w.estimatedValueInPaise ? formatCurrency(w.estimatedValueInPaise) : '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-300 text-xs font-mono">
                        {w.preparedQuantity || '—'} / {w.servedQuantity || '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {w.recordedBy?.name || 'Staff'}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs max-w-xs truncate">
                        {w.notes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Wastage Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Record Food Wastage
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleRecordWastage} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Meal *</label>
                  <select
                    value={form.mealType}
                    onChange={e => setForm({ ...form, mealType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Wasted Quantity (Kg) *</label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={form.totalQuantityKg}
                    onChange={e => setForm({ ...form, totalQuantityKg: e.target.value })}
                    placeholder="e.g. 8.5"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Estimated Cost Loss (₹)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.estimatedValueInRupees}
                    onChange={e => setForm({ ...form, estimatedValueInRupees: e.target.value })}
                    placeholder="e.g. 450"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Prepared Portions</label>
                  <input
                    type="number"
                    value={form.preparedQuantity}
                    onChange={e => setForm({ ...form, preparedQuantity: e.target.value })}
                    placeholder="e.g. 200"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Served Portions</label>
                  <input
                    type="number"
                    value={form.servedQuantity}
                    onChange={e => setForm({ ...form, servedQuantity: e.target.value })}
                    placeholder="e.g. 175"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Excess rice prepared; weekend absence"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
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
                  {saving ? 'Logging...' : 'Save Wastage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
