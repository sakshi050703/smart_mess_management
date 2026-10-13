'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { ChefHat, Users, Clock, AlertTriangle, Utensils, CheckCircle2 } from 'lucide-react';

export default function PreparationClient({ userName, role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/dashboard/kitchen');
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const menu = data?.todayMenu;
  const expectedMeals = data?.expectedMeals || {};
  const servedCounts = data?.servedCounts || {};

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', defaultTime: '07:30 - 09:30' },
    { key: 'lunch', label: 'Lunch', defaultTime: '12:30 - 14:30' },
    { key: 'snacks', label: 'Evening Snacks', defaultTime: '17:00 - 18:30' },
    { key: 'dinner', label: 'Dinner', defaultTime: '19:30 - 21:30' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meal Preparation Guide" subtitle="Daily cooking estimates, diner counts and portion sizing" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Banner */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-emerald-400" />
              Kitchen Cooking Schedule for Today
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Expected counts are computed dynamically from active student subscriptions minus recorded meal skips.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {menu ? 'Active Menu Loaded' : 'Menu Not Published Yet'}
          </span>
        </div>

        {/* Preparation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mealTypes.map(m => {
            const menuMeal = menu?.meals?.find(item => item.mealType === m.key || item.type === m.key);
            const expected = expectedMeals[m.key] || 0;
            const served = servedCounts[m.key] || 0;

            return (
              <div key={m.key} className="glass-card p-6 rounded-3xl border border-white/5 space-y-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white capitalize">{m.label}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {menuMeal?.timing?.start ? `${menuMeal.timing.start} - ${menuMeal.timing.end}` : m.defaultTime}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-emerald-400">{expected}</span>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Portions to Cook</p>
                  </div>
                </div>

                {/* Progress / Serving Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Meals Served at Counter</span>
                    <span className="font-semibold text-white">{served} / {expected}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                      style={{ width: `${expected > 0 ? Math.min(100, (served / expected) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                {/* Planned Menu Items */}
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Recipe Items:</h5>
                  {menuMeal && menuMeal.items?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {menuMeal.items.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{item.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            item.category === 'veg' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {item.category || 'Veg'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No specific dishes entered in menu.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
