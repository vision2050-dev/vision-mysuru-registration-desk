'use client';

import React from 'react';
import { X, Mail, Send, ExternalLink } from 'lucide-react';
import { StudentAttendee } from '@/types';

interface EmailPreviewModalProps {
  attendee: StudentAttendee | null;
  isOpen: boolean;
  onClose: () => void;
  onSendNow?: (attendeeId: string) => void;
  sending?: boolean;
}

export default function EmailPreviewModal({
  attendee,
  isOpen,
  onClose,
  onSendNow,
  sending = false,
}: EmailPreviewModalProps) {
  if (!isOpen || !attendee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#8f1b1b] to-[#a12626] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#fce79f]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Invitation E-Pass Email Preview
              </h3>
              <p className="text-xs text-[#fce79f]">
                Live preview of email sent to {attendee.name} ({attendee.email})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Info Bar */}
        <div className="bg-[#f6f2ea] p-3 px-4 border-b border-[var(--border)] text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6b5b4d] w-16">Subject:</span>
            <span className="font-semibold text-[#1f140c]">
              Your Official E-Pass: Vision Mysuru 2050 Summit ({attendee.passCode})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6b5b4d] w-16">To:</span>
            <span className="text-[#1f140c]">{attendee.name} &lt;{attendee.email}&gt;</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#6b5b4d] w-16">From:</span>
            <span className="text-[#1f140c]">Vision Mysuru 2050 Secretariat &lt;visionmysuru2050@gmail.com&gt;</span>
          </div>
        </div>

        {/* Live Iframe Body */}
        <div className="flex-1 bg-neutral-100 p-2 sm:p-4 overflow-hidden flex flex-col">
          <div className="w-full flex-1 bg-white rounded-xl shadow-inner border border-neutral-300 overflow-hidden">
            <iframe
              src={`/api/email/preview?id=${attendee.id}`}
              className="w-full h-full border-0"
              title="Email Invitation Preview"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between">
          <a
            href={`/pass/${attendee.passCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f1b1b] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Student E-Pass Web View
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            >
              Close
            </button>
            {onSendNow && (
              <button
                onClick={() => onSendNow(attendee.id)}
                disabled={sending}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Dispatching...' : 'Send This Invitation Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
