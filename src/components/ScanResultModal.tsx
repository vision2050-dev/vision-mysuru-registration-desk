'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, ExternalLink, X, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CheckInResult } from '@/lib/store';
import Link from 'next/link';

interface ScanResultModalProps {
  result: CheckInResult | null;
  onClose: () => void;
  onUndo: (passCode: string) => void;
}

export default function ScanResultModal({ result, onClose, onUndo }: ScanResultModalProps) {
  useEffect(() => {
    if (result && result.status === 'SUCCESS') {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#8f1b1b', '#b07c12', '#22c55e', '#e5a93c'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }
  }, [result]);

  if (!result) return null;

  const isSuccess = result.status === 'SUCCESS';
  const isAlready = result.status === 'ALREADY_CHECKED_IN';
  const isError = !isSuccess && !isAlready;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-all transform scale-100 ${
          isSuccess
            ? 'bg-[var(--surface)] border-emerald-500/40 ring-4 ring-emerald-500/10'
            : isAlready
            ? 'bg-[var(--surface)] border-amber-500/50 ring-4 ring-amber-500/10'
            : 'bg-[var(--surface)] border-red-500/50 ring-4 ring-red-500/10'
        }`}
      >
        {/* Banner Header */}
        <div
          className={`p-5 text-center relative ${
            isSuccess
              ? 'bg-gradient-to-r from-emerald-700 to-green-600 text-white'
              : isAlready
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white'
              : 'bg-gradient-to-r from-red-700 to-rose-700 text-white'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner mb-2.5">
            {isSuccess && <CheckCircle2 className="w-9 h-9 text-white" />}
            {isAlready && <AlertTriangle className="w-9 h-9 text-white" />}
            {isError && <XCircle className="w-9 h-9 text-white" />}
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            {isSuccess && 'CHECKED IN SUCCESSFULLY'}
            {isAlready && 'ALREADY CHECKED IN!'}
            {isError && 'VERIFICATION FAILED'}
          </h3>

          <p className="text-xs text-white/90 font-medium mt-1">
            {isSuccess && 'Student delegate verified for Vision Mysuru 2050'}
            {isAlready && 'This e-pass has already been admitted to campus'}
            {isError && result.message}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {result.attendee && (
            <div className="space-y-3">
              {/* Delegate Header */}
              <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h4 className="text-lg font-bold text-[var(--text)]">
                    {result.attendee.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    {result.attendee.college}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-[#8f1b1b]/10 text-[#8f1b1b] border border-[#8f1b1b]/20 whitespace-nowrap">
                  {result.attendee.registrationType}
                </span>
              </div>

              {/* Detail Rows */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--surface-2)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Pass Code
                  </span>
                  <span className="font-mono font-bold text-[#8f1b1b] text-sm">
                    {result.attendee.passCode}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface-2)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    USN / Roll No
                  </span>
                  <span className="font-semibold text-[var(--text)]">
                    {result.attendee.usn || 'N/A'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface-2)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Branch / Program
                  </span>
                  <span className="text-[var(--text)] font-medium truncate block">
                    {result.attendee.branch || 'General Delegation'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--surface-2)]">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Phone / Contact
                  </span>
                  <span className="text-[var(--text)] font-medium">
                    {result.attendee.phone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Already Checked-in Warning Box */}
              {isAlready && result.priorCheckIn && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Prior Check-in Record:
                  </div>
                  <div>
                    <strong>Time:</strong>{' '}
                    {new Date(result.priorCheckIn.at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                  <div>
                    <strong>Desk:</strong> {result.priorCheckIn.by}
                  </div>
                  <p className="text-[11px] text-amber-700 italic pt-1">
                    Please cross-verify the student&apos;s physical College ID card to prevent ticket pass-backs.
                  </p>
                </div>
              )}

              {/* Success Badge Info */}
              {isSuccess && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Marked present at <strong>{new Date().toLocaleTimeString()}</strong> by{' '}
                    <strong>{result.attendee.checkedInBy || 'Current Desk'}</strong>.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
            {result.attendee && (
              <Link
                href={`/pass/${result.attendee.passCode}`}
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-[var(--surface-2)] hover:bg-[#b07c12]/15 text-[var(--text)] border border-[var(--border)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#b07c12]" />
                View E-Pass
              </Link>
            )}

            {isAlready && result.attendee && (
              <button
                onClick={() => {
                  if (result.attendee) onUndo(result.attendee.passCode);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Undo Check-in
              </button>
            )}

            <button
              onClick={onClose}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                isSuccess
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : isAlready
                  ? 'bg-[var(--primary)] hover:bg-[#a12626]'
                  : 'bg-neutral-800 hover:bg-neutral-900'
              }`}
            >
              {isSuccess ? 'Scan Next Student' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
