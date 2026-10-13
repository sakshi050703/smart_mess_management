'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';

const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', snacks: '🍵', dinner: '🌙' };
const MEAL_COLORS = {
  breakfast: 'from-amber-500/20 to-yellow-500/10 border-amber-500/20',
  lunch: 'from-emerald-500/20 to-green-500/10 border-emerald-500/20',
  snacks: 'from-indigo-500/20 to-blue-500/10 border-indigo-500/20',
  dinner: 'from-purple-500/20 to-violet-500/10 border-purple-500/20',
};

export default function KitchenDashboardClient({ userName, role }) {
  const [menu, setMenu] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      fetch(`/api/menus?date=${today}&published=true`).then(r => r.json()),
      fetch(`/api/meal-bookings?date=${today}`).then(r => r.json()),
      fetch('/api/inventory?lowStock=true').then(r => r.json()),
    ]).then(([menuData, bookingData, invData]) => {
      if (menuData.success) setMenu(menuData.data.menus?.[0] || null);
      if (bookingData.success) setBookings(bookingData.data.bookings || []);
      if (invData.success) setInventory(invData.data.items || []);
    }).finally(() => setLoading(false));
  }, [today]);

  // Count bookings by meal type
  const bookingCounts = bookings.reduce((acc, b) => {
    if (b.status === 'confirmed') acc[b.mealType] = (acc[b.mealType] || 0) + 1;
    return acc;
  }, {});

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Kitchen Dashboard" subtitle={todayStr} role={role} userName={userName} />

      <div className="p-6 flex-1 animate-fade-in space-y-6">
        {/* Welcome */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-xl font-bold text-white">Kitchen Overview — {todayStr}</h2>
          <p className="text-slate-400 text-sm mt-1">Today's meal schedule and expected counts.</p>
        </div>

        {/* Low stock alert */}
        {inventory.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              ⚠️ Low Stock Alert ({inventory.length} items)
            </div>
            <div className="flex flex-wrap gap-2">
              {inventory.map(item => (
                <span key={item._id} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20">
                  {item.name}: {item.currentStock} {item.unit} left
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Today's meals */}
        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />)}
          </div>
        ) : !menu ? (
          <div className="empty-state">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-lg font-medium text-slate-400">No menu published today</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {menu.meals?.map(meal => (
              <div key={meal.type} className={`section-card bg-gradient-to-br ${MEAL_COLORS[meal.type]} border p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{MEAL_ICONS[meal.type]}</span>
                    <div>
                      <div className="text-white font-semibold capitalize">{meal.type}</div>
                      <div className="text-slate-400 text-xs">{meal.startTime} – {meal.endTime}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{bookingCounts[meal.type] || 0}</div>
                    <div className="text-slate-400 text-xs">expected</div>
                  </div>
                </div>
                <div className="separator" />
                <div className="mt-3">
                  <div className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wider">Menu Items</div>
                  <div className="flex flex-wrap gap-1.5">
                    {meal.items?.map((item, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded-full text-xs border ${item.isVeg ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-rose-400 bg-rose-400/10 border-rose-400/20'}`}>
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">Cutoff: {meal.cutoffTime}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick action links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: '/kitchen/preparation', icon: '🍳', label: 'Preparation' },
            { href: '/kitchen/attendance', icon: '✅', label: 'Mark Attendance' },
            { href: '/kitchen/wastage', icon: '🗑️', label: 'Record Wastage' },
            { href: '/kitchen/inventory', icon: '📦', label: 'Inventory' },
          ].map(item => (
            <a key={item.href} href={item.href} className="glass rounded-xl p-4 flex flex-col items-center gap-2 hover:border-indigo-500/30 transition-all text-center">
              <span className="text-2xl">{item.icon}</span>
              <span className="text-slate-300 text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
