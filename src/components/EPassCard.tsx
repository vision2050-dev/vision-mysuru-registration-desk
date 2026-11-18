'use client';

import React from 'react';
import { StudentAttendee, EventInfo } from '@/types';
import { Calendar, Clock, MapPin, Printer, ShieldCheck, CheckCircle2, Ticket } from 'lucide-react';

interface EPassCardProps {
  attendee: StudentAttendee;
  qrDataUrl: string;
  event: EventInfo;
}

export default function EPassCard({ attendee, qrDataUrl, event }: EPassCardProps) {
  const isCheckedIn = attendee.status === 'checked_in';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Printable E-Pass Badge Container */}
      <div className="print-pass-container relative bg-white rounded-3xl shadow-xl border-2 border-[#b07c12]/40 overflow-hidden text-[#1f140c]">
        
        {/* Top Crimson Banner */}
        <div className="relative bg-gradient-to-r from-[#8f1b1b] via-[#a12626] to-[#8f1b1b] text-white p-5 pt-6 pb-5 text-center border-b-4 border-[#b07c12]">
          {/* Subtle watermark badge */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-extrabold tracking-widest text-[#fce79f] uppercase bg-black/25 px-2.5 py-0.5 rounded-full border border-[#fce79f]/30">
              OFFICIAL STUDENT DELEGATE PASS
            </span>
            <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-full">
              {attendee.registrationType}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_final.png"
                alt="Vision Mysuru 2050"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">
                {event.title}
              </h1>
              <p className="text-[11px] text-[#fce79f] font-medium leading-tight">
                Youth & Innovation Summit • Mysuru
              </p>
            </div>
          </div>
        </div>

        {/* Decorative Ticket Perforation Notches */}
        <div className="relative flex items-center justify-between bg-[#f6f2ea] px-4 py-1.5 border-b border-dashed border-[#b07c12]/30">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border-r-2 border-[#b07c12]/40" />
          <div className="text-[11px] font-mono font-bold text-[#8f1b1b] tracking-wider mx-auto">
            PASS ID: {attendee.passCode}
          </div>
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[var(--bg)] border-l-2 border-[#b07c12]/40" />
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-6 text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <div className="p-3 bg-white border-2 border-[#b07c12]/30 rounded-2xl shadow-md inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR E-Pass for ${attendee.name}`}
                width={200}
                height={200}
                className="w-48 h-48 object-contain mx-auto"
              />
            </div>

            {/* Check-in Watermark Stamp */}
            {isCheckedIn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-12 border-4 border-emerald-600 bg-white/95 text-emerald-700 px-4 py-2 rounded-xl shadow-2xl font-black text-sm tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ADMITTED & VERIFIED
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#6b5b4d] font-semibold">
            Present this QR code at campus registration desk for scanning
          </p>

          {/* Attendee Credential Card */}
          <div className="bg-[#fcfaf7] border border-[#fae4b5] rounded-2xl p-4 text-left space-y-2.5">
            <div>
              <span className="text-[10px] text-[#8a7a6c] uppercase font-bold tracking-wider block">
                Delegate Name
              </span>
              <span className="text-base font-extrabold text-[#1f140c] block">
                {attendee.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#f0e6d6]">
              <div>
                <span className="text-[10px] text-[#8a7a6c] uppercase font-bold tracking-wider block">
                  Institution
                </span>
                <span className="text-xs font-semibold text-[#1f140c] line-clamp-2">
                  {attendee.college}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8a7a6c] uppercase font-bold tracking-wider block">
                  USN / Roll Number
                </span>
                <span className="text-xs font-mono font-bold text-[#8f1b1b]">
                  {attendee.usn || 'N/A'}
                </span>
              </div>
            </div>

            {attendee.branch && (
              <div className="pt-1 border-t border-[#f0e6d6]">
                <span className="text-[10px] text-[#8a7a6c] uppercase font-bold tracking-wider block">
                  Program / Department
                </span>
                <span className="text-xs text-[#4a3f35] font-medium">
                  {attendee.branch}
                </span>
              </div>
            )}
          </div>

          {/* Event Venue & Time Details */}
          <div className="bg-[#f6f2ea] rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#8f1b1b] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1f140c] block">{event.date}</span>
                <span className="text-[11px] text-[#6b5b4d]">{event.time}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1.5 border-t border-[#ecdcc4]">
              <Clock className="w-4 h-4 text-[#b07c12] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#8f1b1b]">Reporting: {event.reportingTime}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1.5 border-t border-[#ecdcc4]">
              <MapPin className="w-4 h-4 text-[#8f1b1b] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#1f140c] block">{event.venue}</span>
                <span className="text-[11px] text-[#6b5b4d] block">{event.venueDetails}</span>
              </div>
            </div>
          </div>

          {/* Security & Verification Footer */}
          <div className="flex items-center justify-between text-[10px] text-[#8a7a6c] pt-2 px-1">
            <span className="flex items-center gap-1 font-semibold text-[#8f1b1b]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Official SDMIMD Verified Pass
            </span>
            <span>Issue Date: Nov 2026</span>
          </div>
        </div>

        {/* Bottom Gold Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-[#b07c12] via-[#e5a93c] to-[#b07c12]" />
      </div>

      {/* Screen Action Controls (Hidden when printed) */}
      <div className="no-print mt-5 flex items-center justify-center gap-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8f1b1b] hover:bg-[#a12626] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent('SDMIMD Mysuru Chamundi Hill Road')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--border)] hover:bg-[var(--surface-2)] text-[var(--text)] rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-[#b07c12]" />
          Campus Map
        </a>
      </div>
    </div>
  );
}
