'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import QRScanner from '@/components/QRScanner';
import ScanResultModal from '@/components/ScanResultModal';
import AddAttendeeModal from '@/components/AddAttendeeModal';
import BulkImportModal from '@/components/BulkImportModal';
import { DeskStats, CheckInLog, StudentAttendee } from '@/types';
import { CheckInResult } from '@/lib/store';
import {
  Users,
  CheckCircle2,
  Clock,
  Send,
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Building,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';

export default function RegistrationDeskPage() {
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([]);
  const [deskName, setDeskName] = useState('Desk #1 (Auditorium)');
  const [manualCode, setManualCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentAttendee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Load authenticated desk station on mount
  useEffect(() => {
    async function loadDeskSession() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user?.deskName) {
            setDeskName(data.user.deskName);
          }
        }
      } catch (err) {
        console.warn('Failed to load desk session:', err);
      }
    }
    loadDeskSession();
  }, []);

  // Fetch desk stats and logs
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/attendees');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
        setRecentLogs(data.stats.recentLogs || []);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // 3.5s auto-sync interval for multi-desk live consistency
    const interval = setInterval(fetchStats, 3500);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Handle QR Scan from camera
  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passCode: decodedText, deskName }),
      });
      const data: CheckInResult = await res.json();
      setScanResult(data);
      fetchStats();
    } catch (err: any) {
      setScanResult({
        success: false,
        status: 'INVALID_CODE',
        message: err.message || 'Verification network error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Manual Code Check-In
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const code = manualCode.trim();
    setManualCode('');
    await handleScanSuccess(code);
  };

  // Handle Undo Check-In
  const handleUndo = async (passCode: string) => {
    try {
      const res = await fetch('/api/undo-check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passCode }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStats();
      }
    } catch (err) {
      console.error('Undo failed:', err);
    }
  };

  // Search attendees dynamically
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/attendees?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.attendees.slice(0, 5));
        }
      } catch (e) {
        console.warn('Search failed:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleResetData = async () => {
    if (confirm('Reset platform data to default demo state?')) {
      await fetch('/api/reset', { method: 'POST' });
      fetchStats();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar
        deskName={deskName}
        onDeskNameChange={setDeskName}
        onResetData={handleResetData}
        onOpenGeneratePass={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Desk Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
                Registration & Check-In Desk
              </h1>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                SDMIMD Campus • Chamundi Hill Road, Mysuru
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>+ Generate E-Pass</span>
            </Link>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#b07c12]" />
              <span>Import CSV</span>
            </button>

            <a
              href="/api/export"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </a>
          </div>
        </div>

        {/* Clean Unified Metric Strip */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-2xs">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            
            {/* Total Registered */}
            <div className="px-3 py-2 md:py-0 first:pl-0">
              <span className="text-[10px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider block">
                Total Registered
              </span>
              <div className="text-xl font-bold text-[var(--text)] mt-0.5">
                {stats?.totalRegistered ?? '—'}
              </div>
            </div>

            {/* Checked In */}
            <div className="px-3 py-2 md:py-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider block">
                  Admitted (Checked In)
                </span>
                <span className="text-xs font-bold text-emerald-700">
                  {stats?.checkInRatePercent ?? 0}%
                </span>
              </div>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">
                {stats?.totalCheckedIn ?? '—'}
              </div>
              <div className="w-full h-1 bg-[var(--surface-2)] rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${stats?.checkInRatePercent ?? 0}%` }}
                />
              </div>
            </div>

            {/* Pending Arrival */}
            <div className="px-3 py-2 md:py-0">
              <span className="text-[10px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider block">
                Pending Arrival
              </span>
              <div className="text-xl font-bold text-[#b07c12] mt-0.5">
                {stats?.totalPending ?? '—'}
              </div>
            </div>

            {/* Invitations Sent */}
            <div className="px-3 py-2 md:py-0 last:pr-0">
              <span className="text-[10px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider block">
                E-Pass Invitations
              </span>
              <div className="text-xl font-bold text-[var(--text)] mt-0.5 flex items-baseline gap-1.5">
                <span>{stats?.totalEmailsSent ?? '—'}</span>
                <span className="text-xs font-normal text-[var(--text-subtle)]">
                  / {stats?.totalRegistered ?? 0}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Welcome / Empty-State Pass Generation Banner */}
        {stats?.totalRegistered === 0 && (
          <div className="bg-gradient-to-r from-[#8f1b1b]/10 via-[#b07c12]/10 to-[var(--surface)] border border-[#8f1b1b]/25 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#8f1b1b] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <span>Start by Issuing Delegate Passes</span>
                  <span className="text-[10px] bg-[#8f1b1b] text-white px-2 py-0.5 rounded-full font-semibold">Ready</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  The attendee database is clean. Generate verified digital QR passes individually or bulk-import student cohorts to begin admissions.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>+ Generate Pass</span>
              </Link>
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#b07c12]" />
                <span>Import CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Workstation Grid: Scanner & Unified Lookup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: QR Scanner & Fast Entry (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              isProcessing={isProcessing}
            />

            {/* Manual Code Input Bar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] block mb-1.5">
                Manual Code / Barcode Scanner Input
              </span>
              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VM2050-XXXX-MYS"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-mono uppercase rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || isProcessing}
                  className="px-3 py-1.5 bg-[#8f1b1b] hover:bg-[#781616] disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs shrink-0"
                >
                  Verify
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Search Lookup & Real-Time Feed (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Search Lookup Bar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xs">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search delegate by Name, USN, College, or Email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>

              {/* Instant Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="mt-2.5 border border-[var(--border)] rounded-lg overflow-hidden divide-y divide-[var(--border)] animate-in fade-in">
                  {searchResults.map((att) => {
                    const isChecked = att.status === 'checked_in';
                    return (
                      <div
                        key={att.id}
                        className="p-2.5 bg-[var(--surface)] hover:bg-[var(--surface-2)] flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--text)] truncate">{att.name}</span>
                            <span className="text-[10px] font-mono text-[#8f1b1b] font-medium bg-[#8f1b1b]/8 px-1.5 py-0.2 rounded">
                              {att.passCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">
                            {att.college} {att.usn && `• ${att.usn}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check className="w-3 h-3" />
                              Admitted
                            </span>
                          ) : (
                            <button
                              onClick={() => handleScanSuccess(att.passCode)}
                              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-md shadow-2xs transition-colors"
                            >
                              Check In
                            </button>
                          )}
                          <Link
                            href={`/pass/${att.passCode}`}
                            target="_blank"
                            className="p-1 text-[var(--text-subtle)] hover:text-[#8f1b1b] rounded hover:bg-[var(--surface-3)]"
                            title="View E-Pass"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Clean Live Admissions Stream */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-2xs flex flex-col">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Recent Admissions Activity
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-subtle)]">
                  Live Desk Feed
                </span>
              </div>

              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-subtle)]">
                  No check-ins recorded yet. Point camera at a student e-pass to begin.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {recentLogs.map((log) => {
                    const isCheckIn = log.type === 'check_in';
                    const timeAgo = new Date(log.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <div
                        key={log.id}
                        className="group p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--surface)] hover:bg-[var(--surface-2)] flex items-center justify-between gap-3 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center font-bold text-[10px] text-[#8f1b1b] shrink-0">
                            {log.attendeeName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-[var(--text)] truncate">
                                {log.attendeeName}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--text-subtle)]">
                                {log.passCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">
                              {log.college}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-[var(--text-subtle)]">
                            {timeAgo}
                          </span>
                          {isCheckIn && (
                            <button
                              onClick={() => handleUndo(log.passCode)}
                              title="Undo Check-In"
                              className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-subtle)] hover:text-amber-700 hover:bg-amber-50 rounded transition-all"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </main>

      {/* Verification Result Modal */}
      <ScanResultModal
        result={scanResult}
        onClose={() => setScanResult(null)}
        onUndo={handleUndo}
      />

      {/* Add Attendee Modal */}
      <AddAttendeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(att) => {
          fetchStats();
          handleScanSuccess(att.passCode);
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportComplete={() => {
          fetchStats();
        }}
      />

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-[var(--border)] py-3 bg-[var(--surface)] text-center text-[11px] text-[var(--text-subtle)]">
        Vision Mysuru 2050 • SDMIMD Campus, Chamundi Hill Road, Mysuru
      </footer>
    </div>
  );
}
