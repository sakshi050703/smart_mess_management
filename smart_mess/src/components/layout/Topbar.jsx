'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Topbar({ title, subtitle, role, userName }) {
  const [notifCount, setNotifCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch notification count
    fetch('/api/notifications?unread=true&limit=1')
      .then(r => r.json())
      .then(data => {
        if (data.success) setNotifCount(data.pagination?.total || 0);
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Left — Page title (space for mobile burger) */}
      <div className="pl-10 lg:pl-0">
        <h1 className="text-slate-200 font-semibold text-base">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <Link
          href={role === 'student' ? '/student/notifications' : '/admin-manager/notifications'}
          className="relative btn-icon"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        {/* User avatar */}
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {(userName || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-slate-300 text-sm font-medium hidden sm:block">{userName}</span>
        </div>
      </div>
    </header>
  );
}
