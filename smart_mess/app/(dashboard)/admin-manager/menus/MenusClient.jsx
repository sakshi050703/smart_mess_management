'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';

const MEAL_TYPES = ['breakfast', 'lunch', 'snacks', 'dinner'];
const MEAL_TIMES = {
  breakfast: { start: '07:30', end: '09:30', cutoff: '07:00' },
  lunch: { start: '12:30', end: '14:30', cutoff: '12:00' },
  snacks: { start: '17:00', end: '18:00', cutoff: '16:30' },
  dinner: { start: '20:00', end: '21:30', cutoff: '19:30' },
};

export default function MenusClient({ role, userName }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    isPublished: false,
    notes: '',
    meals: MEAL_TYPES.map(type => ({
      type,
      startTime: MEAL_TIMES[type].start,
      endTime: MEAL_TIMES[type].end,
      cutoffTime: MEAL_TIMES[type].cutoff,
      isEnabled: true,
      items: [{ name: '', isVeg: true }],
    })),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/menus');
    const data = await res.json();
    if (data.success) setMenus(data.data.menus);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  function addItem(mealIdx) {
    const updated = [...form.meals];
    updated[mealIdx].items.push({ name: '', isVeg: true });
    setForm({ ...form, meals: updated });
  }

  function updateItem(mealIdx, itemIdx, field, value) {
    const updated = [...form.meals];
    updated[mealIdx].items[itemIdx][field] = value;
    setForm({ ...form, meals: updated });
  }

  function removeItem(mealIdx, itemIdx) {
    const updated = [...form.meals];
    updated[mealIdx].items.splice(itemIdx, 1);
    setForm({ ...form, meals: updated });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      meals: form.meals.filter(m => m.isEnabled).map(m => ({ ...m, items: m.items.filter(i => i.name.trim()) })),
    };
    const res = await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      fetchMenus();
    } else {
      setError(data.message || 'Failed to create menu');
    }
    setSaving(false);
  }

  async function togglePublish(id, current) {
    await fetch(`/api/menus/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !current }),
    });
    fetchMenus();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Menu Management" subtitle="Create and publish daily menus" role={role} userName={userName} />

      <div className="p-6 flex-1 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div />
          <button onClick={() => setShowModal(true)} className="btn-primary">+ Create Menu</button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : menus.length === 0 ? (
          <div className="empty-state">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-lg font-medium text-slate-400">No menus yet</p>
            <p className="text-sm">Create your first daily menu.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map(menu => (
              <div key={menu._id} className="section-card p-4 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-white font-semibold">{formatDate(menu.date)}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{menu.meals?.length || 0} meal types</div>
                  </div>
                  <span className={`badge ${menu.isPublished ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
                    {menu.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  {menu.meals?.map(meal => (
                    <div key={meal.type} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 w-20 capitalize">{meal.type}</span>
                      <span className="text-slate-400">{meal.startTime}–{meal.endTime}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 truncate">{meal.items?.slice(0, 2).map(i => i.name).join(', ')}{meal.items?.length > 2 ? '…' : ''}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => togglePublish(menu._id, menu.isPublished)}
                  className={menu.isPublished ? 'btn-secondary btn-sm w-full' : 'btn-primary btn-sm w-full'}
                >
                  {menu.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Menu Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl my-8 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">Create Daily Menu</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date *</label>
                  <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 accent-indigo-500" />
                    <span className="text-slate-300 text-sm">Publish immediately</span>
                  </label>
                </div>
              </div>

              {form.meals.map((meal, mi) => (
                <div key={meal.type} className="border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={meal.isEnabled} onChange={e => { const m = [...form.meals]; m[mi].isEnabled = e.target.checked; setForm({ ...form, meals: m }); }} className="accent-indigo-500" />
                      <span className="text-white font-medium capitalize">{meal.type}</span>
                    </div>
                    {meal.isEnabled && (
                      <div className="flex gap-2 text-xs">
                        <input className="input w-20 text-xs py-1" type="time" value={meal.startTime} onChange={e => { const m = [...form.meals]; m[mi].startTime = e.target.value; setForm({ ...form, meals: m }); }} />
                        <span className="text-slate-500 py-1">–</span>
                        <input className="input w-20 text-xs py-1" type="time" value={meal.endTime} onChange={e => { const m = [...form.meals]; m[mi].endTime = e.target.value; setForm({ ...form, meals: m }); }} />
                        <span className="text-slate-500 py-1 ml-1">cutoff</span>
                        <input className="input w-20 text-xs py-1" type="time" value={meal.cutoffTime} onChange={e => { const m = [...form.meals]; m[mi].cutoffTime = e.target.value; setForm({ ...form, meals: m }); }} />
                      </div>
                    )}
                  </div>
                  {meal.isEnabled && (
                    <div className="space-y-2">
                      {meal.items.map((item, ii) => (
                        <div key={ii} className="flex gap-2">
                          <input className="input flex-1 text-sm py-1.5" placeholder="Item name" value={item.name} onChange={e => updateItem(mi, ii, 'name', e.target.value)} />
                          <label className="flex items-center gap-1 text-xs text-slate-400">
                            <input type="checkbox" checked={item.isVeg} onChange={e => updateItem(mi, ii, 'isVeg', e.target.checked)} className="accent-emerald-500" />Veg
                          </label>
                          {meal.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(mi, ii)} className="text-rose-400 hover:text-rose-300 text-sm px-1">✕</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={() => addItem(mi)} className="text-indigo-400 text-xs hover:text-indigo-300">+ Add item</button>
                    </div>
                  )}
                </div>
              ))}

              <div>
                <label className="label">Notes</label>
                <input className="input" placeholder="Optional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Creating...' : 'Create Menu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
