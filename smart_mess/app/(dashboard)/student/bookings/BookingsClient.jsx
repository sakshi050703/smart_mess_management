'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';

export default function BookingsClient({ userName, role }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meal-bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(b => {
    if (statusFilter && b.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Bookings" subtitle="Track your meal booking history and skip statuses" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
        {/* Filter bar */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Bookings</option>
              <option value="confirmed">Confirmed</option>
              <option value="skipped">Skipped</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <span className="text-xs text-slate-400">Total: {filteredBookings.length} records</span>
        </div>

        {/* Bookings List */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Meal Type</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Booked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">Loading bookings...</td>
                  </tr>
                ) : filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400">No meal bookings recorded yet.</td>
                  </tr>
                ) : (
                  filteredBookings.map(b => (
                    <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        {formatDate(b.date)}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300">{b.mealType}</td>
                      <td className="py-4 px-5">
                        {b.status === 'confirmed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        ) : b.status === 'skipped' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Skipped
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
                            {b.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {formatDate(b.createdAt)}
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
