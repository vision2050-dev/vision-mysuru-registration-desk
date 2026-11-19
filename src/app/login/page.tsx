'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, RefreshCw, AlertCircle, Building2, MapPin } from 'lucide-react';

const DESK_STATIONS = [
  { label: 'Main Gate 1', email: 'gate1@sdmimd.ac.in', location: 'Main Gate' },
  { label: 'Main Gate 2', email: 'gate2@sdmimd.ac.in', location: 'Main Gate' },
  { label: 'Auditorium 1', email: 'auditorium1@sdmimd.ac.in', location: 'Auditorium' },
  { label: 'Auditorium 2', email: 'auditorium2@sdmimd.ac.in', location: 'Auditorium' },
  { label: 'Auditorium 3', email: 'auditorium3@sdmimd.ac.in', location: 'Auditorium' },
  { label: 'Central Desk', email: 'vision2050@sdmimd.ac.in', location: 'Coordination' },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [email, setEmail] = useState('gate1@sdmimd.ac.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials. Only authorized staff may sign in.');
      }

      // Hard redirect to propagate session cookie immediately to all routes
      window.location.href = from;
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-md space-y-5">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[var(--border)] p-1.5 shadow-2xs mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_final.png"
            alt="Vision Mysuru 2050 Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">
            Vision Mysuru 2050
          </h1>
          <span className="text-[10px] font-semibold text-[#8f1b1b] bg-[#8f1b1b]/10 px-2 py-0.5 rounded-full border border-[#8f1b1b]/20 tracking-wider uppercase">
            Desk
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          SDMIMD Campus • Registration & Admissions Portal
        </p>
      </div>

      {/* Station Selector Chips */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-0.5">
          <span className="font-semibold text-[var(--text)]">Select Desk Station</span>
          <span className="text-[10px] text-emerald-600 font-medium">Auto-Synced Cloud</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {DESK_STATIONS.map((st) => {
            const isSelected = email.toLowerCase() === st.email.toLowerCase();
            return (
              <button
                key={st.email}
                type="button"
                onClick={() => {
                  setEmail(st.email);
                  setError(null);
                }}
                className={`py-1.5 px-2 rounded-lg text-left border text-xs transition-all ${
                  isSelected
                    ? 'bg-[#8f1b1b] text-white border-[#8f1b1b] shadow-2xs font-semibold'
                    : 'bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] border-[var(--border)] hover:bg-[var(--surface-3)]'
                }`}
              >
                <div className="truncate text-[11px] font-medium leading-tight">{st.label}</div>
                <div className={`text-[9px] truncate ${isSelected ? 'text-neutral-200' : 'text-[var(--text-subtle)]'}`}>
                  {st.location}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold">Sign in failed</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-[var(--text)] mb-1">
            Station Email ID
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="gate1@sdmimd.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#8f1b1b]/20 focus:border-[#8f1b1b] transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-[var(--text)]">
              Station Password
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter station password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#8f1b1b]/20 focus:border-[#8f1b1b] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--text-muted)] select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded text-[#8f1b1b] focus:ring-[#8f1b1b]"
            />
            <span>Remember this station</span>
          </label>
          <span className="text-[11px] text-[var(--text-subtle)]">
            SDMIMD Auth
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 mt-1"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Credentials...</span>
            </>
          ) : (
            <>
              <span>Sign In to Registration Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Security Note */}
      <div className="pt-3 border-t border-[var(--border)] text-center space-y-1 text-[11px] text-[var(--text-subtle)]">
        <div className="flex items-center justify-center gap-1.5 font-medium text-[var(--text-muted)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#b07c12]" />
          <span>Restricted Campus Portal</span>
        </div>
        <p>
          2 Main Gate Desks + 3 Auditorium Desks + Central Coordination. All desks are synced in real time.
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg)] px-4 py-8">
      <Suspense fallback={<div className="text-xs text-[var(--text-subtle)]">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
