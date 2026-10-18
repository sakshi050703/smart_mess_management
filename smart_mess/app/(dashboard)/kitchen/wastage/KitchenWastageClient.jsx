'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Trash2, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function KitchenWastageClient({ userName, role }) {
  const [wastageList, setWastageList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    totalQuantityKg: '',
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

  const handleSubmit = async (e) => {
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
          preparedQuantity: Number(form.preparedQuantity || 0),
          servedQuantity: Number(form.servedQuantity || 0),
          notes: form.notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Leftover wastage recorded successfully!');
        setForm({
          date: new Date().toISOString().split('T')[0],
          mealType: 'lunch',
          totalQuantityKg: '',
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

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Kitchen Food Wastage Log" subtitle="Record daily left-over weights and excess cooking" role={role} userName={userName} />

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Record Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Log Meal Leftovers
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Meal</label>
                <select
                  value={form.mealType}
                  onChange={e => setForm({ ...form, mealType: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="snacks">Snacks</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Wasted Weight (Kg) *</label>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={form.totalQuantityKg}
                  onChange={e => setForm({ ...form, totalQuantityKg: e.target.value })}
                  placeholder="e.g. 5.5"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Cooked Portions</label>
                  <input
                    type="number"
                    value={form.preparedQuantity}
                    onChange={e => setForm({ ...form, preparedQuantity: e.target.value })}
                    placeholder="200"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Served Portions</label>
                  <input
                    type="number"
                    value={form.servedQuantity}
                    onChange={e => setForm({ ...form, servedQuantity: e.target.value })}
                    placeholder="180"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Excess cooked rice"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30"
              >
                {saving ? 'Logging...' : 'Log Leftover Waste'}
              </button>
            </form>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 glass-card rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-bold text-white text-sm">Recent Wastage History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Meal</th>
                    <th className="py-3 px-4">Weight (Kg)</th>
                    <th className="py-3 px-4">Cooked / Served</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">Loading records...</td>
                    </tr>
                  ) : wastageList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-400">No entries yet.</td>
                    </tr>
                  ) : (
                    wastageList.map(w => (
                      <tr key={w._id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-slate-300">{formatDate(w.date)}</td>
                        <td className="py-3 px-4 capitalize font-semibold text-white">{w.mealType}</td>
                        <td className="py-3 px-4 font-bold text-rose-400">{w.totalQuantityKg} Kg</td>
                        <td className="py-3 px-4 text-slate-400">{w.preparedQuantity || '—'} / {w.servedQuantity || '—'}</td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs">{w.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
