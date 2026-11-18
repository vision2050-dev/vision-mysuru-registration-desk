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
  Filter,
  UserPlus,
  FileSpreadsheet,
  Download,
  Mail,
  Send,
  Ticket,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
  Eye,
  RefreshCw
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
        alert(`Dispatched e-passes: ${data.sent} sent successfully!`);
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
    if (!confirm(`Are you sure you want to remove ${name} from the delegate register?`)) return;

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
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Users className="w-6 h-6 text-[#8f1b1b]" />
              Student Attendees & E-Pass Registry
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage registered students, track attendance badges, and issue QR e-passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] text-white text-xs font-bold shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Add Delegate
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b07c12] hover:bg-[#96670a] text-white text-xs font-bold shadow-xs transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Import CSV
            </button>

            <a
              href="/api/export"
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text)] text-xs font-semibold border border-[var(--border)] transition"
            >
              <Download className="w-3.5 h-3.5 text-[#b07c12]" />
              Export
            </a>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, email, pass ID, or USN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              >
                <option value="">All Check-In Statuses</option>
                <option value="checked_in">Checked In (Admitted)</option>
                <option value="registered">Pending Arrival</option>
              </select>
            </div>

            {/* Action for Selected */}
            <div className="sm:col-span-3 flex items-center justify-end">
              <button
                onClick={handleBulkSendEmails}
                disabled={bulkSending}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#8f1b1b]/10 text-[#8f1b1b] hover:bg-[#8f1b1b]/20 text-xs font-bold border border-[#8f1b1b]/30 transition"
              >
                <Mail className="w-3.5 h-3.5" />
                {bulkSending ? (
                  'Dispatching...'
                ) : selectedIds.length > 0 ? (
                  `Send E-Pass to (${selectedIds.length})`
                ) : (
                  'Send to All Pending'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Attendees Table */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f6f2ea] text-[#1f140c] font-bold border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={attendees.length > 0 && selectedIds.length === attendees.length}
                      className="rounded"
                    />
                  </th>
                  <th className="py-3 px-3">Student Delegate</th>
                  <th className="py-3 px-3">Pass ID</th>
                  <th className="py-3 px-3">College & USN</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Check-In</th>
                  <th className="py-3 px-3">Invitation Email</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8f1b1b]" />
                      Loading delegate registry...
                    </td>
                  </tr>
                ) : attendees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[var(--text-muted)]">
                      No student delegates found matching current filters.
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
                          isSelected ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(att.id)}
                            className="rounded"
                          />
                        </td>

                        {/* Delegate Name & Email */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--text)]">{att.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{att.email}</div>
                          {att.phone && (
                            <div className="text-[10px] text-[var(--text-muted)]">{att.phone}</div>
                          )}
                        </td>

                        {/* Pass ID */}
                        <td className="py-3 px-3">
                          <Link
                            href={`/pass/${att.passCode}`}
                            target="_blank"
                            className="font-mono font-bold text-[#8f1b1b] hover:underline flex items-center gap-1"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            {att.passCode}
                          </Link>
                        </td>

                        {/* College & USN */}
                        <td className="py-3 px-3">
                          <div className="font-medium text-[var(--text)] line-clamp-1 max-w-[200px]">
                            {att.college}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {att.usn ? `USN: ${att.usn}` : att.branch || 'Delegation'}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8f1b1b]/10 text-[#8f1b1b] border border-[#8f1b1b]/20 whitespace-nowrap">
                            {att.registrationType}
                          </span>
                        </td>

                        {/* Check-In Status */}
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleCheckIn(att)}
                            title="Click to toggle check-in status"
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              isChecked
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {isChecked ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Checked In
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-neutral-400" />
                                Pending
                              </>
                            )}
                          </button>
                          {isChecked && att.checkedInAt && (
                            <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                              {new Date(att.checkedInAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </td>

                        {/* Email Status */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[11px] font-semibold ${
                                emailSent
                                  ? 'text-emerald-700 font-bold'
                                  : att.emailStatus === 'failed'
                                  ? 'text-red-600'
                                  : 'text-amber-700'
                              }`}
                            >
                              {emailSent ? 'Delivered' : att.emailStatus === 'failed' ? 'Failed' : 'Pending'}
                            </span>
                            <button
                              onClick={() => handleSendEmail(att.id)}
                              disabled={sendingId === att.id}
                              title="Send or resend e-pass email"
                              className="p-1 rounded text-[var(--text-muted)] hover:text-[#8f1b1b] hover:bg-[var(--surface-2)] transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setPreviewAttendee(att)}
                              title="Preview Email Invitation"
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#8f1b1b] hover:bg-[var(--surface-2)] transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <Link
                              href={`/pass/${att.passCode}`}
                              target="_blank"
                              title="Open Public E-Pass Badge"
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[#b07c12] hover:bg-[var(--surface-2)] transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleDelete(att.id, att.name)}
                              title="Delete attendee"
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 transition"
                            >
                              <Trash2 className="w-4 h-4" />
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
