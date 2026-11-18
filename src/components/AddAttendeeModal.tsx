'use client';

import React, { useState } from 'react';
import { X, Ticket, Check, ExternalLink, Copy, Mail, Sparkles } from 'lucide-react';
import { StudentAttendee } from '@/types';
import Link from 'next/link';

interface AddAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (attendee: StudentAttendee) => void;
}

export default function AddAttendeeModal({ isOpen, onClose, onCreated }: AddAttendeeModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('SDM Institute for Management Development (SDMIMD)');
  const [branch, setBranch] = useState('');
  const [usn, setUsn] = useState('');
  const [registrationType, setRegistrationType] = useState<StudentAttendee['registrationType']>('Student Delegate');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPass, setGeneratedPass] = useState<StudentAttendee | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBranch('');
    setUsn('');
    setNotes('');
    setGeneratedPass(null);
    setCopied(false);
    setEmailSent(false);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Student name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          college,
          branch,
          usn,
          registrationType,
          notes,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate e-pass');
      }

      setGeneratedPass(data.attendee);
      onCreated(data.attendee);
    } catch (err: any) {
      setError(err.message || 'Error generating e-pass');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedPass) return;
    navigator.clipboard.writeText(generatedPass.passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmailNow = async () => {
    if (!generatedPass) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId: generatedPass.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      }
    } catch (err) {
      console.error('Email sending failed:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#8f1b1b]" />
            <h3 className="text-sm font-bold text-[var(--text)]">
              {generatedPass ? 'E-Pass Generated' : 'Generate New E-Pass'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {generatedPass ? (
          /* Generated Pass Confirmation View */
          <div className="p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[var(--text)]">
                E-Pass Successfully Created!
              </h4>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Delegate registered and unique digital QR pass generated.
              </p>
            </div>

            {/* Pass Code Box */}
            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-left space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] block">
                    Pass Verification ID
                  </span>
                  <span className="font-mono text-base font-bold text-[#8f1b1b]">
                    {generatedPass.passCode}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs text-[var(--text)] transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[var(--border)] text-xs">
                <div className="font-semibold text-[var(--text)]">{generatedPass.name}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{generatedPass.college}</div>
                <div className="text-[11px] text-[var(--text-subtle)] font-mono">{generatedPass.email}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href={`/pass/${generatedPass.passCode}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] text-xs font-semibold border border-[var(--border)] transition-colors shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#b07c12]" />
                <span>View & Print Pass</span>
              </Link>

              <button
                type="button"
                onClick={handleSendEmailNow}
                disabled={sendingEmail || emailSent}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] disabled:opacity-60 text-white text-xs font-semibold shadow-2xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{emailSent ? 'Email Sent ✓' : sendingEmail ? 'Sending...' : 'Email Pass'}</span>
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-[var(--text-muted)] hover:text-[#8f1b1b] hover:underline font-medium"
              >
                + Generate Another Pass
              </button>
            </div>
          </div>
        ) : (
          /* Input Form View */
          <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-[#b07c12]/8 border border-[#b07c12]/20 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#b07c12] shrink-0" />
              <span>Fill in student details below to generate an instant, individual QR E-Pass.</span>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@college.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>
            </div>

            {/* Phone & USN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  USN / Roll Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4NI22CS045"
                  value={usn}
                  onChange={(e) => setUsn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>
            </div>

            {/* College / Institution */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                College / Institution
              </label>
              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              >
                <option value="SDM Institute for Management Development (SDMIMD)">
                  SDM Institute for Management Development (SDMIMD)
                </option>
                <option value="JSS Science and Technology University (SJCE)">
                  JSS Science and Technology University (SJCE)
                </option>
                <option value="The National Institute of Engineering (NIE Mysuru)">
                  The National Institute of Engineering (NIE Mysuru)
                </option>
                <option value="University of Mysore (Manasagangotri)">
                  University of Mysore (Manasagangotri)
                </option>
                <option value="Vidyavardhaka College of Engineering (VVCE)">
                  Vidyavardhaka College of Engineering (VVCE)
                </option>
                <option value="Amrita Vishwa Vidyapeetham, Mysuru Campus">
                  Amrita Vishwa Vidyapeetham, Mysuru Campus
                </option>
                <option value="Maharaja Institute of Technology Mysore (MITM)">
                  Maharaja Institute of Technology Mysore (MITM)
                </option>
                <option value="Yuvaraja's College Mysuru">
                  Yuvaraja&apos;s College Mysuru
                </option>
                <option value="Other College / Citizen Delegate">
                  Other College / Citizen Delegate
                </option>
              </select>
            </div>

            {/* Branch & Registration Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Program / Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. MBA / B.E. Computer Science"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                  Category
                </label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                >
                  <option value="Student Delegate">Student Delegate</option>
                  <option value="Ideathon Finalist">Ideathon Finalist</option>
                  <option value="Paper Presenter">Paper Presenter</option>
                  <option value="Faculty / Mentor">Faculty / Mentor</option>
                  <option value="VIP Guest">VIP Guest</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Finalist team member"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>{loading ? 'Generating...' : 'Generate E-Pass Now'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
