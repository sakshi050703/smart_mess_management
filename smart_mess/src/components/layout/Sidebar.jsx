'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';

const adminNavItems = [
  { href: '/admin-manager', icon: '⊞', label: 'Dashboard', exact: true },
  { href: '/admin-manager/users', icon: '👥', label: 'Users', adminOnly: true },
  { href: '/admin-manager/students', icon: '🎓', label: 'Students' },
  { href: '/admin-manager/menus', icon: '📋', label: 'Menus' },
  { href: '/admin-manager/meal-plans', icon: '🍽️', label: 'Meal Plans' },
  { href: '/admin-manager/subscriptions', icon: '📅', label: 'Subscriptions' },
  { href: '/admin-manager/meal-bookings', icon: '✅', label: 'Meal Bookings' },
  { href: '/admin-manager/attendance', icon: '📊', label: 'Attendance' },
  { href: '/admin-manager/billing', icon: '🧾', label: 'Billing' },
  { href: '/admin-manager/payments', icon: '💳', label: 'Payments' },
  { href: '/admin-manager/inventory', icon: '📦', label: 'Inventory' },
  { href: '/admin-manager/wastage', icon: '🗑️', label: 'Food Wastage' },
  { href: '/admin-manager/feedback', icon: '⭐', label: 'Feedback' },
  { href: '/admin-manager/complaints', icon: '📢', label: 'Complaints' },
  { href: '/admin-manager/announcements', icon: '📣', label: 'Announcements' },
  { href: '/admin-manager/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/admin-manager/reports', icon: '📈', label: 'Reports' },
  { href: '/admin-manager/settings', icon: '⚙️', label: 'Settings' },
  { href: '/admin-manager/audit-logs', icon: '🔍', label: 'Audit Logs', adminOnly: true },
];

const kitchenNavItems = [
  { href: '/kitchen', icon: '⊞', label: 'Dashboard', exact: true },
  { href: '/kitchen/preparation', icon: '👨‍🍳', label: 'Preparation' },
  { href: '/kitchen/attendance', icon: '✅', label: 'Mark Attendance' },
  { href: '/kitchen/inventory', icon: '📦', label: 'Inventory' },
  { href: '/kitchen/wastage', icon: '🗑️', label: 'Food Wastage' },
  { href: '/kitchen/tasks', icon: '📋', label: 'Tasks' },
];

const studentNavItems = [
  { href: '/student', icon: '⊞', label: 'Dashboard', exact: true },
  { href: '/student/menu', icon: '📋', label: 'Today\'s Menu' },
  { href: '/student/bookings', icon: '✅', label: 'My Bookings' },
  { href: '/student/meal-history', icon: '📊', label: 'Meal History' },
  { href: '/student/subscription', icon: '📅', label: 'Subscription' },
  { href: '/student/billing', icon: '🧾', label: 'Billing' },
  { href: '/student/payments', icon: '💳', label: 'Payments' },
  { href: '/student/feedback', icon: '⭐', label: 'Feedback' },
  { href: '/student/complaints', icon: '📢', label: 'Complaints' },
  { href: '/student/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/student/profile', icon: '👤', label: 'Student Profile' },
];

function getRoleConfig(role) {
  if (role === 'admin' || role === 'manager') {
    return {
      navItems: adminNavItems.filter(item => !item.adminOnly || role === 'admin'),
      label: role === 'admin' ? 'Admin' : 'Mess Manager',
      color: 'from-indigo-500 to-purple-600',
      badge: role === 'admin' ? 'ADMIN' : 'MANAGER',
    };
  }
  if (role === 'kitchen') {
    return {
      navItems: kitchenNavItems,
      label: 'Kitchen Staff',
      color: 'from-emerald-500 to-teal-600',
      badge: 'KITCHEN',
    };
  }
  return {
    navItems: studentNavItems,
    label: 'Student',
    color: 'from-amber-500 to-orange-600',
    badge: 'STUDENT',
  };
}

export default function DashboardSidebar({ role, userName }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const config = getRoleConfig(role);

  function isActive(item) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden btn-icon"
        aria-label="Toggle sidebar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo / Brand */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">SmartMess</div>
              <div className="text-slate-500 text-xs">Management System</div>
            </div>
          </div>
          {/* Role badge */}
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${config.color} text-white`}>
            {config.badge}
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {(userName || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-slate-200 text-sm font-medium truncate">{userName || 'User'}</div>
              <div className="text-slate-500 text-xs">{config.label}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {config.navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item) ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-slate-800/60">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="nav-item text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
