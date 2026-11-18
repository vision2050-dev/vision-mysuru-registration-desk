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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-3.5 px-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#8f1b1b]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Email Invitation Preview
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Meta Bar */}
        <div className="bg-[var(--surface-2)] p-2.5 px-5 border-b border-[var(--border)] text-xs space-y-1 text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400 w-14">Subject:</span>
            <span className="text-neutral-900 font-medium">
              Your Official E-Pass: Vision Mysuru 2050 Summit ({attendee.passCode})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400 w-14">To:</span>
            <span className="text-neutral-800">{attendee.name} &lt;{attendee.email}&gt;</span>
          </div>
        </div>

        {/* Iframe View */}
        <div className="flex-1 bg-neutral-100 p-2 sm:p-3 overflow-hidden flex flex-col">
          <div className="w-full flex-1 bg-white rounded-lg shadow-2xs border border-neutral-300 overflow-hidden">
            <iframe
              src={`/api/email/preview?id=${attendee.id}`}
              className="w-full h-full border-0"
              title="Email Invitation Preview"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-5 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between text-xs">
          <a
            href={`/pass/${attendee.passCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#8f1b1b] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open E-Pass Page</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] transition-colors"
            >
              Close
            </button>
            {onSendNow && (
              <button
                onClick={() => onSendNow(attendee.id)}
                disabled={sending}
                className="px-3.5 py-1.5 font-semibold rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>{sending ? 'Sending...' : 'Send This Invitation'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
