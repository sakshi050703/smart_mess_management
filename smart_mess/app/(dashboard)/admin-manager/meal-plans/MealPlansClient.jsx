'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency } from '@/lib/utils';
import { Utensils, Plus, Check, CheckCircle2, Clock } from 'lucide-react';

export default function MealPlansClient({ userName, role }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationDays: 30,
    priceInRupees: '',
    includedMeals: { breakfast: true, lunch: true, snacks: false, dinner: true },
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meal-plans');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data.mealPlans);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          durationDays: Number(form.durationDays),
          priceInPaise: Math.round(Number(form.priceInRupees) * 100),
          includedMeals: form.includedMeals,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setMessage('Meal plan created successfully!');
        setForm({
          name: '',
          description: '',
          durationDays: 30,
          priceInRupees: '',
          includedMeals: { breakfast: true, lunch: true, snacks: false, dinner: true },
        });
        fetchPlans();
      } else {
        setError(data.message || 'Failed to create plan');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setSaving(false);
  };

  const handleToggleActive = async (plan) => {
    try {
      const res = await fetch(`/api/meal-plans/${plan._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Plan ${plan.name} updated.`);
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meal Plans" subtitle="Configure subscription packages and pricing" role={role} userName={userName} />

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
            <h3 className="text-lg font-bold text-white">Active & Inactive Plans</h3>
            <p className="text-xs text-slate-400">Students can subscribe to any active meal package</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            Create Meal Plan
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-12 text-slate-400">Loading meal plans...</div>
          ) : plans.length === 0 ? (
            <div className="col-span-3 glass-card p-12 text-center rounded-2xl border border-white/5 text-slate-400">
              No meal plans defined yet. Create your first plan above.
            </div>
          ) : (
            plans.map(plan => (
              <div
                key={plan._id}
                className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  plan.isActive ? 'border-white/5' : 'border-white/5 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {plan.durationDays} Days Plan
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      plan.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white">{plan.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description || 'Standard food package'}</p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">{formatCurrency(plan.priceInPaise)}</span>
                    <span className="text-xs text-slate-500">/ period</span>
                  </div>

                  {/* Included Meals */}
                  <div className="mt-4 space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Daily Meals:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['breakfast', 'lunch', 'snacks', 'dinner'].map(m => (
                        <div key={m} className="flex items-center gap-1.5">
                          {plan.includedMeals?.[m] ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <span className="w-3.5 h-3.5 text-slate-600 text-center">✕</span>
                          )}
                          <span className={plan.includedMeals?.[m] ? 'text-slate-200 capitalize' : 'text-slate-500 line-through capitalize'}>
                            {m}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      plan.isActive
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Create New Meal Plan
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Plan Name *</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Monthly Standard (3 Meals)"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Includes breakfast, lunch, and dinner with Sunday specials"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Duration (Days) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.durationDays}
                    onChange={e => setForm({ ...form, durationDays: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Price (₹ INR) *</label>
                  <input
                    required
                    type="number"
                    step="any"
                    min="0"
                    value={form.priceInRupees}
                    onChange={e => setForm({ ...form, priceInRupees: e.target.value })}
                    placeholder="e.g. 3500"
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Included Daily Meals</label>
                <div className="grid grid-cols-2 gap-3">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                    <label key={meal} className="flex items-center gap-2 text-xs text-slate-200 capitalize cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.includedMeals[meal]}
                        onChange={e =>
                          setForm({
                            ...form,
                            includedMeals: { ...form.includedMeals, [meal]: e.target.checked },
                          })
                        }
                        className="rounded bg-slate-900 border-white/20 text-indigo-600 focus:ring-0"
                      />
                      {meal}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
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
                  {saving ? 'Saving...' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
