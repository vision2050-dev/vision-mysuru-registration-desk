'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, RotateCcw, ExternalLink, X, Building, User, Hash } from 'lucide-react';
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
          particleCount: 35,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#8f1b1b', '#b07c12', '#166534', '#e5a93c'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden transform transition-all">
        
        {/* Modal Header */}
        <div className="p-6 pb-4 text-center relative border-b border-[var(--border)]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status Icon */}
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3">
            {isSuccess && (
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            )}
            {isAlready && (
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            {isError && (
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <XCircle className="w-6 h-6" />
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-[var(--text)]">
            {isSuccess && 'Checked In Successfully'}
            {isAlready && 'Already Checked In'}
            {isError && 'Verification Failed'}
          </h3>

          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isSuccess && 'Delegate admitted to Vision Mysuru 2050'}
            {isAlready && 'This e-pass was previously verified at the registration desk'}
            {isError && result.message}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {result.attendee && (
            <div className="space-y-3">
              {/* Delegate Card */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)]">
                      {result.attendee.name}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      {result.attendee.college}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8f1b1b] bg-[#8f1b1b]/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                    {result.attendee.registrationType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] block">
                      Pass Code
                    </span>
                    <span className="font-mono font-bold text-[#8f1b1b]">
                      {result.attendee.passCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-[var(--text-subtle)] block">
                      USN / Roll No
                    </span>
                    <span className="font-mono text-[var(--text)]">
                      {result.attendee.usn || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Duplicate Entry Warning */}
              {isAlready && result.priorCheckIn && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Prior Check-In Recorded:
                  </div>
                  <div className="text-[11px]">
                    <strong>Time:</strong>{' '}
                    {new Date(result.priorCheckIn.at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}{' '}
                    • <strong>Desk:</strong> {result.priorCheckIn.by}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {result.attendee && (
              <Link
                href={`/pass/${result.attendee.passCode}`}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#b07c12]" />
                <span>View Pass</span>
              </Link>
            )}

            {isAlready && result.attendee && (
              <button
                onClick={() => {
                  if (result.attendee) onUndo(result.attendee.passCode);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold text-white transition-all ${
                isSuccess
                  ? 'bg-[#8f1b1b] hover:bg-[#781616]'
                  : 'bg-neutral-800 hover:bg-neutral-900'
              }`}
            >
              {isSuccess ? 'Scan Next Delegate' : 'Dismiss'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
