'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Calendar, CheckCircle2, UserCheck, Plus, Search, Filter } from 'lucide-react';

export default function AttendanceClient({ userName, role }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealFilter, setMealFilter] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [markForm, setMarkForm] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    status: 'present',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    let url = `/api/attendance?date=${selectedDate}&`;
    if (mealFilter) url += `mealType=${mealFilter}&`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data.records);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [selectedDate, mealFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const openMarkModal = async () => {
    setShowMarkModal(true);
    setError('');
    try {
      const res = await fetch('/api/users?role=student&limit=100');
      const data = await res.json();
      if (data.success) {
        setStudents(data.data.users);
        if (data.data.users.length > 0) {
          setMarkForm(prev => ({ ...prev, studentId: data.data.users[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowMarkModal(false);
        setMessage('Attendance marked successfully!');
        fetchAttendance();
      } else {
        setError(data.message || 'Failed to mark attendance');
      }
    } catch (err) {
      setError('An error occurred');
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Meal Attendance" subtitle="Counter check-ins and meal serving logs" role={role} userName={userName} />

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

          <button
            onClick={openMarkModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <UserCheck className="w-4 h-4" />
            Mark Student Attendance
          </button>
        </div>

        {/* Table */}
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Student</th>
                  <th className="py-4 px-5">Meal</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Served At</th>
                  <th className="py-4 px-5">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">Loading attendance records...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">No attendance entries recorded for this date and meal.</td>
                  </tr>
                ) : (
                  records.map(r => (
                    <tr key={r._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 font-semibold text-white">
                        {r.student?.name || 'Student'}
                        <p className="text-xs text-slate-400 font-mono font-normal">{r.student?.studentId || 'ID'}</p>
                      </td>
                      <td className="py-4 px-5 capitalize text-slate-300 font-medium">
                        {r.mealType}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                          <CheckCircle2 className="w-3 h-3" /> {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs font-mono">
                        {r.servedAt ? new Date(r.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="py-4 px-5 text-slate-400 text-xs">
                        {r.markedBy?.name || 'Staff'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mark Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Mark Attendance Counter
            </h3>

            {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Select Student *</label>
                <select
                  required
                  value={markForm.studentId}
                  onChange={e => setMarkForm({ ...markForm, studentId: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.studentId || s.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Date *</label>
                  <input
                    required
                    type="date"
                    value={markForm.date}
                    onChange={e => setMarkForm({ ...markForm, date: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Meal *</label>
                  <select
                    value={markForm.mealType}
                    onChange={e => setMarkForm({ ...markForm, mealType: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
                <select
                  value={markForm.status}
                  onChange={e => setMarkForm({ ...markForm, status: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="present">Present (Served)</option>
                  <option value="late">Late Arrival</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {saving ? 'Marking...' : 'Mark Served'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
