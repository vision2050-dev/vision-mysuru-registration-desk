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
  Sparkles,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Users
} from 'lucide-react';

export default function EmailsPage() {
  const [attendees, setAttendees] = useState<StudentAttendee[]>([]);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
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
  const failedAttendees = attendees.filter((a) => a.emailStatus === 'failed');

  const selectedAttendee = attendees.find((a) => a.id === selectedAttendeeId) || attendees[0];

  const handleBulkDispatch = async () => {
    if (pendingAttendees.length === 0) {
      alert('All registered delegates have already been sent their e-passes!');
      return;
    }

    if (!confirm(`Send official E-Pass invitations to all ${pendingAttendees.length} pending student delegates?`)) {
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
          text: `Successfully dispatched ${data.sent} E-Pass emails! (${data.failed} failed)`,
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
          text: `E-Pass sent successfully to ${data.attendee.name} (${data.attendee.email})! [Mode: ${data.mode}]`,
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text)] flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#8f1b1b]" />
              Automated E-Pass Email Delivery
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Send individual invitations with embedded high-resolution QR e-passes to students.
            </p>
          </div>

          <button
            onClick={handleBulkDispatch}
            disabled={dispatching || pendingAttendees.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] disabled:opacity-50 text-white text-xs font-bold shadow-md hover:shadow-lg transition shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            {dispatching ? 'Dispatching Invitations...' : `Send All Pending E-Passes (${pendingAttendees.length})`}
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800'
                : 'bg-red-500/10 border-red-500/20 text-red-800'
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

        {/* Delivery Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Delivered Successfully
              </span>
              <span className="text-xl font-black text-emerald-600">
                {sentAttendees.length}
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Pending Dispatch
              </span>
              <span className="text-xl font-black text-amber-600">
                {pendingAttendees.length}
              </span>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8f1b1b]/10 text-[#8f1b1b] flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Email Dispatch Mode
              </span>
              <span className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Gmail SMTP / Smart Relay
              </span>
            </div>
          </div>
        </div>

        {/* Live Email Preview & Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Student Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text)] mb-3 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#8f1b1b]" />
                Select Student for Preview
              </h3>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {attendees.map((att) => {
                  const isSelected = att.id === selectedAttendee?.id;
                  const isSent = att.emailStatus === 'sent';

                  return (
                    <button
                      key={att.id}
                      onClick={() => setSelectedAttendeeId(att.id)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#8f1b1b]/10 border-[#8f1b1b]/40 ring-2 ring-[#8f1b1b]/20 text-[var(--text)]'
                          : 'bg-[var(--surface-2)] border-[var(--border)] hover:bg-[var(--surface)] text-[var(--text)]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold truncate">{att.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] truncate">{att.email}</div>
                        <div className="text-[10px] font-mono text-[#8f1b1b] mt-0.5">{att.passCode}</div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
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

            {/* Email Provider Configuration Info Card */}
            <div className="bg-[#f6f2ea] border border-[#ecdcc4] rounded-2xl p-4 text-xs space-y-2.5">
              <div className="font-bold text-[#1f140c] flex items-center gap-1.5 text-xs">
                <Key className="w-4 h-4 text-[#b07c12]" />
                Automated Delivery Configuration
              </div>
              <p className="text-[11px] text-[#6b5b4d] leading-relaxed">
                The platform works with <strong>Gmail SMTP</strong>, <strong>Resend</strong>, or any transactional provider. Set credentials in your <code className="bg-white px-1.5 py-0.5 rounded border border-[#ecdcc4] text-[#8f1b1b]">.env.local</code> or Vercel Environment Variables:
              </p>
              <div className="bg-white p-2.5 rounded-xl border border-[#ecdcc4] font-mono text-[10px] text-[#1f140c] space-y-0.5">
                <div>EMAIL_USER=visionmysuru2050@gmail.com</div>
                <div>EMAIL_PASS=your-google-app-password</div>
              </div>
              <p className="text-[10px] text-[#8a7a6c] italic">
                * If credentials are not set, it operates in instant Simulation Mode with full visual validation.
              </p>
            </div>
          </div>

          {/* Right Column: Live Rendered Email Preview (8 cols) */}
          <div className="lg:col-span-8 flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xs overflow-hidden">
            
            {/* Preview Toolbar */}
            <div className="p-3.5 bg-[#f6f2ea] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#8f1b1b]" />
                <span className="font-bold text-[#1f140c]">
                  Recipient: {selectedAttendee?.name} &lt;{selectedAttendee?.email}&gt;
                </span>
              </div>

              <div className="flex items-center gap-2">
                {selectedAttendee && (
                  <button
                    onClick={() => handleSendSingle(selectedAttendee.id)}
                    disabled={dispatching}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8f1b1b] hover:bg-[#a12626] text-white rounded-lg text-xs font-bold transition shadow-xs"
                  >
                    <Send className="w-3 h-3" />
                    {dispatching ? 'Sending...' : 'Send to this Student'}
                  </button>
                )}
                {selectedAttendee && (
                  <a
                    href={`/pass/${selectedAttendee.passCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)] transition"
                  >
                    <ExternalLink className="w-3 h-3 text-[#b07c12]" />
                    Pass Page
                  </a>
                )}
              </div>
            </div>

            {/* Embedded Live Iframe */}
            <div className="flex-1 min-h-[580px] bg-neutral-100 p-2 sm:p-4">
              {selectedAttendee ? (
                <div className="w-full h-full bg-white rounded-xl shadow-inner border border-neutral-300 overflow-hidden">
                  <iframe
                    src={`/api/email/preview?id=${selectedAttendee.id}`}
                    className="w-full h-full min-h-[550px] border-0"
                    title="Live Email Preview"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-[var(--text-muted)]">
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
