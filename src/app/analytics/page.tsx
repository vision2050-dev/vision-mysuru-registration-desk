'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { DeskStats, StudentAttendee } from '@/types';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Download,
  Building2,
  PieChart,
  RefreshCw,
  Radio,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DeskStats | null>(null);
  const [attendees, setAttendees] = useState<StudentAttendee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/attendees');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAttendees(data.attendees);
      }
    } catch (e) {
      console.warn('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const categoryStats: Record<string, { total: number; checkedIn: number }> = {};
  for (const a of attendees) {
    const cat = a.registrationType || 'Student Delegate';
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, checkedIn: 0 };
    categoryStats[cat].total++;
    if (a.status === 'checked_in') categoryStats[cat].checkedIn++;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
              Attendance Analytics & Reports
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Live synchronized admission statistics across all 5 campus registration desks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-medium border border-[var(--border)] transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#b07c12]" />
              <span>Refresh</span>
            </button>

            <a
              href="/api/export"
              download
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-[10px] font-semibold text-[var(--text-subtle)] uppercase tracking-wider block">
                Overall Campus Admission
              </span>
              <h3 className="text-base font-bold text-[var(--text)] mt-0.5">
                {stats?.totalCheckedIn ?? 0} of {stats?.totalRegistered ?? 0} Delegates Admitted
              </h3>
            </div>

            <div className="text-2xl font-bold text-emerald-700">
              {stats?.checkInRatePercent ?? 0}%
            </div>
          </div>

          {/* Minimalist Progress Bar */}
          <div className="w-full h-2 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${stats?.checkInRatePercent ?? 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-subtle)] mt-2">
            <span>SDMIMD Campus • Reporting: 08:30 AM</span>
            <span>Live Cloud Synchronization Active</span>
          </div>
        </div>

        {/* Registration Desks Live Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              Check-In Volume by Desk Station
            </h3>
            <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              5 Desks Synced
            </span>
          </div>

          {stats?.deskBreakdown && stats.deskBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.deskBreakdown.map((item, idx) => {
                const totalChecked = stats.totalCheckedIn || 1;
                const deskPercent = Math.round((item.checkedIn / totalChecked) * 100);
                return (
                  <div key={idx} className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#8f1b1b] shrink-0" />
                        <span className="text-xs font-semibold text-[var(--text)] truncate max-w-[170px]">
                          {item.deskName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[var(--text)]">
                        {item.checkedIn}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8f1b1b] rounded-full"
                        style={{ width: `${deskPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--text-subtle)]">
                      <span>Share of admissions</span>
                      <span className="font-semibold text-[var(--text-muted)]">{deskPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-[var(--text-subtle)]">
              No desk check-ins recorded yet today. Check-ins from any of the 5 stations will appear here in real time.
            </div>
          )}
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Institution Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#8f1b1b]" />
                Institutional Representation
              </h3>
              <span className="text-[11px] text-[var(--text-subtle)]">
                {stats?.collegeBreakdown?.length ?? 0} Colleges
              </span>
            </div>

            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {stats?.collegeBreakdown?.map((col, idx) => {
                const percent = col.total > 0 ? Math.round((col.checkedIn / col.total) * 100) : 0;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text)] truncate max-w-[280px]">
                        {col.college}
                      </span>
                      <span className="text-[11px] font-medium text-[var(--text-muted)]">
                        <strong>{col.checkedIn}</strong> / {col.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8f1b1b] rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-[#b07c12]" />
                Delegate Categories
              </h3>
              <span className="text-[11px] text-[var(--text-subtle)]">
                Distribution
              </span>
            </div>

            <div className="space-y-2.5">
              {Object.entries(categoryStats).map(([cat, count], idx) => {
                const percent = count.total > 0 ? Math.round((count.checkedIn / count.total) * 100) : 0;
                return (
                  <div key={idx} className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text)]">{cat}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        <strong>{count.checkedIn}</strong> / {count.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
