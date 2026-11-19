import { StudentAttendee, CheckInLog, EmailDeliveryRecord, DeskStats } from '@/types';
import { INITIAL_DEMO_ATTENDEES } from './constants';
import fs from 'fs';
import path from 'path';
import { put, list } from '@vercel/blob';

// Local storage paths (with /tmp fallback for serverless)
const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const TMP_DATA_DIR = '/tmp';

function getFilePath(filename: string): string {
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    const testFile = path.join(LOCAL_DATA_DIR, '.write_test');
    fs.writeFileSync(testFile, 'ok', 'utf-8');
    fs.unlinkSync(testFile);
    return path.join(LOCAL_DATA_DIR, filename);
  } catch {
    return path.join(TMP_DATA_DIR, filename);
  }
}

// In-memory cache for fast lookup
let attendeesMemory: StudentAttendee[] = [];
let logsMemory: CheckInLog[] = [];
let emailsMemory: EmailDeliveryRecord[] = [];
let isInitialized = false;
let lastSyncTime = 0;
const SYNC_CACHE_TTL = 3000; // 3 seconds cache before re-checking Blob in serverless

/**
 * Loads state from Vercel Blob (production) or local JSON files (development/fallback).
 */
export async function loadState(forceReload = false): Promise<void> {
  const now = Date.now();
  if (isInitialized && !forceReload && now - lastSyncTime < SYNC_CACHE_TTL) {
    return;
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // 1. Try Loading from Vercel Blob Store (Global Cloud Persistence)
  if (blobToken) {
    try {
      const blobList = await list({
        prefix: 'vision2050/',
        token: blobToken,
      });

      const attendeesBlob = blobList.blobs.find((b) => b.pathname === 'vision2050/attendees.json');
      if (attendeesBlob) {
        const res = await fetch(`${attendeesBlob.url}?_t=${now}`);
        if (res.ok) {
          attendeesMemory = await res.json();
        }
      }

      const logsBlob = blobList.blobs.find((b) => b.pathname === 'vision2050/logs.json');
      if (logsBlob) {
        const res = await fetch(`${logsBlob.url}?_t=${now}`);
        if (res.ok) {
          logsMemory = await res.json();
        }
      }

      const emailsBlob = blobList.blobs.find((b) => b.pathname === 'vision2050/emails.json');
      if (emailsBlob) {
        const res = await fetch(`${emailsBlob.url}?_t=${now}`);
        if (res.ok) {
          emailsMemory = await res.json();
        }
      }

      isInitialized = true;
      lastSyncTime = Date.now();
      return;
    } catch (blobErr) {
      console.warn('Vercel Blob load error, falling back to disk/tmp:', blobErr);
    }
  }

  // 2. Fallback to Local/Tmp Filesystem (Offline or Local Dev)
  try {
    const attendeesPath = getFilePath('attendees.json');
    const logsPath = getFilePath('logs.json');
    const emailsPath = getFilePath('emails.json');

    if (fs.existsSync(attendeesPath)) {
      const data = fs.readFileSync(attendeesPath, 'utf-8');
      attendeesMemory = JSON.parse(data);
    } else if (!isInitialized) {
      attendeesMemory = [...INITIAL_DEMO_ATTENDEES];
    }

    if (fs.existsSync(logsPath)) {
      const data = fs.readFileSync(logsPath, 'utf-8');
      logsMemory = JSON.parse(data);
    }

    if (fs.existsSync(emailsPath)) {
      const data = fs.readFileSync(emailsPath, 'utf-8');
      emailsMemory = JSON.parse(data);
    }
  } catch (fsErr) {
    console.warn('Filesystem read error, using in-memory state:', fsErr);
  }

  isInitialized = true;
  lastSyncTime = Date.now();
}

/**
 * Persists attendees to Vercel Blob and local disk.
 */
async function saveAttendees(): Promise<void> {
  lastSyncTime = Date.now();

  // 1. Write to local/tmp disk for immediate local reads
  try {
    const filePath = getFilePath('attendees.json');
    fs.writeFileSync(filePath, JSON.stringify(attendeesMemory, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem
  }

  // 2. Write to Vercel Blob for persistent global cloud storage
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      await put('vision2050/attendees.json', JSON.stringify(attendeesMemory, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: blobToken,
      });
    } catch (err) {
      console.error('Failed to sync attendees to Vercel Blob:', err);
    }
  }
}

/**
 * Persists check-in logs to Vercel Blob and local disk.
 */
async function saveLogs(): Promise<void> {
  try {
    const filePath = getFilePath('logs.json');
    fs.writeFileSync(filePath, JSON.stringify(logsMemory, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      await put('vision2050/logs.json', JSON.stringify(logsMemory, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: blobToken,
      });
    } catch (err) {
      console.error('Failed to sync logs to Vercel Blob:', err);
    }
  }
}

/**
 * Persists email logs to Vercel Blob and local disk.
 */
async function saveEmails(): Promise<void> {
  try {
    const filePath = getFilePath('emails.json');
    fs.writeFileSync(filePath, JSON.stringify(emailsMemory, null, 2), 'utf-8');
  } catch {
    // Read-only filesystem
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    try {
      await put('vision2050/emails.json', JSON.stringify(emailsMemory, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        token: blobToken,
      });
    } catch (err) {
      console.error('Failed to sync emails to Vercel Blob:', err);
    }
  }
}

export function generatePassCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const suffix = ['MYS', 'CHM', 'SDM', 'YTH'][Math.floor(Math.random() * 4)];
  return `VM2050-${randomDigits}-${suffix}`;
}

export async function getAttendees(): Promise<StudentAttendee[]> {
  await loadState();
  return [...attendeesMemory];
}

export async function getAttendeeById(id: string): Promise<StudentAttendee | null> {
  await loadState();
  return attendeesMemory.find((a) => a.id === id) || null;
}

export async function getAttendeeByPassCode(passCode: string): Promise<StudentAttendee | null> {
  await loadState();
  const cleaned = passCode.trim().toUpperCase();
  return (
    attendeesMemory.find(
      (a) =>
        a.passCode.toUpperCase() === cleaned ||
        a.usn?.toUpperCase() === cleaned ||
        a.email?.toLowerCase() === passCode.trim().toLowerCase()
    ) || null
  );
}

export async function createAttendee(
  data: Omit<StudentAttendee, 'id' | 'passCode' | 'status' | 'checkedInAt' | 'checkedInBy' | 'emailStatus' | 'emailSentAt' | 'createdAt'>
): Promise<StudentAttendee> {
  await loadState();
  const newAttendee: StudentAttendee = {
    ...data,
    id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    passCode: generatePassCode(),
    status: 'registered',
    checkedInAt: null,
    checkedInBy: null,
    emailStatus: 'pending',
    emailSentAt: null,
    createdAt: new Date().toISOString(),
  };

  attendeesMemory.unshift(newAttendee);
  await saveAttendees();
  return newAttendee;
}

export async function bulkCreateAttendees(
  dataList: Array<Partial<StudentAttendee> & { name: string; email: string }>
): Promise<{ added: number; skipped: number; attendees: StudentAttendee[] }> {
  await loadState();
  const created: StudentAttendee[] = [];
  let skipped = 0;

  for (const item of dataList) {
    if (!item.name || !item.email) {
      skipped++;
      continue;
    }

    // Check duplicate email
    const exists = attendeesMemory.some((a) => a.email.toLowerCase() === item.email.toLowerCase());
    if (exists) {
      skipped++;
      continue;
    }

    const newAttendee: StudentAttendee = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      passCode: item.passCode || generatePassCode(),
      name: item.name.trim(),
      email: item.email.trim(),
      phone: item.phone?.trim() || '',
      college: item.college?.trim() || 'Mysuru Student Delegation',
      branch: item.branch?.trim() || 'General Delegation',
      usn: item.usn?.trim() || '',
      registrationType: (item.registrationType as any) || 'Student Delegate',
      status: 'registered',
      checkedInAt: null,
      checkedInBy: null,
      emailStatus: 'pending',
      emailSentAt: null,
      createdAt: new Date().toISOString(),
      notes: item.notes || '',
    };

    attendeesMemory.unshift(newAttendee);
    created.push(newAttendee);
  }

  await saveAttendees();
  return { added: created.length, skipped, attendees: created };
}

export interface CheckInResult {
  success: boolean;
  status: 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'NOT_FOUND' | 'INVALID_CODE';
  message: string;
  attendee?: StudentAttendee;
  priorCheckIn?: {
    at: string;
    by: string;
  };
}

export async function checkInAttendee(
  passCode: string,
  deskName: string = 'Registration Desk 1'
): Promise<CheckInResult> {
  await loadState();
  const attendee = await getAttendeeByPassCode(passCode);

  if (!attendee) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: `No attendee found matching code "${passCode}". Please verify with Student ID.`,
    };
  }

  if (attendee.status === 'checked_in') {
    return {
      success: false,
      status: 'ALREADY_CHECKED_IN',
      message: `Attention: ${attendee.name} has ALREADY checked in!`,
      attendee,
      priorCheckIn: {
        at: attendee.checkedInAt || '',
        by: attendee.checkedInBy || 'Previous Desk',
      },
    };
  }

  // Perform Check In
  const checkInTime = new Date().toISOString();
  attendee.status = 'checked_in';
  attendee.checkedInAt = checkInTime;
  attendee.checkedInBy = deskName;

  const log: CheckInLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    college: attendee.college,
    passCode: attendee.passCode,
    timestamp: checkInTime,
    deskName,
    type: 'check_in',
  };

  logsMemory.unshift(log);
  await saveAttendees();
  await saveLogs();

  return {
    success: true,
    status: 'SUCCESS',
    message: `Verified! Welcome to Vision Mysuru 2050, ${attendee.name}!`,
    attendee,
  };
}

export async function undoCheckIn(passCode: string): Promise<CheckInResult> {
  await loadState();
  const attendee = await getAttendeeByPassCode(passCode);

  if (!attendee) {
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Attendee not found.',
    };
  }

  attendee.status = 'registered';
  attendee.checkedInAt = null;
  attendee.checkedInBy = null;

  const log: CheckInLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    college: attendee.college,
    passCode: attendee.passCode,
    timestamp: new Date().toISOString(),
    deskName: 'Manual Undo',
    type: 'undo_check_in',
  };

  logsMemory.unshift(log);
  await saveAttendees();
  await saveLogs();

  return {
    success: true,
    status: 'SUCCESS',
    message: `Check-in reverted for ${attendee.name}.`,
    attendee,
  };
}

export async function recordEmailSent(
  attendeeId: string,
  record: Omit<EmailDeliveryRecord, 'id' | 'attendeeId'>
): Promise<void> {
  await loadState();
  const attendee = attendeesMemory.find((a) => a.id === attendeeId);
  if (attendee) {
    attendee.emailStatus = record.status === 'failed' ? 'failed' : 'sent';
    attendee.emailSentAt = record.sentAt;
  }

  emailsMemory.unshift({
    ...record,
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    attendeeId,
  });

  await saveAttendees();
  await saveEmails();
}

export async function getEmailLogs(): Promise<EmailDeliveryRecord[]> {
  await loadState();
  return [...emailsMemory];
}

export async function deleteAttendee(id: string): Promise<boolean> {
  await loadState();
  const index = attendeesMemory.findIndex((a) => a.id === id);
  if (index !== -1) {
    attendeesMemory.splice(index, 1);
    await saveAttendees();
    return true;
  }
  return false;
}

export async function resetToDemoData(): Promise<void> {
  attendeesMemory = JSON.parse(JSON.stringify(INITIAL_DEMO_ATTENDEES));
  logsMemory = attendeesMemory
    .filter((a) => a.status === 'checked_in' && a.checkedInAt)
    .map((a) => ({
      id: `log_${a.id}`,
      attendeeId: a.id,
      attendeeName: a.name,
      college: a.college,
      passCode: a.passCode,
      timestamp: a.checkedInAt || new Date().toISOString(),
      deskName: a.checkedInBy || 'Main Registration Desk',
      type: 'check_in' as const,
    }));
  emailsMemory = [];
  await saveAttendees();
  await saveLogs();
  await saveEmails();
}

export async function getDeskStats(): Promise<DeskStats> {
  await loadState();
  const totalRegistered = attendeesMemory.length;
  const totalCheckedIn = attendeesMemory.filter((a) => a.status === 'checked_in').length;
  const totalPending = totalRegistered - totalCheckedIn;
  const checkInRatePercent = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
  const totalEmailsSent = attendeesMemory.filter((a) => a.emailStatus === 'sent').length;
  const totalEmailsPending = attendeesMemory.filter((a) => a.emailStatus === 'pending').length;

  const collegeMap: Record<string, { total: number; checkedIn: number }> = {};
  for (const a of attendeesMemory) {
    const col = a.college || 'Other';
    if (!collegeMap[col]) collegeMap[col] = { total: 0, checkedIn: 0 };
    collegeMap[col].total++;
    if (a.status === 'checked_in') collegeMap[col].checkedIn++;
  }

  const collegeBreakdown = Object.entries(collegeMap).map(([college, data]) => ({
    college,
    total: data.total,
    checkedIn: data.checkedIn,
  }));

  return {
    totalRegistered,
    totalCheckedIn,
    totalPending,
    checkInRatePercent,
    totalEmailsSent,
    totalEmailsPending,
    collegeBreakdown,
    recentLogs: logsMemory.slice(0, 20),
  };
}
