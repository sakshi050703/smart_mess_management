'use client';

import { useState, useEffect, useCallback } from 'react';
import Topbar from '@/components/layout/Topbar';
import { formatDate } from '@/lib/utils';
import { Bell, Info, AlertTriangle, AlertCircle, CheckCheck } from 'lucide-react';

export default function AdminNotificationsClient({ userName, role }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Notifications" subtitle="System alerts, low stock and payment events" role={role} userName={userName} />

      <div className="p-6 flex-1 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-lg">System Notifications</h3>
          </div>

          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="glass-card p-12 rounded-2xl border border-white/5 text-center text-slate-400">
              No new alerts or notifications.
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                className={`glass-card p-5 rounded-2xl border flex items-start gap-4 ${
                  !n.isRead ? 'border-indigo-500/30 bg-indigo-500/[0.04]' : 'border-white/5 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-sm">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
