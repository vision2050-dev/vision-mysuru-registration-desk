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
        <div className="text-center py-16 space-y-2.5">
          <RefreshCw className="w-6 h-6 text-[#8f1b1b] animate-spin mx-auto" />
          <p className="text-xs font-medium text-[var(--text-muted)]">
            Loading E-Pass Badge...
          </p>
        </div>
      ) : error || !attendee || !event ? (
        <div className="max-w-sm w-full bg-white rounded-2xl p-6 border border-neutral-200 shadow-lg text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-neutral-900">Pass Code Not Found</h2>
          <p className="text-xs text-neutral-500">
            {error || 'No delegate registration found matching this pass code.'}
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8f1b1b] hover:bg-[#781616] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Go to Desk
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
    <div className="min-h-screen bg-[#fcfbfa] text-[#19140f] flex flex-col py-6 px-4 sm:px-6">
      {/* Top minimal header */}
      <div className="max-w-sm w-full mx-auto mb-4 flex items-center justify-between no-print">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[#8f1b1b] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Desk Scanner</span>
        </Link>

        <span className="text-[11px] font-semibold text-[#b07c12] flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Pass</span>
        </span>
      </div>

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center text-center py-16 space-y-2.5">
            <RefreshCw className="w-6 h-6 text-[#8f1b1b] animate-spin mx-auto" />
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Loading Pass...
            </p>
          </div>
        }
      >
        <PassContent />
      </Suspense>

      {/* Public Footer */}
      <footer className="mt-8 text-center text-[11px] text-neutral-400 no-print">
        Vision Mysuru 2050 Secretariat • SDMIMD Campus, Mysuru
      </footer>
    </div>
  );
}
