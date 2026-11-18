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
    <div className="w-full max-w-sm mx-auto">
      {/* Printable E-Pass Badge Container */}
      <div className="print-pass-container relative bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden text-[#19140f]">
        
        {/* Top Crimson Header */}
        <div className="relative bg-[#8f1b1b] text-white p-5 pb-4 text-center border-b-2 border-[#b07c12]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest text-[#fce79f] uppercase bg-black/20 px-2 py-0.5 rounded">
              STUDENT DELEGATE PASS
            </span>
            <span className="text-[10px] font-medium text-white/80 bg-white/10 px-2 py-0.5 rounded">
              {attendee.registrationType}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-2xs">
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
              <h1 className="text-base font-bold text-white leading-tight">
                Vision Mysuru 2050
              </h1>
              <p className="text-[11px] text-[#fce79f] leading-tight">
                Youth & Citizen Think-Tank Summit
              </p>
            </div>
          </div>
        </div>

        {/* Ticket Perforation Notches */}
        <div className="relative flex items-center justify-between bg-neutral-50 px-4 py-1.5 border-b border-dashed border-neutral-200">
          <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f6f2ea] border-r border-neutral-200" />
          <div className="text-[11px] font-mono font-bold text-[#8f1b1b] tracking-wider mx-auto">
            {attendee.passCode}
          </div>
          <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#f6f2ea] border-l border-neutral-200" />
        </div>

        {/* QR Code Presentation Box */}
        <div className="p-5 text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <div className="p-2.5 bg-white border border-neutral-200 rounded-xl shadow-2xs inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt={`QR E-Pass for ${attendee.name}`}
                width={180}
                height={180}
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>

            {/* Check-In Watermark Stamp */}
            {isCheckedIn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="transform -rotate-12 border-2 border-emerald-600 bg-white/95 text-emerald-700 px-3 py-1.5 rounded-lg shadow-lg font-bold text-xs tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ADMITTED & VERIFIED
                </div>
              </div>
            )}
          </div>

          <p className="text-[11px] text-neutral-500 font-medium">
            Scan at campus entrance for badge collection
          </p>

          {/* Delegate Details Card */}
          <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3.5 text-left space-y-2 text-xs">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider block">
                Delegate Name
              </span>
              <span className="text-sm font-bold text-[#19140f] block mt-0.5">
                {attendee.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200/60">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider block">
                  Institution
                </span>
                <span className="text-[11px] font-medium text-neutral-800 line-clamp-2">
                  {attendee.college}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider block">
                  USN / Roll No
                </span>
                <span className="text-[11px] font-mono font-bold text-[#8f1b1b]">
                  {attendee.usn || 'N/A'}
                </span>
              </div>
            </div>

            {attendee.branch && (
              <div className="pt-2 border-t border-neutral-200/60">
                <span className="text-[10px] text-neutral-400 uppercase font-semibold tracking-wider block">
                  Program / Department
                </span>
                <span className="text-[11px] text-neutral-700 font-medium">
                  {attendee.branch}
                </span>
              </div>
            )}
          </div>

          {/* Venue & Schedule */}
          <div className="bg-neutral-50 rounded-xl p-3 text-left space-y-1.5 text-xs text-neutral-700 border border-neutral-200/80">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#8f1b1b] shrink-0" />
              <span className="font-semibold text-neutral-900">{event.date}</span>
              <span className="text-neutral-500 text-[11px]">• {event.time}</span>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-neutral-200/60">
              <MapPin className="w-3.5 h-3.5 text-[#8f1b1b] shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <span className="font-semibold text-neutral-900 block">{event.venue}</span>
                <span className="text-neutral-500 text-[10px]">SDMIMD Campus, Chamundi Hill Road, Mysuru</span>
              </div>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
            <span className="flex items-center gap-1 font-medium text-neutral-600">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b07c12]" />
              SDMIMD Official Pass
            </span>
            <span>Issue Date: Nov 2026</span>
          </div>
        </div>

        {/* Bottom hairline accent */}
        <div className="h-1 bg-[#b07c12]" />
      </div>

      {/* Action Buttons */}
      <div className="no-print mt-4 flex items-center justify-center gap-2">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8f1b1b] hover:bg-[#781616] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Save PDF</span>
        </button>

        <a
          href={`https://maps.google.com/?q=${encodeURIComponent('SDMIMD Mysuru Chamundi Hill Road')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-lg text-xs font-medium transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-[#b07c12]" />
          <span>Campus Map</span>
        </a>
      </div>
    </div>
  );
}
