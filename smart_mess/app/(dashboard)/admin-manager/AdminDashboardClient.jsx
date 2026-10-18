'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

function StatCard({ icon, label, value, sub, color = 'indigo', trend }) {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/20',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/20',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/20',
  };

  const iconBg = {
    indigo: 'bg-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    purple: 'bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className={`stat-card bg-gradient-to-br ${colors[color]} border`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg[color]} flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

const MEAL_COLORS = {
  breakfast: '#f59e0b',
  lunch: '#10b981',
  snacks: '#6366f1',
  dinner: '#8b5cf6',
};

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snacks: 'Snacks',
  dinner: 'Dinner',
};

export default function AdminDashboardClient({ userName, role }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/admin')
      .then(r => r.json())
      .then(data => {
        if (data.success) setStats(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar
        title={role === 'admin' ? 'Admin Dashboard' : 'Mess Manager Dashboard'}
        subtitle={today}
        role={role}
        userName={userName}
      />

      <div className="p-6 flex-1 space-y-6 animate-fade-in">
        {/* Welcome */}
        <div className="glass rounded-xl p-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Good {getGreeting()}, {userName?.split(' ')[0]}! 👋</h2>
            <p className="text-slate-400 text-sm mt-0.5">Here's what's happening at the mess today.</p>
          </div>
          <div className="flex gap-3">
            <a href="/api/seed" className="hidden"></a>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="stat-card h-28 animate-pulse bg-slate-800/50" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard icon="🎓" label="Active Students" value={stats.totalStudents} color="indigo" />
            <StatCard icon="📅" label="Active Subscriptions" value={stats.activeSubscriptions} sub={`${stats.expiringSubscriptions} expiring soon`} color="emerald" />
            <StatCard icon="✅" label="Today's Bookings" value={stats.todayBookings} sub={`${stats.todayAttendance} served`} color="cyan" />
            <StatCard icon="🧾" label="Pending Bills" value={stats.unpaidBills} color="amber" />
            <StatCard icon="💰" label="Outstanding" value={formatCurrency(stats.totalOutstandingPaise)} color="rose" />
            <StatCard icon="📢" label="Open Complaints" value={stats.openComplaints} color="purple" />
          </div>
        ) : (
          <div className="glass rounded-xl p-6 text-center text-slate-400">
            Failed to load stats. Please check your MongoDB connection.
          </div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Attendance */}
          <div className="section-card lg:col-span-2 p-5">
            <h3 className="text-white font-semibold mb-4">Weekly Attendance Trend</h3>
            {loading ? (
              <div className="h-52 bg-slate-800/30 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.weeklyAttendance?.map(d => ({ date: d._id.slice(5), count: d.count })) || []}>
                  <defs>
                    <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#attendGrad)" strokeWidth={2} name="Meals Served" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Today's Meal Distribution */}
          <div className="section-card p-5">
            <h3 className="text-white font-semibold mb-4">Today's Meal Bookings</h3>
            {loading ? (
              <div className="h-52 bg-slate-800/30 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats?.bookingsByMeal?.map(m => ({ name: MEAL_LABELS[m._id] || m._id, value: m.confirmed })) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats?.bookingsByMeal?.map((entry) => (
                      <Cell key={entry._id} fill={MEAL_COLORS[entry._id] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Meal Count by Type */}
          <div className="section-card p-5">
            <h3 className="text-white font-semibold mb-4">Today's Confirmed Bookings by Meal</h3>
            {loading ? (
              <div className="h-40 bg-slate-800/30 rounded-lg animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={stats?.bookingsByMeal?.map(m => ({ name: MEAL_LABELS[m._id] || m._id, confirmed: m.confirmed, skipped: m.skipped })) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                  <Bar dataKey="confirmed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Confirmed" />
                  <Bar dataKey="skipped" fill="#334155" radius={[4, 4, 0, 0]} name="Skipped" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Alerts */}
          <div className="section-card p-5">
            <h3 className="text-white font-semibold mb-4">Alerts & Reminders</h3>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-800/30 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats?.expiringSubscriptions > 0 && (
                  <AlertItem icon="⚠️" color="amber" text={`${stats.expiringSubscriptions} subscription(s) expiring within 7 days`} />
                )}
                {stats?.unpaidBills > 0 && (
                  <AlertItem icon="💸" color="rose" text={`${stats.unpaidBills} bill(s) pending — ${formatCurrency(stats.totalOutstandingPaise)} outstanding`} />
                )}
                {stats?.openComplaints > 0 && (
                  <AlertItem icon="📢" color="purple" text={`${stats.openComplaints} open complaint(s) need attention`} />
                )}
                {stats?.todayWastageKg > 0 && (
                  <AlertItem icon="🗑️" color="slate" text={`${stats.todayWastageKg.toFixed(1)}kg food wasted today`} />
                )}
                {!stats?.expiringSubscriptions && !stats?.unpaidBills && !stats?.openComplaints && (
                  <div className="text-slate-500 text-sm text-center py-6">
                    ✅ All clear! No urgent alerts.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertItem({ icon, color, text }) {
  const colors = {
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rose: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    purple: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    slate: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  };

  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm ${colors[color] || colors.slate}`}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
