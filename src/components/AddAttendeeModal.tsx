'use client';

import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { StudentAttendee } from '@/types';

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

  if (!isOpen) return null;

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
        throw new Error(data.error || 'Failed to create attendee');
      }

      onCreated(data.attendee);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating attendee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#8f1b1b]" />
            <h3 className="text-sm font-bold text-[var(--text)]">Register Walk-In Delegate</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

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
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating...' : 'Register & Generate Pass'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
