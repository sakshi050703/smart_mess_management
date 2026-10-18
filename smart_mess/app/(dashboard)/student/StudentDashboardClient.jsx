'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import {
  Utensils,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Bell,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';

export default function StudentDashboardClient({ userName, userEmail, studentId, role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [actionMessage, setActionMessage] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard/student');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleMeal = async (mealType, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [mealType]: true }));
    setActionMessage('');
    const newStatus = currentStatus === 'skipped' ? 'confirmed' : 'skipped';

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await fetch('/api/meal-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: todayStr,
          mealType,
          status: newStatus,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setActionMessage(`Meal ${mealType} marked as ${newStatus}!`);
        await fetchDashboard();
      } else {
        setActionMessage(result.message || 'Action failed (Check cutoff time)');
      }
    } catch (err) {
      setActionMessage('Failed to update meal booking');
    }
    setActionLoading(prev => ({ ...prev, [mealType]: false }));
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Topbar title="Student Portal" subtitle="Welcome back" role={role} userName={userName} />
        <div className="p-8 text-center text-slate-400">Loading your student dashboard...</div>
      </div>
    );
  }

  const sub = data?.activeSubscription;
  const menu = data?.todayMenu;
  const bookingMap = data?.bookingStatusByMeal || {};

  const mealTypes = [
    { key: 'breakfast', label: 'Breakfast', icon: '🍳', defaultTime: '07:30 - 09:30' },
    { key: 'lunch', label: 'Lunch', icon: '🍛', defaultTime: '12:30 - 14:30' },
    { key: 'snacks', label: 'Evening Snacks', icon: '☕', defaultTime: '17:00 - 18:30' },
    { key: 'dinner', label: 'Dinner', icon: '🍲', defaultTime: '19:30 - 21:30' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-12">
      <Topbar title="Student Portal" subtitle="Manage bookings, meals and subscriptions" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage('')} className="text-slate-400 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Student Portal
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                Hello, {userName}! 👋
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Student ID: <span className="font-mono text-indigo-300">{studentId || 'STU-ACTIVE'}</span> • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/student/menu"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                View Full Menu
              </Link>
            </div>
          </div>
        </div>

        {/* Key Metrics / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Subscription Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Plan</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div>
              {sub ? (
                <>
                  <h3 className="text-xl font-bold text-white">{sub.mealPlan?.name || 'Standard Plan'}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Valid till: <strong className="text-slate-200">{formatDate(sub.endDate)}</strong>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-rose-400">No Active Plan</h3>
                  <p className="text-xs text-slate-400 mt-1">Contact mess manager to activate subscription</p>
                </>
              )}
            </div>
            <Link href="/student/subscription" className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              Subscription details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pending Bills Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Dues</span>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${data?.pendingAmountInPaise > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${data?.pendingAmountInPaise > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formatCurrency(data?.pendingAmountInPaise || 0)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {data?.pendingBillsCount > 0 ? `${data.pendingBillsCount} unpaid bill(s)` : 'All dues cleared!'}
              </p>
            </div>
            <Link href="/student/billing" className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View bills & receipts <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Monthly Attendance Card */}
          <div className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Meals Attended</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Utensils className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{data?.monthAttendance || 0}</h3>
              <p className="text-xs text-slate-400 mt-1">Meals served this month</p>
            </div>
            <Link href="/student/meal-history" className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View attendance history <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Today's Meals & Booking Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Utensils className="w-5 h-5 text-indigo-400" />
                Today&apos;s Menu & Meal Actions
              </h3>
              <p className="text-xs text-slate-400">Book or skip individual meals before cutoff time</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/5">
              {menu ? 'Menu Published' : 'Menu Pending'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mealTypes.map(meal => {
              const menuMeal = menu?.meals?.find(m => m.mealType === meal.key);
              const bookingStatus = bookingMap[meal.key];
              const isIncludedInPlan = sub?.mealPlan?.includedMeals?.[meal.key] !== false;
              const isSkipped = bookingStatus === 'skipped';
              const isConfirmed = bookingStatus === 'confirmed';

              return (
                <div
                  key={meal.key}
                  className={`glass-card p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSkipped ? 'border-rose-500/20 bg-rose-500/[0.02]' : 'border-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{meal.icon}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isSkipped
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isIncludedInPlan
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-slate-800 text-slate-400 border-white/5'
                      }`}>
                        {isSkipped ? 'Skipped' : isConfirmed ? 'Confirmed' : isIncludedInPlan ? 'Auto-Subscribed' : 'Not Included'}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base">{meal.label}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {menuMeal?.timing?.start ? `${menuMeal.timing.start} - ${menuMeal.timing.end}` : meal.defaultTime}
                    </p>

                    {/* Menu items */}
                    <div className="mt-3 min-h-[60px]">
                      {menuMeal && menuMeal.items?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {menuMeal.items.map((item, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-white/5">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">No menu items listed yet</p>
                      )}
                    </div>
                  </div>

                  {/* Booking / Skip Action Button */}
                  <div className="pt-4 border-t border-white/5 mt-3">
                    <button
                      onClick={() => handleToggleMeal(meal.key, bookingStatus)}
                      disabled={actionLoading[meal.key]}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        isSkipped
                          ? 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {actionLoading[meal.key] ? (
                        'Processing...'
                      ) : isSkipped ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Book Back
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Skip Meal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notices & Quick Access Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Announcements */}
          <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              Mess Notice Board
            </h3>

            <div className="space-y-3">
              {data?.announcements?.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active announcements today.</p>
              ) : (
                data?.announcements?.map(ann => (
                  <div key={ann._id} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-semibold text-white text-sm">{ann.title}</h4>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{ann.content}</p>
                    <p className="text-[10px] text-slate-500 mt-2">Posted on {formatDate(ann.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Student Quick Shortcuts */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base">Quick Shortcuts</h3>
            <div className="space-y-2">
              <Link
                href="/student/feedback"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-all text-sm text-slate-200 group"
              >
                <span>⭐ Submit Meal Rating</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                href="/student/complaints"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-all text-sm text-slate-200 group"
              >
                <span>⚠️ Register Complaint</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                href="/student/profile"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-all text-sm text-slate-200 group"
              >
                <span>👤 My Profile & Settings</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>

              <Link
                href="/student/bookings"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/5 transition-all text-sm text-slate-200 group"
              >
                <span>📅 Upcoming Bookings</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
