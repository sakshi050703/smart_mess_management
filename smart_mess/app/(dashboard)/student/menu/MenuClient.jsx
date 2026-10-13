'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Calendar, Clock, Utensils, CheckCircle, XCircle } from 'lucide-react';

export default function MenuClient({ userName, role }) {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [actionMessage, setActionMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menus');
      const data = await res.json();
      if (data.success) {
        setMenus(data.data.menus);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const activeMenu = menus.find(m => {
    const mDate = new Date(m.date).toISOString().split('T')[0];
    return mDate === selectedDate;
  }) || menus[0];

  const handleBooking = async (mealType, status) => {
    setBookingLoading(true);
    setActionMessage('');
    try {
      const res = await fetch('/api/meal-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Successfully marked ${mealType} as ${status}!`);
      } else {
        setActionMessage(data.message || 'Operation failed');
      }
    } catch (err) {
      setActionMessage('Failed to update meal booking');
    }
    setBookingLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Mess Menu" subtitle="Browse daily menus and book or skip meals" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-6xl mx-auto w-full animate-fade-in">
        {actionMessage && (
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm">
            {actionMessage}
          </div>
        )}

        {/* Date Selector */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-semibold text-white">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Viewing menu for:</span>
            <span className="text-xs font-bold text-white px-3 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
              {formatDate(selectedDate)}
            </span>
          </div>
        </div>

        {/* Menu Cards */}
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading menu details...</div>
        ) : !activeMenu ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-white/5 text-slate-400">
            No published menu found for the selected date. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeMenu.meals?.map(meal => (
              <div key={meal.mealType} className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
                    <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                      <Utensils className="w-5 h-5 text-indigo-400" />
                      {meal.mealType}
                    </h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {meal.timing?.start || '07:30'} - {meal.timing?.end || '09:30'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">
                    Cutoff time to skip or book: <span className="text-indigo-300 font-mono">{meal.cutoffTime || '1 hour before'}</span>
                  </p>

                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Served Items</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {meal.items?.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                          <span className="text-sm text-white font-medium">{item.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.category === 'veg' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {item.category || 'Veg'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                  <button
                    onClick={() => handleBooking(meal.mealType, 'confirmed')}
                    disabled={bookingLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> Book Meal
                  </button>
                  <button
                    onClick={() => handleBooking(meal.mealType, 'skipped')}
                    disabled={bookingLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Skip Meal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
