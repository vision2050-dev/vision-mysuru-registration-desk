'use client';

import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, Download, Check, AlertCircle } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 px-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#8f1b1b]" />
            <h3 className="text-sm font-bold text-[var(--text)]">Bulk Delegate Import</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 overflow-y-auto">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {stats && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Completed</span>
              </div>
              <p className="text-[11px]">
                Added <strong>{stats.added}</strong> delegates.
                {stats.skipped > 0 && ` (${stats.skipped} skipped)`}
              </p>
            </div>
          )}

          {/* Template Download Prompt */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs">
            <div>
              <span className="font-semibold text-[var(--text)] block">Standard Format</span>
              <span className="text-[11px] text-[var(--text-subtle)]">Headers: Name, Email, Phone, College, USN</span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs font-medium text-[var(--text)] transition-colors"
            >
              <Download className="w-3 h-3 text-[#b07c12]" />
              <span>Template</span>
            </button>
          </div>

          {/* Dropzone */}
          <div className="border border-dashed border-[var(--border-hover)] rounded-xl p-5 text-center bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] transition-colors">
            <Upload className="w-6 h-6 text-[#8f1b1b] mx-auto mb-1.5" />
            <span className="text-xs font-semibold text-[var(--text)] block mb-0.5">
              Upload CSV File
            </span>
            <span className="text-[11px] text-[var(--text-subtle)] block mb-2.5">
              Choose your delegate export file (.csv)
            </span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-3)] text-[var(--text)] rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-2xs">
              <span>Select File</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Paste CSV Data */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Or Paste CSV Text:
            </label>
            <textarea
              rows={3}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Name,Email,College,USN&#10;Kavya Rao,kavya@nie.ac.in,NIE Mysuru,4NI22CS088"
              className="w-full p-2 text-xs font-mono rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[#8f1b1b]"
            />
            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleParseText}
                className="text-xs px-2.5 py-1 rounded bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-[var(--text)] font-medium transition-colors border border-[var(--border)]"
              >
                Parse
              </button>
            </div>
          </div>

          {/* Preview list */}
          {parsedRows.length > 0 && (
            <div className="border border-[var(--border)] rounded-lg overflow-hidden text-xs">
              <div className="bg-[var(--surface-2)] px-3 py-1.5 font-semibold text-[var(--text)] border-b border-[var(--border)] text-[11px]">
                {parsedRows.length} delegates ready to import
              </div>
              <div className="max-h-32 overflow-y-auto divide-y divide-[var(--border)]">
                {parsedRows.slice(0, 6).map((row, i) => (
                  <div key={i} className="p-2 flex items-center justify-between bg-[var(--surface)]">
                    <span className="font-medium text-[var(--text)]">
                      {row.Name || row.name || row['Full Name']}
                    </span>
                    <span className="text-[11px] text-[var(--text-subtle)]">
                      {row.Email || row.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-3)] transition-colors"
          >
            {stats ? 'Close' : 'Cancel'}
          </button>
          {parsedRows.length > 0 && !stats && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#8f1b1b] hover:bg-[#781616] text-white shadow-2xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Importing...' : `Import ${parsedRows.length} Delegates`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
