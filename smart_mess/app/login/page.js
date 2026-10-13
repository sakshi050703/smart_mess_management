'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || null;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error);
      setLoading(false);
      return;
    }

    // Redirect based on role — middleware will also protect routes
    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      // Fetch session to know role
      const res = await fetch('/api/me');
      if (res.ok) {
        const { role } = await res.json();
        if (role === 'admin' || role === 'manager') router.push('/admin-manager');
        else if (role === 'kitchen') router.push('/kitchen');
        else router.push('/student');
      } else {
        router.push('/');
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
          <span className="text-white text-2xl font-bold">M</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400 mt-1 text-sm">Sign in to SmartMess</p>
      </div>

      {/* Card */}
      <div className="glass p-8 shadow-2xl">
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="label">Email Address</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="label" style={{ marginBottom: 0 }}>Password</label>
              <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input pr-10"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-2"
          >
            {loading ? (
              <>
                <div className="spinner w-4 h-4 border-white/30 border-t-white"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      {/* Demo accounts */}
      <div className="mt-6 glass p-4">
        <p className="text-xs text-slate-500 text-center mb-3 uppercase font-semibold tracking-wider">Demo Accounts</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { role: 'Admin', email: 'admin@mess.com' },
            { role: 'Manager', email: 'manager@mess.com' },
            { role: 'Kitchen', email: 'kitchen@mess.com' },
            { role: 'Student', email: 'student@mess.com' },
          ].map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => setFormData({ email: acc.email, password: 'password123' })}
              className="text-left px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors"
            >
              <div className="text-xs font-semibold text-slate-300">{acc.role}</div>
              <div className="text-xs text-slate-500 truncate">{acc.email}</div>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center mt-2">All demo passwords: <code className="text-slate-400">password123</code></p>
      </div>

      <p className="text-center text-slate-600 text-xs mt-6">
        © 2026 Smart Mess Management System
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
