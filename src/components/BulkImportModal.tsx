'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onImportComplete }: BulkImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ added: number; skipped: number } | null>(null);

  if (!isOpen) return null;

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

    setError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (err: any) => {
        setError(`Failed to read CSV: ${err.message}`);
      },
    });
  };

  const handleParseText = () => {
    if (!csvText.trim()) {
      setError('Please enter or paste CSV text first');
      return;
    }

    setError(null);
    Papa.parse(csvText.trim(), {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processParsedData(results.data);
      },
      error: (err: any) => {
        setError(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const processParsedData = (data: any[]) => {
    const valid = data.filter((row) => row.Name || row.name || row['Full Name']);
    if (valid.length === 0) {
      setError('No valid rows found. Please ensure headers include "Name" and "Email".');
      return;
    }
    setParsedRows(valid);
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    setLoading(true);
    setError(null);

    const formattedAttendees = parsedRows.map((r) => ({
      name: r.Name || r.name || r['Full Name'],
      email: r.Email || r.email || r['Email Address'],
      phone: r.Phone || r.phone || r['Mobile Number'] || '',
      college: r.College || r.college || r['Institution'] || 'Mysuru Student Delegation',
      branch: r.Branch || r.branch || r['Department'] || '',
      usn: r.USN || r.usn || r['Roll Number'] || '',
      registrationType: r.RegistrationType || r.registrationType || 'Student Delegate',
    }));

    try {
      const res = await fetch('/api/attendees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk',
          attendees: formattedAttendees,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to import attendees');
      }

      setStats({ added: data.added, skipped: data.skipped });
      onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Error importing data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#8f1b1b] to-[#a12626] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-[#fce79f]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bulk Student Onboarding</h3>
              <p className="text-xs text-[#fce79f]">Import hundreds of student delegates from CSV / Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {stats && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Import Complete!
              </div>
              <p>
                Successfully registered <strong>{stats.added}</strong> new student delegates with unique E-Passes.
                {stats.skipped > 0 && ` (${stats.skipped} duplicates or invalid rows skipped)`}
              </p>
            </div>
          )}

          {/* Template Download Prompt */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#f6f2ea] border border-[#ecdcc4] text-xs">
            <div>
              <span className="font-bold text-[#1f140c] block">Standard CSV Format</span>
              <span className="text-[#6b5b4d]">Columns: Name, Email, Phone, College, Branch, USN</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#b07c12]/30 text-[#b07c12] hover:bg-[#b07c12]/10 font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-[var(--border)] rounded-2xl p-6 text-center hover:border-[#8f1b1b]/50 transition-colors bg-[var(--surface-2)]">
            <Upload className="w-8 h-8 text-[#8f1b1b] mx-auto mb-2" />
            <span className="text-xs font-bold text-[var(--text)] block mb-1">
              Upload CSV / Excel file
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block mb-3">
              Drag & drop or choose your student list export
            </span>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#8f1b1b] hover:bg-[#a12626] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Or Paste Raw CSV */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-1">
              Or Paste CSV Data Directly:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Name,Email,College,USN&#10;Kavya Rao,kavya@nie.ac.in,NIE Mysuru,4NI22CS088&#10;Darshan Gowda,darshan@sjce.ac.in,SJCE Mysuru,4JC22IS022"
              className="w-full p-2.5 text-xs font-mono rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
            />
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleParseText}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text)] font-semibold transition-colors"
              >
                Parse Pasted CSV
              </button>
            </div>
          </div>

          {/* Parsed Rows Preview */}
          {parsedRows.length > 0 && (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="bg-[#f6f2ea] px-3 py-2 text-xs font-bold text-[#1f140c] flex items-center justify-between border-b border-[var(--border)]">
                <span>Preview Ready ({parsedRows.length} attendees detected)</span>
                <span className="text-[#8f1b1b] text-[11px]">Ready to generate passes</span>
              </div>
              <div className="max-h-36 overflow-y-auto divide-y divide-[var(--border)] text-xs">
                {parsedRows.slice(0, 10).map((row, i) => (
                  <div key={i} className="p-2 flex items-center justify-between bg-[var(--surface)]">
                    <span className="font-semibold text-[var(--text)]">
                      {row.Name || row.name || row['Full Name']}
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px]">
                      {row.Email || row.email}
                    </span>
                    <span className="text-[#b07c12] text-[11px] truncate max-w-[120px]">
                      {row.College || row.college || 'SDMIMD'}
                    </span>
                  </div>
                ))}
                {parsedRows.length > 10 && (
                  <div className="p-2 text-center text-[11px] text-[var(--text-muted)] bg-[var(--surface-2)]">
                    ...and {parsedRows.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            {stats ? 'Close' : 'Cancel'}
          </button>
          {parsedRows.length > 0 && !stats && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-[#8f1b1b] hover:bg-[#a12626] text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              {loading ? 'Importing...' : `Import & Generate ${parsedRows.length} E-Passes`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
