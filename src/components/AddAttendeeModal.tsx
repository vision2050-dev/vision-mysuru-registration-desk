'use client';

import React, { useState } from 'react';
import { X, UserPlus, Building, Mail, Phone, BookOpen, Hash, Tag, FileText, CheckCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#8f1b1b] to-[#a12626] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#fce79f]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Student / Attendee</h3>
              <p className="text-xs text-[#fce79f]">Generates an instant, unique E-Pass ID & QR Code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Student Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Student Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ramesh@college.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
              </div>
            </div>
          </div>

          {/* Phone & USN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                USN / Roll Number
              </label>
              <input
                type="text"
                placeholder="e.g. 4NI22CS045"
                value={usn}
                onChange={(e) => setUsn(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>
          </div>

          {/* College / Institution */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              College / Institution
            </label>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
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
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Branch / Specialization
              </label>
              <input
                type="text"
                placeholder="e.g. MBA / B.E. Computer Science"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Delegate Category
              </label>
              <select
                value={registrationType}
                onChange={(e) => setRegistrationType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
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
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Remarks / Special Access Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Stage presenter, dietary requirements"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--surface-2)] text-[var(--text)] hover:bg-[var(--border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {loading ? 'Creating E-Pass...' : 'Generate E-Pass'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
