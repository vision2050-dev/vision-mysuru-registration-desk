'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { StudentAttendee } from '@/types';
import { EVENT_DETAILS } from '@/lib/constants';
import {
  Ticket,
  CheckCircle2,
  Copy,
  ExternalLink,
  Mail,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Upload,
  Download,
  Building2,
  GraduationCap,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';

const COLLEGE_OPTIONS = [
  'SDM Institute for Management Development (SDMIMD)',
  'JSS Science and Technology University (SJCE)',
  'The National Institute of Engineering (NIE Mysuru)',
  'Vidyavardhaka College of Engineering (VVCE)',
  'University of Mysore (Manasagangotri)',
  'Maharaja Institute of Technology Mysore (MITM)',
  'Amrita Vishwa Vidyapeetham, Mysuru Campus',
  'GSSS Institute of Engineering & Technology for Women',
  'Other / External Institution',
];

export default function GeneratePassPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Single Pass Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('SDM Institute for Management Development (SDMIMD)');
  const [customCollege, setCustomCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [usn, setUsn] = useState('');
  const [registrationType, setRegistrationType] = useState<StudentAttendee['registrationType']>('Student Delegate');
  const [notes, setNotes] = useState('');
  const [sendEmailImmediately, setSendEmailImmediately] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result State
  const [generatedPass, setGeneratedPass] = useState<StudentAttendee | null>(null);
  const [generatedQrData, setGeneratedQrData] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Bulk State
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkResult, setBulkResult] = useState<{ added: number; skipped: number } | null>(null);

  const selectedCollegeName = college === 'Other / External Institution' ? (customCollege || 'Other Institution') : college;

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Student full name and email address are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: selectedCollegeName,
          branch: branch.trim(),
          usn: usn.trim(),
          registrationType,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create student pass.');
      }

      setGeneratedPass(data.attendee);

      // Fetch QR Code data URL for instant display
      try {
        const qrRes = await fetch(`/api/pass/${data.attendee.passCode}`);
        const qrJson = await qrRes.json();
        if (qrJson.success && qrJson.qrDataUrl) {
          setGeneratedQrData(qrJson.qrDataUrl);
        }
      } catch (err) {
        console.warn('QR fetch failed:', err);
      }

      // Automatically dispatch invitation email if checked
      if (sendEmailImmediately) {
        setSendingEmail(true);
        try {
          const emailRes = await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attendeeId: data.attendee.id }),
          });
          const emailData = await emailRes.json();
          if (emailData.success) {
            setEmailSent(true);
          }
        } catch {
          // Non-critical
        } finally {
          setSendingEmail(false);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error creating pass');
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBranch('');
    setUsn('');
    setNotes('');
    setCustomCollege('');
    setGeneratedPass(null);
    setGeneratedQrData(null);
    setCopied(false);
    setEmailSent(false);
    setError(null);
  };

  const handleCopyPassCode = () => {
    if (!generatedPass) return;
    navigator.clipboard.writeText(generatedPass.passCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmailManually = async () => {
    if (!generatedPass) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendeeId: generatedPass.id }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
      } else {
        alert(data.error || 'Failed to deliver pass invitation');
      }
    } catch (e: any) {
      alert(`Error sending email: ${e.message}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Bulk CSV Handlers
  const handleDownloadTemplate = () => {
    const template = `Name,Email,Phone,College,Branch,USN,RegistrationType
Aditi Urs,aditi.urs@nie.ac.in,+91 98451 22334,The National Institute of Engineering,B.E. Computer Science,4NI22CS012,Student Delegate
Kiran Raj,kiran.raj@jssstuniv.in,+91 97410 55667,JSS Science and Technology University,B.E. Mechanical,4JC22ME045,Paper Presenter
Sushma Nayak,sushma.n@sdmimd.ac.in,+91 99002 88990,SDMIMD Mysuru,MBA Sustainable Governance,SDM2026-MBA-089,Ideathon Finalist`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'VisionMysuru2050_Student_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (err: any) => {
        setBulkError(`Failed to read CSV: ${err.message}`);
      },
    });
  };

  const handleParseText = () => {
    if (!csvText.trim()) {
      setBulkError('Please paste CSV text to preview');
      return;
    }

    setBulkError(null);
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (err: any) => {
        setBulkError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const processParsedData = (data: any[]) => {
    const valid = data.filter((row) => row.Name && row.Email);
    if (valid.length === 0) {
      setBulkError('No valid rows found. CSV must contain at least "Name" and "Email" columns.');
      return;
    }
    setParsedRows(valid);
  };

  const handleBulkSubmit = async () => {
    if (parsedRows.length === 0) return;
    setBulkLoading(true);
    setBulkError(null);

    let addedCount = 0;
    let skippedCount = 0;

    try {
      for (const row of parsedRows) {
        try {
          const res = await fetch('/api/attendees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: row.Name || row.name,
              email: row.Email || row.email,
              phone: row.Phone || row.phone || '',
              college: row.College || row.college || 'SDM Institute for Management Development',
              branch: row.Branch || row.branch || '',
              usn: row.USN || row.usn || '',
              registrationType: row.RegistrationType || row.registrationType || 'Student Delegate',
            }),
          });
          const data = await res.json();
          if (data.success) {
            addedCount++;
          } else {
            skippedCount++;
          }
        } catch {
          skippedCount++;
        }
      }

      setBulkResult({ added: addedCount, skipped: skippedCount });
      setParsedRows([]);
      setCsvText('');
    } catch (err: any) {
      setBulkError(`Bulk generation error: ${err.message}`);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#8f1b1b] text-white">
                <Ticket className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text)]">
                Generate Student E-Pass
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Issue verified QR conference badges and automated email invitations for Vision Mysuru 2050 delegates.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'single'
                  ? 'bg-[#8f1b1b] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Single E-Pass</span>
            </button>

            <button
              onClick={() => setActiveTab('bulk')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'bulk'
                  ? 'bg-[#8f1b1b] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Bulk CSV Import</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Single Pass Generator */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <span>Student & Delegate Information</span>
                  <span className="text-[10px] font-semibold text-[#b07c12] bg-[#b07c12]/10 px-2 py-0.5 rounded uppercase">
                    Live Minting
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  A unique pass code and QR barcode will be minted immediately upon generation.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSingleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ananya@sdmimd.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98450 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Delegate Category
                    </label>
                    <select
                      value={registrationType}
                      onChange={(e) => setRegistrationType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    >
                      <option value="Student Delegate">Student Delegate</option>
                      <option value="Ideathon Finalist">Ideathon Finalist</option>
                      <option value="Paper Presenter">Paper Presenter</option>
                      <option value="Faculty / Mentor">Faculty / Mentor</option>
                      <option value="VIP Guest">VIP Guest</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    College / Institution
                  </label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                  >
                    {COLLEGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  {college === 'Other / External Institution' && (
                    <input
                      type="text"
                      placeholder="Type official institution name..."
                      value={customCollege}
                      onChange={(e) => setCustomCollege(e.target.value)}
                      className="mt-2 w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      Degree / Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MBA or B.E. Computer Science"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                      University Seat Number (USN) / ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SDM2026-MBA-042 or 4JC22CS089"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Special Notes / Project Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lake Rejuvenation Project Pitch or VIP Seating"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                  />
                </div>

                <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text)]">
                    <input
                      type="checkbox"
                      checked={sendEmailImmediately}
                      onChange={(e) => setSendEmailImmediately(e.target.checked)}
                      className="rounded text-[#8f1b1b] focus:ring-[#8f1b1b]"
                    />
                    <span>Automatically email official e-pass invitation with QR code</span>
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating E-Pass...</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Generate & Mint E-Pass</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-4 py-2.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] transition-colors"
                  >
                    Reset Form
                  </button>
                </div>
              </form>
            </div>

            {/* Live Pass Preview & Minted Pass Result (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {generatedPass ? (
                /* Success Card with Minted E-Pass */
                <div className="bg-[var(--surface)] border-2 border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-emerald-800">
                        E-Pass Minted Successfully!
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      LIVE
                    </span>
                  </div>

                  {/* Pass Card Preview */}
                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center shadow-2xs space-y-3">
                    <div className="bg-[#8f1b1b] text-white p-3 rounded-lg text-left flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#fce79f] font-semibold">
                          Vision Mysuru 2050
                        </div>
                        <div className="text-xs font-bold">{generatedPass.name}</div>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                        {generatedPass.registrationType}
                      </span>
                    </div>

                    {/* QR Preview */}
                    <div className="p-2 bg-neutral-50 rounded-lg border border-neutral-200 inline-block">
                      {generatedQrData ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={generatedQrData}
                          alt={`QR Pass ${generatedPass.passCode}`}
                          className="w-36 h-36 mx-auto object-contain"
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center text-neutral-400 text-xs">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#8f1b1b]">
                        {generatedPass.passCode}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {generatedPass.college}
                      </div>
                      {generatedPass.usn && (
                        <div className="text-[10px] font-mono text-neutral-400">
                          USN: {generatedPass.usn}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyPassCode}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-medium border border-[var(--border)] transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copied ? 'Pass Code Copied!' : 'Copy Pass Code'}</span>
                      </button>

                      <Link
                        href={`/pass/${generatedPass.passCode}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Badge</span>
                      </Link>
                    </div>

                    <button
                      onClick={handleSendEmailManually}
                      disabled={sendingEmail}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>
                        {sendingEmail
                          ? 'Delivering Email...'
                          : emailSent
                          ? 'Email Invitation Sent (Send Again)'
                          : 'Send Email Invitation Now'}
                      </span>
                    </button>

                    <button
                      onClick={handleResetForm}
                      className="w-full text-center text-xs text-[#8f1b1b] hover:underline font-semibold pt-1"
                    >
                      + Generate Another Pass
                    </button>
                  </div>
                </div>
              ) : (
                /* Dynamic Badge Preview Placeholder */
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-2xs space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">
                      Live Badge Preview
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      This is how the delegate's digital e-pass card will be rendered.
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-neutral-200 p-4 text-center shadow-2xs space-y-3 opacity-80">
                    <div className="bg-[#8f1b1b] text-white p-3 rounded-lg text-left flex items-center justify-between">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#fce79f] font-semibold">
                          Vision Mysuru 2050
                        </div>
                        <div className="text-xs font-bold">
                          {name.trim() || 'Student Delegate Name'}
                        </div>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded">
                        {registrationType}
                      </span>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 inline-block">
                      <div className="w-36 h-36 mx-auto flex flex-col items-center justify-center text-neutral-400 gap-2 border border-dashed border-neutral-300 rounded">
                        <Ticket className="w-8 h-8 text-[#8f1b1b]" />
                        <span className="text-[10px] font-medium text-center px-2">
                          Unique QR will appear here
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-mono font-bold text-[#8f1b1b]">
                        VM2050-XXXX-MYS
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {selectedCollegeName}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        SDMIMD Campus • Nov 28, 2026
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
                    <div className="font-semibold text-[var(--text)] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#b07c12]" />
                      Tamper-Proof Verification
                    </div>
                    <p className="text-[11px]">
                      Each minted pass contains a unique encrypted URL scanned by registration desk staff to immediately mark attendance and prevent duplicate entry.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Bulk CSV Import */}
        {activeTab === 'bulk' && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#b07c12]" />
                  <span>Bulk Pass Generation & Cohort Import</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Import multiple students from Excel or Google Sheets to automatically generate individual passes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-medium border border-[var(--border)] transition-colors self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-[#b07c12]" />
                <span>Download Sample Template (.CSV)</span>
              </button>
            </div>

            {bulkError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{bulkError}</span>
              </div>
            )}

            {bulkResult && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    Successfully generated <strong>{bulkResult.added}</strong> passes!
                    {bulkResult.skipped > 0 && ` (${bulkResult.skipped} skipped/duplicates)`}
                  </span>
                </div>
                <Link
                  href="/attendees"
                  className="font-semibold text-emerald-700 underline hover:text-emerald-900"
                >
                  View in Attendee Registry &rarr;
                </Link>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Upload file */}
              <div className="p-4 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[#8f1b1b]/40 text-center flex flex-col items-center justify-center bg-[var(--surface-2)]/50">
                <Upload className="w-8 h-8 text-[var(--text-subtle)] mb-2" />
                <div className="text-xs font-semibold text-[var(--text)]">Upload CSV File</div>
                <p className="text-[11px] text-[var(--text-subtle)] mt-0.5 mb-3">
                  Upload .csv exported from Google Forms or college registry
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8f1b1b] hover:bg-[#781616] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors">
                  <span>Choose File</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Option B: Paste raw text */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[var(--text)]">
                  Or Paste CSV Data Directly:
                </label>
                <textarea
                  rows={4}
                  placeholder={`Name,Email,Phone,College,Branch,USN,RegistrationType\nKiran Raj,kiran@jss.in,9845012345,SJCE,CS,4JC22CS089,Student Delegate`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
                />
                <button
                  type="button"
                  onClick={handleParseText}
                  className="w-full py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-semibold rounded-lg border border-[var(--border)] text-[var(--text)] transition-colors"
                >
                  Preview CSV Rows
                </button>
              </div>
            </div>

            {/* Parsed Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[var(--text)]">
                    Ready to Generate ({parsedRows.length} attendees detected)
                  </h4>
                  <button
                    type="button"
                    onClick={handleBulkSubmit}
                    disabled={bulkLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8f1b1b] hover:bg-[#781616] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {bulkLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Minting Passes in Bulk...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate All {parsedRows.length} E-Passes</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border border-[var(--border)] rounded-lg overflow-x-auto max-h-[300px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[var(--surface-2)] text-[var(--text-subtle)] text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">College</th>
                        <th className="py-2 px-3">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                      {parsedRows.slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="hover:bg-[var(--surface-2)]">
                          <td className="py-1.5 px-3 text-[var(--text-subtle)]">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold">{row.Name || row.name}</td>
                          <td className="py-1.5 px-3 text-[var(--text-muted)]">{row.Email || row.email}</td>
                          <td className="py-1.5 px-3 text-[var(--text-muted)] truncate max-w-[200px]">
                            {row.College || row.college || 'SDMIMD'}
                          </td>
                          <td className="py-1.5 px-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text)]">
                              {row.RegistrationType || row.registrationType || 'Student Delegate'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
