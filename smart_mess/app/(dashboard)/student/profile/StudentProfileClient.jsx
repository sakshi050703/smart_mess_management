'use client';

import { useState, useEffect } from 'react';
import Topbar from '@/components/layout/Topbar';
import { User, Mail, Phone, Home, Shield, KeyRound, CheckCircle2 } from 'lucide-react';

export default function StudentProfileClient({ sessionUser }) {
  const [user, setUser] = useState(sessionUser);
  const [phone, setPhone] = useState(sessionUser.phone || '');
  const [roomNumber, setRoomNumber] = useState(sessionUser.roomNumber || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch('/api/me');
        const data = await res.json();
        if (data.success && data.data?.user) {
          setUser(data.data.user);
          setPhone(data.data.user.phone || '');
          setRoomNumber(data.data.user.roomNumber || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMe();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`/api/users/${user.id || user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, roomNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdMsg('');
    setPwdErr('');

    if (newPassword !== confirmPassword) {
      setPwdErr('New passwords do not match');
      setPwdLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id || user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPwdMsg('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdErr(data.message || 'Failed to update password');
      }
    } catch (err) {
      setPwdErr('Error changing password');
    }
    setPwdLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="My Profile" subtitle="Account details and security settings" role={user.role} userName={user.name} />

      <div className="p-6 flex-1 space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
        {/* User Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-600/30">
            {user.name?.charAt(0) || 'S'}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              {user.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ID: {user.studentId || 'STU-001'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                {user.role} Account
              </span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              Personal Contact Details
            </h3>

            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{message}</span>
              </div>
            )}
            {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{error}</div>}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                <input
                  disabled
                  type="text"
                  value={user.name}
                  className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                <input
                  disabled
                  type="email"
                  value={user.email}
                  className="w-full bg-slate-900/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Hostel Room Number</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  placeholder="e.g. Block B - Room 204"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30"
                >
                  {saving ? 'Saving...' : 'Save Contact Details'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              Change Password
            </h3>

            {pwdMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{pwdMsg}</span>
              </div>
            )}
            {pwdErr && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">{pwdErr}</div>}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confirm New Password</label>
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 transition-all"
                >
                  {pwdLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
