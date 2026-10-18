'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Utensils, CheckCircle, Clock } from 'lucide-react';

export default function MealHistoryClient({ userName, role }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance');
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meal Attendance History" subtitle="Verified meals served at the mess counter" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-5xl mx-auto w-full animate-fade-in">
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Date</th>
                  <th className="py-4 px-5">Meal</th>
                  <th className="py-4 px-5">Attendance Status</th>
                  <th className="py-4 px-5">Served Time</th>
                  <th className="py-4 px-5">Verified By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">Loading attendance history...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">No attendance records found.</td>
                  </tr>
                ) : (
                  records.map(record => (
                    <tr key={record._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300">
                        {record.mealType}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Present
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs font-mono">
                        {record.servedAt ? new Date(record.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {record.markedBy?.name || 'Kitchen Staff'}
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
