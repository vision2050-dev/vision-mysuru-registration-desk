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
  Activity,
  RotateCcw,
  RefreshCw
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
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Compute category breakdown
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)] flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#8f1b1b]" />
              Event Attendance Analytics & Reports
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Real-time check-in velocity, institutional representation, and delegate verification logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] text-xs font-semibold border border-[var(--border)] transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#b07c12]" />
              Refresh
            </button>

            <a
              href="/api/export"
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] text-white text-xs font-bold shadow-xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official Attendance CSV
            </a>
          </div>
        </div>

        {/* Attendance Progress Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[10px] font-extrabold text-[#8f1b1b] uppercase tracking-wider block">
                Overall Check-in Progress
              </span>
              <h3 className="text-xl font-bold text-[var(--text)]">
                {stats?.totalCheckedIn ?? 0} of {stats?.totalRegistered ?? 0} Delegates Admitted
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-emerald-600">
                {stats?.checkInRatePercent ?? 0}%
              </span>
              <span className="text-xs text-[var(--text-muted)] max-w-[130px] leading-tight">
                Campus admission verification rate
              </span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="w-full h-4 bg-[var(--surface-2)] rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
            <div
              className="h-full bg-gradient-to-r from-[#8f1b1b] via-[#b07c12] to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${stats?.checkInRatePercent ?? 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-2 font-medium">
            <span>0% (Gates Open 8:30 AM)</span>
            <span>Venue Capacity: SDMIMD Auditorium</span>
            <span>100% Full Attendance</span>
          </div>
        </div>

        {/* Institution & Category Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* College Breakdown (7 cols) */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#8f1b1b]" />
                Institutional Representation (Colleges of Mysuru)
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                {stats?.collegeBreakdown?.length ?? 0} Institutions
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {stats?.collegeBreakdown?.map((col, idx) => {
                const percent = col.total > 0 ? Math.round((col.checkedIn / col.total) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[var(--text)] truncate max-w-[280px]">
                        {col.college}
                      </span>
                      <span className="text-[#8f1b1b] font-bold">
                        {col.checkedIn} / {col.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
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
          <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#b07c12]" />
                Delegate Categories
              </h3>
              <span className="text-[11px] text-[var(--text-muted)]">
                Types
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(categoryStats).map(([cat, count], idx) => {
                const percent = count.total > 0 ? Math.round((count.checkedIn / count.total) * 100) : 0;
                return (
                  <div key={idx} className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[var(--text)]">{cat}</span>
                      <span className="text-emerald-700 font-bold">
                        {count.checkedIn} of {count.total} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
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
