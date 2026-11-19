'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Users, Mail, BarChart3, Ticket, Check, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  deskName?: string;
  onDeskNameChange?: (name: string) => void;
  onResetData?: () => void;
  onOpenGeneratePass?: () => void;
}

export default function Navbar({
  deskName: propDeskName,
  onDeskNameChange,
  onResetData,
  onOpenGeneratePass,
}: NavbarProps) {
  const pathname = usePathname();
  const [isEditingDesk, setIsEditingDesk] = useState(false);
  const [deskName, setDeskName] = useState(propDeskName || 'Registration Desk');
  const [currentDesk, setCurrentDesk] = useState(propDeskName || 'Registration Desk');

  useEffect(() => {
    if (propDeskName) {
      setDeskName(propDeskName);
      setCurrentDesk(propDeskName);
      return;
    }
    // Fetch logged-in desk session if not provided
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user?.deskName) {
          setDeskName(data.user.deskName);
          setCurrentDesk(data.user.deskName);
        }
      })
      .catch(() => {});
  }, [propDeskName]);

  const navItems = [
    { label: 'Scanner Desk', href: '/', icon: QrCode },
    { label: 'Generate Pass', href: '/generate', icon: Ticket },
    { label: 'Attendees', href: '/attendees', icon: Users },
    { label: 'E-Pass Emails', href: '/emails', icon: Mail },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const handleSaveDesk = (e: React.FormEvent) => {
    e.preventDefault();
    setDeskName(currentDesk);
    if (onDeskNameChange) onDeskNameChange(currentDesk);
    setIsEditingDesk(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white border border-[var(--border)] flex items-center justify-center p-0.5 shadow-2xs group-hover:border-[#8f1b1b]/40 transition-colors">
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[var(--text)] group-hover:text-[#8f1b1b] transition-colors">
                  Vision Mysuru 2050
                </span>
                <span className="text-[10px] font-semibold text-[#8f1b1b] bg-[#8f1b1b]/8 px-2 py-0.5 rounded-full border border-[#8f1b1b]/15 tracking-wide uppercase">
                  Desk
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 pl-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#8f1b1b] text-white shadow-2xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Station Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Active Desk Station Badge */}
            <div className="relative">
              {isEditingDesk ? (
                <form onSubmit={handleSaveDesk} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentDesk}
                    onChange={(e) => setCurrentDesk(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[#8f1b1b]/30 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b] w-40"
                    autoFocus
                    onBlur={() => setIsEditingDesk(false)}
                  />
                  <button
                    type="submit"
                    className="p-1 rounded-md bg-[#8f1b1b] text-white text-xs"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingDesk(true)}
                  title="Click to customize desk label (Auto-synced with all desks)"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--text)] border border-[var(--border)] transition-colors"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="truncate max-w-[140px] font-medium">{deskName}</span>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                    Synced
                  </span>
                </button>
              )}
            </div>

            {/* Generate Pass Button */}
            {onOpenGeneratePass ? (
              <button
                type="button"
                onClick={onOpenGeneratePass}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>+ Pass</span>
              </button>
            ) : (
              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>+ Pass</span>
              </Link>
            )}

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out of registration desk"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-subtle)] hover:text-red-700 hover:bg-red-50 border border-[var(--border)] hover:border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-red-600" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Segment */}
        <div className="flex md:hidden items-center justify-between py-1.5 border-t border-[var(--border)] gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#8f1b1b] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
