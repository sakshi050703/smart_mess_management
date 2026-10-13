'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { UserCheck, CheckCircle2, Search, Clock, Utensils } from 'lucide-react';

export default function KitchenAttendanceClient({ userName, role }) {
  const [mealType, setMealType] = useState('lunch');
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [recentServed, setRecentServed] = useState([]);
  const [marking, setMarking] = useState({});
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchRecentServed = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance?date=${today}&mealType=${mealType}`);
      const data = await res.json();
      if (data.success) {
        setRecentServed(data.data.records);
      }
    } catch (err) {
      console.error(err);
    }
  }, [mealType, today]);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/users?role=student&limit=100');
        const data = await res.json();
        if (data.success) setStudents(data.data.users);
      } catch (err) {
        console.error(err);
      }
    }
    loadStudents();
  }, []);

  useEffect(() => {
    fetchRecentServed();
  }, [fetchRecentServed]);

  const handleMark = async (student) => {
    setMarking(prev => ({ ...prev, [student._id]: true }));
    setMessage('');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student._id,
          date: today,
          mealType,
          status: 'present',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Served plate verified for ${student.name}!`);
        fetchRecentServed();
      }
    } catch (err) {
      console.error(err);
    }
    setMarking(prev => ({ ...prev, [student._id]: false }));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Kitchen Serving Counter Check-in" subtitle="Quick verify and record meal attendance" role={role} userName={userName} />

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

        {/* Counter Meal Selector */}
        <div className="glass-card p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Utensils className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Serving Meal:</span>
            <div className="flex gap-2">
              {['breakfast', 'lunch', 'snacks', 'dinner'].map(m => (
                <button
                  key={m}
                  onClick={() => setMealType(m)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                    mealType === m
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {recentServed.length} Students Served This Session
          </span>
        </div>

        {/* Main Interface: Left = Student Search & Mark, Right = Recently Served */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Mark List */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base">Quick Diner Search</h3>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student by ID or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {filteredStudents.slice(0, 20).map(s => {
                const isAlreadyServed = recentServed.some(r => r.student?._id === s._id);

                return (
                  <div
                    key={s._id}
                    className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-white text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 font-mono">ID: {s.studentId || 'N/A'}</p>
                    </div>

                    <button
                      onClick={() => handleMark(s)}
                      disabled={isAlreadyServed || marking[s._id]}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isAlreadyServed
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                      }`}
                    >
                      {marking[s._id] ? (
                        'Marking...'
                      ) : isAlreadyServed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Served
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Mark Served
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Served Stream */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base">Verified Counter Log ({recentServed.length})</h3>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {recentServed.length === 0 ? (
                <p className="text-xs text-slate-500 py-12 text-center">No students checked in yet for this meal.</p>
              ) : (
                recentServed.map(r => (
                  <div key={r._id} className="p-3 rounded-2xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{r.student?.name}</span>
                      <p className="text-slate-500 font-mono">{r.student?.studentId}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                      <p className="text-slate-400 font-mono text-[10px]">
                        {r.servedAt ? new Date(r.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
