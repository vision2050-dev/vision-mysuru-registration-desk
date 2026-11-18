'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { QrCode, Users, Mail, BarChart3, Ticket, Check, Sparkles } from 'lucide-react';

interface NavbarProps {
  deskName?: string;
  onDeskNameChange?: (name: string) => void;
  onResetData?: () => void;
  onOpenGeneratePass?: () => void;
}

export default function Navbar({
  deskName = 'Desk #1 (Auditorium)',
  onDeskNameChange,
  onResetData,
  onOpenGeneratePass,
}: NavbarProps) {
  const pathname = usePathname();
  const [isEditingDesk, setIsEditingDesk] = useState(false);
  const [currentDesk, setCurrentDesk] = useState(deskName);

  const navItems = [
    { label: 'Scanner Desk', href: '/', icon: QrCode },
    { label: 'Attendees', href: '/attendees', icon: Users },
    { label: 'E-Pass Emails', href: '/emails', icon: Mail },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const handleSaveDesk = (e: React.FormEvent) => {
    e.preventDefault();
    if (onDeskNameChange) onDeskNameChange(currentDesk);
    setIsEditingDesk(false);
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
            {/* Active Desk Pill */}
            <div className="relative">
              {isEditingDesk ? (
                <form onSubmit={handleSaveDesk} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={currentDesk}
                    onChange={(e) => setCurrentDesk(e.target.value)}
                    className="text-xs px-2.5 py-1 rounded-md bg-[var(--surface-2)] border border-[#8f1b1b]/30 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b] w-36"
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
                  title="Click to rename check-in desk"
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate max-w-[120px] font-medium">{deskName}</span>
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
                <span>+ Generate Pass</span>
              </button>
            ) : (
              <Link
                href="/?generate=true"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>+ Generate Pass</span>
              </Link>
            )}
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
