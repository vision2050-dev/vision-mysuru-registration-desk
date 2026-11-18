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
} from 'lucide-react';
import Link from 'next/link';

export default function RegistrationDeskPage() {
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([]);
  const [deskName, setDeskName] = useState('Registration Desk 1 (Auditorium)');
  const [manualCode, setManualCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentAttendee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
    const interval = setInterval(fetchStats, 6000); // 6s poll for live multi-desk sync
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

  // Search attendees dynamically as typing
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
    }, 250);

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
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8f1b1b] via-[#6e1212] to-[#8f1b1b] text-white p-6 sm:p-8 shadow-md border border-[#b07c12]/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#fce79f] text-xs font-semibold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Live Campus Event Desk
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Vision Mysuru 2050 Registration Desk
              </h1>
              <p className="mt-1 text-sm text-[#fce79f] max-w-2xl font-medium">
                Streamlined delegate check-in: Scan individual student e-passes, verify credentials, and track real-time venue attendance.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#8f1b1b] text-xs font-bold hover:bg-neutral-100 transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Walk-in
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#b07c12] text-white text-xs font-bold hover:bg-[#96670a] transition shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Bulk CSV Import
              </button>

              <a
                href="/api/export"
                download
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </a>
            </div>
          </div>
        </div>

        {/* Live Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Registered */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#8f1b1b]/10 text-[#8f1b1b] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Total Registered
              </span>
              <span className="text-2xl font-black text-[var(--text)]">
                {stats?.totalRegistered ?? '...'}
              </span>
            </div>
          </div>

          {/* Checked-In */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Checked In
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600">
                  {stats?.totalCheckedIn ?? '...'}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {stats?.checkInRatePercent ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Pending Arrival */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                Pending Arrival
              </span>
              <span className="text-2xl font-black text-amber-600">
                {stats?.totalPending ?? '...'}
              </span>
            </div>
          </div>

          {/* Invitations Sent */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#b07c12]/10 text-[#b07c12] flex items-center justify-center shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                E-Passes Emailed
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text)]">
                  {stats?.totalEmailsSent ?? '...'}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  ({stats?.totalEmailsPending ?? 0} pending)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Desk Operations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live QR Camera Scanner (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              isProcessing={isProcessing}
            />

            {/* Quick Manual Code Input */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8f1b1b]" />
                Manual Code Entry / USB Barcode Scanner
              </h3>
              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. VM2050-7821-MYS or USN"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
                <button
                  type="submit"
                  disabled={!manualCode.trim() || isProcessing}
                  className="px-4 py-2 bg-[#8f1b1b] hover:bg-[#a12626] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0"
                >
                  Verify
                </button>
              </form>
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Volunteers can paste the pass code or scan with handheld laser scanners.
              </p>
            </div>
          </div>

          {/* Right Column: Search + Recent Check-in Activity (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Quick Search Student Desk Bar */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-[#b07c12]" />
                  Instant Student Lookup & Check-In
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  For students without phone or forgotten pass
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by Name, College, Email, or USN (e.g. 4NI22CV034)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>

              {/* Dynamic Instant Search Results Dropdown/Card */}
              {searchResults.length > 0 && (
                <div className="mt-3 border border-[var(--border)] rounded-xl overflow-hidden divide-y divide-[var(--border)] animate-in fade-in">
                  <div className="bg-[#f6f2ea] px-3 py-1.5 text-[11px] font-bold text-[#6b5b4d]">
                    Matching Delegates Found ({searchResults.length}):
                  </div>
                  {searchResults.map((att) => {
                    const isChecked = att.status === 'checked_in';
                    return (
                      <div
                        key={att.id}
                        className="p-3 bg-[var(--surface)] hover:bg-[var(--surface-2)] flex items-center justify-between gap-3 transition-colors text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[var(--text)] truncate">{att.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[#8f1b1b] font-bold">
                              {att.passCode}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] truncate">
                            {att.college} {att.usn && `• USN: ${att.usn}`}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isChecked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Checked In
                            </span>
                          ) : (
                            <button
                              onClick={() => handleScanSuccess(att.passCode)}
                              className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-xs transition"
                            >
                              Check In Now
                            </button>
                          )}
                          <Link
                            href={`/pass/${att.passCode}`}
                            target="_blank"
                            className="p-1.5 text-[var(--text-muted)] hover:text-[#8f1b1b] rounded-lg bg-[var(--surface-2)]"
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

            {/* Live Check-in Activity Stream */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8f1b1b] animate-ping" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                    Live Check-In Activity Feed
                  </h3>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Real-time desk admissions
                </span>
              </div>

              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--text-muted)]">
                  No check-ins recorded yet. Scan a pass to begin!
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
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
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          isCheckIn
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-[var(--text)]'
                            : 'bg-amber-500/5 border-amber-500/20 text-[var(--text-muted)]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isCheckIn
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isCheckIn ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[var(--text)] truncate">
                                {log.attendeeName}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-[#8f1b1b]">
                                {log.passCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-[var(--text-muted)] truncate">
                              {log.college} • <span className="text-[#8f1b1b]">{log.deskName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            {timeAgo}
                          </span>
                          {isCheckIn && (
                            <button
                              onClick={() => handleUndo(log.passCode)}
                              title="Undo this check-in"
                              className="p-1 rounded text-[var(--text-muted)] hover:text-amber-700 hover:bg-amber-100 transition"
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

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border)] py-4 bg-[var(--surface)] text-center text-xs text-[var(--text-muted)]">
        <p>
          Vision Mysuru 2050 Secretariat • Developed for SDMIMD & Think-Tank Partners
        </p>
      </footer>
    </div>
  );
}
