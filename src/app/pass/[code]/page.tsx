'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import EPassCard from '@/components/EPassCard';
import { StudentAttendee, EventInfo } from '@/types';
import { RefreshCw, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function PassContent() {
  const params = useParams();
  const code = params?.code as string;

  const [attendee, setAttendee] = useState<StudentAttendee | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [event, setEvent] = useState<EventInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchPass = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/pass/${code}`);
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Invalid or expired E-Pass code');
        }
        setAttendee(data.attendee);
        setQrDataUrl(data.qrDataUrl);
        setEvent(data.event);
      } catch (err: any) {
        setError(err.message || 'Failed to load E-Pass');
      } finally {
        setLoading(false);
      }
    };

    fetchPass();
  }, [code]);

  return (
    <div className="flex-1 flex items-center justify-center">
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <RefreshCw className="w-8 h-8 text-[#8f1b1b] animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6b5b4d]">
            Generating Official E-Pass Badge...
          </p>
        </div>
      ) : error || !attendee || !event ? (
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-red-800">Invalid E-Pass</h2>
          <p className="text-xs text-neutral-600">
            {error || 'No delegate registration found matching this pass code.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#8f1b1b] text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Go to Registration Desk
            </Link>
          </div>
        </div>
      ) : (
        <EPassCard attendee={attendee} qrDataUrl={qrDataUrl} event={event} />
      )}
    </div>
  );
}

export default function StudentPassPage() {
  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#1f140c] flex flex-col py-6 px-4 sm:px-6">
      {/* Top minimal header */}
      <div className="max-w-md w-full mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f1b1b] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Registration Desk
        </Link>

        <span className="text-[11px] font-bold text-[#b07c12] uppercase tracking-wider flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Pass
        </span>
      </div>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#8f1b1b] animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#6b5b4d]">
              Loading E-Pass Portal...
            </p>
          </div>
        }
      >
        <PassContent />
      </Suspense>

      {/* Public Footer */}
      <footer className="mt-8 text-center text-xs text-[#8a7a6c] no-print">
        <p>Vision Mysuru 2050 Secretariat • SDMIMD Campus, Mysuru</p>
      </footer>
    </div>
  );
}
