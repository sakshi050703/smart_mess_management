'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

function getRoleConfig(role) {
  const r = (role || '').toLowerCase();
  if (r === 'admin') {
    return {
      label: 'Administrator',
      badge: 'ADMIN',
      color: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
      links: [],
    };
  }
  if (r === 'manager') {
    return {
      label: 'Mess Manager',
      badge: 'MANAGER',
      color: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      links: [],
    };
  }
  if (r === 'kitchen') {
    return {
      label: 'Kitchen Staff',
      badge: 'KITCHEN',
      color: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      links: [],
    };
  }
  return {
    label: 'Student',
    badge: 'STUDENT',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    links: [],
  };
}

export default function Topbar({ title, subtitle, role, userName }) {
  const [notifCount, setNotifCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const effectiveUserName = userName || session?.user?.name || 'User';
  const effectiveRole = role || session?.user?.role || 'student';
  const effectiveEmail = session?.user?.email || '';
  const roleConfig = getRoleConfig(effectiveRole);

  useEffect(() => {
    // Fetch notification count
    fetch('/api/notifications?unread=true&limit=1')
      .then(r => r.json())
      .then(data => {
        if (data.success) setNotifCount(data.pagination?.total || 0);
      })
      .catch(() => {});
  }, [pathname]);

  // Handle outside click & escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Smooth hover handlers with small debounce buffer
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  const handleToggleClick = () => {
    setDropdownOpen(prev => !prev);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: '/login' });
    } catch (err) {
      console.error('Logout error:', err);
      window.location.href = '/login';
    }
  };

  const notifHref =
    effectiveRole === 'student'
      ? '/student/notifications'
      : effectiveRole === 'kitchen'
      ? '/kitchen/tasks'
      : '/admin-manager/notifications';

  return (
    <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 sm:px-6 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Left — Page title (space for mobile burger) */}
      <div className="pl-10 lg:pl-0 min-w-0 pr-2">
        <h1 className="text-slate-200 font-semibold text-sm sm:text-base truncate">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs truncate hidden xs:block">{subtitle}</p>}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Notifications */}
        <Link
          href={notifHref}
          className="relative btn-icon hover:bg-slate-800/60 rounded-xl"
          aria-label="Notifications"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 hover:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </Link>

        {/* User avatar & Profile menu with on-hover logout dropdown */}
        <div
          ref={dropdownRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          {/* Profile Trigger Button */}
          <button
            type="button"
            onClick={handleToggleClick}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl transition-all duration-150 border cursor-pointer ${
              dropdownOpen
                ? 'bg-slate-800/80 border-slate-700/80 shadow-md ring-1 ring-white/10'
                : 'border-transparent hover:border-slate-800/80 hover:bg-slate-800/50'
            }`}
          >
            {/* Avatar with online dot */}
            <div className="relative">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleConfig.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                {(effectiveUserName || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            {/* Name & Role preview on larger screens */}
            <div className="text-left hidden md:block">
              <div className="text-slate-200 text-xs font-semibold max-w-[120px] truncate leading-tight">
                {effectiveUserName}
              </div>
              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider leading-tight">
                {roleConfig.badge}
              </div>
            </div>

            {/* Chevron icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                dropdownOpen ? 'rotate-180 text-slate-200' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* On-Hover Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full pt-1.5 z-50 w-64 origin-top-right animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-2.5 ring-1 ring-white/10 text-slate-200">
                {/* User Info Header */}
                <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleConfig.color} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}>
                      {(effectiveUserName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm text-white truncate">
                        {effectiveUserName}
                      </div>
                      {effectiveEmail && (
                        <div className="text-xs text-slate-400 truncate">
                          {effectiveEmail}
                        </div>
                      )}
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.badgeBg}`}>
                          {roleConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional custom links if any non-sidebar item is present */}
                {roleConfig.links && roleConfig.links.length > 0 && (
                  <div className="space-y-0.5 py-1 mb-1.5 border-b border-slate-800/80">
                    {roleConfig.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="text-sm">{link.icon}</span>
                          <span>{link.label}</span>
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Prominent Dropdown Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-white bg-gradient-to-r from-rose-500/15 to-red-500/15 hover:from-rose-600 hover:to-red-600 border border-rose-500/30 hover:border-rose-500 transition-all duration-150 shadow-sm group/logout cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-rose-400 group-hover/logout:text-white group-hover/logout:translate-x-0.5 transition-all"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{isLoggingOut ? 'Signing out...' : 'Log Out'}</span>
                  </div>
                  <span className="text-[10px] text-rose-400/80 group-hover/logout:text-white/80 font-normal">
                    Exit
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

