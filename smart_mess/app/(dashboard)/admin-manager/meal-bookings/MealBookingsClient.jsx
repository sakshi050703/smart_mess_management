'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, XCircle, Clock, Filter, Users } from 'lucide-react';

export default function MealBookingsClient({ userName, role }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealFilter, setMealFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    let url = `/api/meal-bookings?date=${selectedDate}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = bookings.filter(b => {
    if (mealFilter && b.mealType !== mealFilter) return false;
    return true;
  });

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const skippedCount = bookings.filter(b => b.status === 'skipped').length;

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meal Bookings & Skips" subtitle="Monitor expected diner counts and student skips" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bookings Today</p>
              <h3 className="text-2xl font-bold text-white mt-1">{bookings.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Confirmed & Skipped records</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Confirmed Meals</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{confirmedCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Diners expected to eat</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Meals Skipped</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{skippedCount}</h3>
              <p className="text-xs text-slate-500 mt-1">Helps kitchen avoid wastage</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={mealFilter}
              onChange={e => setMealFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <span className="text-xs text-slate-400">Showing {filtered.length} entries</span>
        </div>

        {/* Bookings Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5">Meal</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">Loading bookings...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">No booking records found for the selected filters.</td>
                  </tr>
                ) : (
                  filtered.map(b => (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {b.student?.name || 'Student'}
                        <p className="text-xs text-slate-400 font-mono font-normal">{b.student?.studentId || 'ID'}</p>
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 font-medium">
                        {b.mealType}
                      </td>
                      <td className="py-4 px-5">
                        {b.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Skipped
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {formatDate(b.updatedAt || b.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
