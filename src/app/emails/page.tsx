'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { StudentAttendee } from '@/types';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Users,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';

export default function EmailsPage() {
  const [attendees, setAttendees] = useState<StudentAttendee[]>([]);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAttendees = useCallback(async () => {
    try {
      const res = await fetch('/api/attendees');
      const data = await res.json();
      if (data.success) {
        setAttendees(data.attendees);
        if (!selectedAttendeeId && data.attendees.length > 0) {
          setSelectedAttendeeId(data.attendees[0].id);
        }
      }
    } catch (e) {
      console.warn('Error fetching attendees:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedAttendeeId]);

  useEffect(() => {
    fetchAttendees();
  }, [fetchAttendees]);

  const pendingAttendees = attendees.filter((a) => a.emailStatus === 'pending');
  const sentAttendees = attendees.filter((a) => a.emailStatus === 'sent');

  const selectedAttendee = attendees.find((a) => a.id === selectedAttendeeId) || attendees[0];

  const handleBulkDispatch = async () => {
    if (pendingAttendees.length === 0) {
      alert('All registered delegates have already received their e-passes.');
      return;
    }

    if (!confirm(`Send official E-Pass invitations to all ${pendingAttendees.length} pending delegates?`)) {
      return;
    }

    setDispatching(true);
    setMessage(null);

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk' }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Successfully dispatched ${data.sent} E-Pass emails.`,
        });
        fetchAttendees();
      } else {
        throw new Error(data.error || 'Failed to dispatch emails');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error dispatching emails' });
    } finally {
      setDispatching(false);
    }
  };

  const handleSendSingle = async (attendeeId: string) => {
    setDispatching(true);
    setMessage(null);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `E-Pass sent to ${data.attendee.name} (${data.attendee.email}).`,
        });
        fetchAttendees();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send' });
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)] flex items-center gap-2">
              Automated E-Pass Delivery
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Send personalized invitations with scannable QR passes to student inboxes.
            </p>
          </div>

          <button
            onClick={handleBulkDispatch}
            disabled={dispatching || pendingAttendees.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] disabled:opacity-50 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {dispatching ? 'Dispatching...' : `Send All Pending (${pendingAttendees.length})`}
            </span>
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Status Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider block">
                Delivered Successfully
              </span>
              <span className="text-lg font-bold text-emerald-700">
                {sentAttendees.length}
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider block">
                Pending Dispatch
              </span>
              <span className="text-lg font-bold text-amber-700">
                {pendingAttendees.length}
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] text-[#8f1b1b] flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] tracking-wider block">
                Dispatch Engine
              </span>
              <span className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Gmail SMTP / Smart Relay
              </span>
            </div>
          </div>
        </div>

        {/* Email Preview & Directory Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Delegate List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-2xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)] block mb-2 px-1">
                Select Delegate to Preview
              </span>

              <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                {attendees.length === 0 && (
                  <div className="p-6 text-center text-xs text-[var(--text-subtle)] space-y-3">
                    <p>No delegates registered yet.</p>
                    <Link
                      href="/generate"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>+ Generate E-Pass</span>
                    </Link>
                  </div>
                )}
                {attendees.map((att) => {
                  const isSelected = att.id === selectedAttendee?.id;
                  const isSent = att.emailStatus === 'sent';

                  return (
                    <button
                      key={att.id}
                      onClick={() => setSelectedAttendeeId(att.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#8f1b1b]/8 border-[#8f1b1b]/30 text-[var(--text)]'
                          : 'bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold truncate">{att.name}</div>
                        <div className="text-[11px] text-[var(--text-subtle)] truncate font-mono">{att.passCode}</div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isSent
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isSent ? 'Sent' : 'Pending'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Email Client Frame (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xs overflow-hidden">
            
            {/* Header Toolbar */}
            <div className="p-3 bg-[var(--surface-2)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-3.5 h-3.5 text-[#8f1b1b] shrink-0" />
                <span className="font-semibold text-[var(--text)] truncate">
                  {selectedAttendee ? `To: ${selectedAttendee.name} <${selectedAttendee.email}>` : 'Select a recipient'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedAttendee && (
                  <button
                    onClick={() => handleSendSingle(selectedAttendee.id)}
                    disabled={dispatching}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8f1b1b] hover:bg-[#781616] text-white rounded-md text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>{dispatching ? 'Sending...' : 'Send This Invitation'}</span>
                  </button>
                )}
                {selectedAttendee && (
                  <a
                    href={`/pass/${selectedAttendee.passCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[var(--text-subtle)] hover:text-[#b07c12] rounded hover:bg-[var(--surface-3)]"
                    title="Open Pass Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Embedded Iframe */}
            <div className="flex-1 min-h-[540px] bg-neutral-100 p-2 sm:p-3">
              {selectedAttendee ? (
                <div className="w-full h-full bg-white rounded-lg shadow-2xs border border-neutral-300 overflow-hidden">
                  <iframe
                    src={`/api/email/preview?id=${selectedAttendee.id}`}
                    className="w-full h-full min-h-[500px] border-0"
                    title="Email Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[var(--text-subtle)]">
                  Select an attendee to preview invitation email
                </div>
              )}
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
