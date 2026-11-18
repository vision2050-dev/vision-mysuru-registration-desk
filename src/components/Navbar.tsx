'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Users, Mail, BarChart3, Ticket, RotateCcw, Building2 } from 'lucide-react';

interface NavbarProps {
  deskName?: string;
  onDeskNameChange?: (name: string) => void;
  onResetData?: () => void;
}

export default function Navbar({
  deskName = 'Registration Desk 1 (Auditorium)',
  onDeskNameChange,
  onResetData,
}: NavbarProps) {
  const pathname = usePathname();
  const [isEditingDesk, setIsEditingDesk] = useState(false);
  const [currentDesk, setCurrentDesk] = useState(deskName);

  const navItems = [
    { label: 'Check-In Scanner', href: '/', icon: QrCode },
    { label: 'Attendees & Passes', href: '/attendees', icon: Users },
    { label: 'Invitations & Emails', href: '/emails', icon: Mail },
    { label: 'Analytics & Logs', href: '/analytics', icon: BarChart3 },
  ];

  const handleSaveDesk = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDeskNameChange) onDeskNameChange(currentDesk);
    setIsEditingDesk(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur border-b border-[var(--border)] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-amber-50 border border-amber-200 flex items-center justify-center p-1 shadow-xs group-hover:scale-105 transition-transform">
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
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[var(--primary)] flex items-center gap-1.5">
                  Vision Mysuru 2050
                  <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-bold bg-[#8f1b1b]/10 text-[#8f1b1b] px-2 py-0.5 rounded-full border border-[#8f1b1b]/20">
                    Desk Platform
                  </span>
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-medium hidden sm:block">
                  Student E-Pass & Campus Check-in Verification
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8f1b1b] text-white shadow-xs'
                      : 'text-[var(--text)] hover:bg-[var(--surface-2)] hover:text-[#8f1b1b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desk Station & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Desk Badge */}
            <div className="relative">
              {isEditingDesk ? (
                <form onSubmit={handleSaveDesk} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentDesk}
                    onChange={(e) => setCurrentDesk(e.target.value)}
                    className="text-xs px-2 py-1 border border-[var(--border)] rounded-md bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    autoFocus
                    onBlur={() => setIsEditingDesk(false)}
                  />
                  <button
                    type="submit"
                    className="text-[10px] bg-[#8f1b1b] text-white px-2 py-1 rounded-md"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsEditingDesk(true)}
                  title="Click to rename your check-in desk"
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[var(--surface-2)] hover:bg-[#b07c12]/15 text-[11px] font-medium text-[var(--text)] border border-[var(--border)] transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#b07c12]" />
                  <span className="truncate max-w-[130px]">{deskName}</span>
                </button>
              )}
            </div>

            {/* Quick Link to Sample Pass */}
            <Link
              href="/pass/VM2050-7821-MYS"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#b07c12]/15 text-[#96670a] hover:bg-[#b07c12]/25 border border-[#b07c12]/30 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sample</span> E-Pass
            </Link>

            {/* Reset Demo button if provided */}
            {onResetData && (
              <button
                onClick={onResetData}
                title="Reset demo data"
                className="p-1.5 text-[var(--text-muted)] hover:text-[#8f1b1b] hover:bg-[var(--surface-2)] rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[var(--border)] gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? 'bg-[#8f1b1b] text-white'
                    : 'text-[var(--text)] hover:bg-[var(--surface-2)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </header>
  );
}
