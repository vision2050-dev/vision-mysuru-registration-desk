'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import AddAttendeeModal from '@/components/AddAttendeeModal';
import BulkImportModal from '@/components/BulkImportModal';
import EmailPreviewModal from '@/components/EmailPreviewModal';
import { StudentAttendee } from '@/types';
import {
  Users,
  Search,
  UserPlus,
  FileSpreadsheet,
  Download,
  Mail,
  Send,
  Ticket,
  Check,
  Clock,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<StudentAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [previewAttendee, setPreviewAttendee] = useState<StudentAttendee | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (collegeFilter) params.set('college', collegeFilter);

      const res = await fetch(`/api/attendees?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAttendees(data.attendees);
      }
    } catch (err) {
      console.warn('Error fetching attendees:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, collegeFilter]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  // Handle single email send
  const handleSendEmail = async (attendeeId: string) => {
    setSendingId(attendeeId);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendees();
        if (previewAttendee?.id === attendeeId) {
          setPreviewAttendee(null);
        }
      }
    } catch (err) {
      console.error('Email sending failed:', err);
    } finally {
      setSendingId(null);
    }
  };

  // Handle bulk email send
  const handleBulkSendEmails = async () => {
    if (selectedIds.length === 0 && !confirm('Send E-Pass emails to ALL pending delegates?')) {
      return;
    }

    setBulkSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          attendeeIds: selectedIds.length > 0 ? selectedIds : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Dispatched e-passes: ${data.sent} sent successfully.`);
        setSelectedIds([]);
        fetchAttendees();
      }
    } catch (err) {
      console.error('Bulk sending failed:', err);
    } finally {
      setBulkSending(false);
    }
  };

  // Handle toggle check-in status
  const handleToggleCheckIn = async (attendee: StudentAttendee) => {
    const isCheckedIn = attendee.status === 'checked_in';
    const endpoint = isCheckedIn ? '/api/undo-check-in' : '/api/check-in';

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passCode: attendee.passCode }),
      });
      fetchAttendees();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  // Handle delete attendee
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from registry?`)) return;

    try {
      const res = await fetch(`/api/attendees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAttendees();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Toggle selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(attendees.map((a) => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar onOpenGeneratePass={() => setIsAddModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
              Delegate Registry
              <span className="text-xs font-normal text-[var(--text-muted)]">
                ({attendees.length} total)
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage student registrations, attendance badges, and digital e-passes.
            </p>
          </div>

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

        {/* Filter and Search Bar */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[var(--text-subtle)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, email, pass ID, or USN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              >
                <option value="">All Check-In Statuses</option>
                <option value="checked_in">Checked In (Admitted)</option>
                <option value="registered">Pending Arrival</option>
              </select>
            </div>

            {/* Bulk Action */}
            <div className="sm:col-span-3 flex items-center justify-end">
              <button
                onClick={handleBulkSendEmails}
                disabled={bulkSending}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[#8f1b1b] text-xs font-semibold border border-[var(--border)] transition-colors disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {bulkSending
                    ? 'Sending...'
                    : selectedIds.length > 0
                    ? `Email E-Pass (${selectedIds.length})`
                    : 'Email All Pending'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Clean Attendees Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-2)] text-[var(--text-subtle)] font-semibold text-[11px] uppercase tracking-wider border-b border-[var(--border)]">
                <tr>
                  <th className="py-2.5 px-3 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={attendees.length > 0 && selectedIds.length === attendees.length}
                      className="rounded"
                    />
                  </th>
                  <th className="py-2.5 px-3">Delegate</th>
                  <th className="py-2.5 px-3">Pass ID</th>
                  <th className="py-2.5 px-3">College / USN</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Check-In</th>
                  <th className="py-2.5 px-3">Email Pass</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[var(--text-subtle)]">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-[#8f1b1b]" />
                      Loading delegate registry...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="max-w-md mx-auto flex flex-col items-center justify-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-[#8f1b1b]/10 text-[#8f1b1b] flex items-center justify-center mb-3">
                          <Ticket className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-[var(--text)]">No Attendees Registered Yet</h4>
                        <p className="text-xs text-[var(--text-muted)] mt-1 mb-4 text-center max-w-sm">
                          The attendee registry is ready for real event delegates. Create an individual student e-pass or import your attendee list via CSV.
                        </p>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/generate"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>+ Generate Student E-Pass</span>
                          </Link>
                          <button
                            onClick={() => setIsBulkModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] text-xs font-medium border border-[var(--border)] transition-colors"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-[#b07c12]" />
                            <span>Import CSV</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  attendees.map((att) => {
                    const isChecked = att.status === 'checked_in';
                    const emailSent = att.emailStatus === 'sent';
                    const isSelected = selectedIds.includes(att.id);

                    return (
                      <tr
                        key={att.id}
                        className={`hover:bg-[var(--surface-2)] transition-colors ${
                          isSelected ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(att.id)}
                            className="rounded"
                          />
                        </td>

                        {/* Name & Contact */}
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[var(--text)]">{att.name}</div>
                          <div className="text-[11px] text-[var(--text-subtle)]">{att.email}</div>
                        </td>

                        {/* Pass ID */}
                        <td className="py-2.5 px-3">
                          <Link
                            href={`/pass/${att.passCode}`}
                            target="_blank"
                            className="font-mono font-medium text-[#8f1b1b] hover:underline"
                          >
                            {att.passCode}
                          </Link>
                        </td>

                        {/* College & USN */}
                        <td className="py-2.5 px-3">
                          <div className="text-[var(--text)] truncate max-w-[200px]">
                            {att.college}
                          </div>
                          <div className="text-[11px] text-[var(--text-subtle)] font-mono">
                            {att.usn || att.branch || '—'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3">
                          <span className="text-[11px] text-[var(--text-muted)] font-medium bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)] whitespace-nowrap">
                            {att.registrationType}
                          </span>
                        </td>

                        {/* Check-In Status */}
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleCheckIn(att)}
                            title="Click to toggle check-in status"
                            className="inline-flex items-center gap-1.5 text-xs text-left group"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isChecked ? 'bg-emerald-500' : 'bg-neutral-300'
                              }`}
                            />
                            <span
                              className={`font-medium ${
                                isChecked ? 'text-emerald-700' : 'text-[var(--text-subtle)]'
                              }`}
                            >
                              {isChecked ? 'Admitted' : 'Pending'}
                            </span>
                          </button>
                        </td>

                        {/* Email Status */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] ${
                                emailSent
                                  ? 'text-emerald-700 font-medium'
                                  : 'text-[var(--text-subtle)]'
                              }`}
                            >
                              {emailSent ? 'Sent' : 'Pending'}
                            </span>
                            <button
                              onClick={() => handleSendEmail(att.id)}
                              disabled={sendingId === att.id}
                              title="Send or resend email"
                              className="p-1 text-[var(--text-subtle)] hover:text-[#8f1b1b] rounded transition"
                            >
                              <Send className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setPreviewAttendee(att)}
                              title="Preview Email"
                              className="p-1.5 rounded text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <Link
                              href={`/pass/${att.passCode}`}
                              target="_blank"
                              title="View E-Pass"
                              className="p-1.5 rounded text-[var(--text-subtle)] hover:text-[#b07c12] hover:bg-[var(--surface-3)] transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDelete(att.id, att.name)}
                              title="Delete"
                              className="p-1.5 rounded text-[var(--text-subtle)] hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Add Attendee Modal */}
      <AddAttendeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          fetchAttendees();
        }}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportComplete={() => {
          fetchAttendees();
        }}
      />

      {/* Email Preview Modal */}
      <EmailPreviewModal
        attendee={previewAttendee}
        isOpen={!!previewAttendee}
        onClose={() => setPreviewAttendee(null)}
        onSendNow={handleSendEmail}
        sending={sendingId === previewAttendee?.id}
      />
    </div>
  );
}
