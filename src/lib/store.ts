import { StudentAttendee, CheckInLog, EmailDeliveryRecord, DeskStats } from '@/types';
import { INITIAL_DEMO_ATTENDEES } from './constants';
import fs from 'fs';
import path from 'path';

// Storage file location for local persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'attendees.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');

// In-memory cache for fast lookup and serverless fallback
let attendeesMemory: StudentAttendee[] = [];
let logsMemory: CheckInLog[] = [];
let emailsMemory: EmailDeliveryRecord[] = [];
let isInitialized = false;

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem (e.g. Vercel serverless), will use in-memory state
  }
}

function loadState() {
  if (isInitialized) return;

  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      attendeesMemory = JSON.parse(data);
    } else {
      attendeesMemory = [...INITIAL_DEMO_ATTENDEES];
      saveAttendeesToFile();
    }

    if (fs.existsSync(LOGS_FILE)) {
      const data = fs.readFileSync(LOGS_FILE, 'utf-8');
      logsMemory = JSON.parse(data);
    } else {
      // Generate initial checkin logs from demo data
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
      saveLogsToFile();
    }

    if (fs.existsSync(EMAILS_FILE)) {
      const data = fs.readFileSync(EMAILS_FILE, 'utf-8');
      emailsMemory = JSON.parse(data);
    } else {
      emailsMemory = attendeesMemory
        .filter((a) => a.emailStatus === 'sent' && a.emailSentAt)
        .map((a) => ({
          id: `email_${a.id}`,
          attendeeId: a.id,
          attendeeName: a.name,
          recipientEmail: a.email,
          passCode: a.passCode,
          sentAt: a.emailSentAt || new Date().toISOString(),
          status: 'sent' as const,
          messageId: `<vm2050_${a.id}@visionmysuru2050.in>`,
        }));
      saveEmailsToFile();
    }
  } catch (err) {
    console.warn('Filesystem persistence unavailable, running in-memory:', err);
    if (attendeesMemory.length === 0) {
      attendeesMemory = [...INITIAL_DEMO_ATTENDEES];
    }
  }

  isInitialized = true;
}

function saveAttendeesToFile() {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(attendeesMemory, null, 2), 'utf-8');
  } catch {
    // Vercel serverless / readonly
  }
}

function saveLogsToFile() {
  try {
    ensureDataDir();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logsMemory, null, 2), 'utf-8');
  } catch {
    // Vercel serverless / readonly
  }
}

function saveEmailsToFile() {
  try {
    ensureDataDir();
    fs.writeFileSync(EMAILS_FILE, JSON.stringify(emailsMemory, null, 2), 'utf-8');
  } catch {
    // Vercel serverless / readonly
  }
}

export function generatePassCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const suffix = ['MYS', 'CHM', 'SDM', 'YTH'][Math.floor(Math.random() * 4)];
  return `VM2050-${randomDigits}-${suffix}`;
}

export async function getAttendees(): Promise<StudentAttendee[]> {
  loadState();
  return [...attendeesMemory];
}

export async function getAttendeeById(id: string): Promise<StudentAttendee | null> {
  loadState();
  return attendeesMemory.find((a) => a.id === id) || null;
}

export async function getAttendeeByPassCode(passCode: string): Promise<StudentAttendee | null> {
  loadState();
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
  loadState();
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
  saveAttendeesToFile();
  return newAttendee;
}

export async function bulkCreateAttendees(
  dataList: Array<Partial<StudentAttendee> & { name: string; email: string }>
): Promise<{ added: number; skipped: number; attendees: StudentAttendee[] }> {
  loadState();
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

  saveAttendeesToFile();
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
  loadState();
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
  saveAttendeesToFile();
  saveLogsToFile();

  return {
    success: true,
    status: 'SUCCESS',
    message: `Verified! Welcome to Vision Mysuru 2050, ${attendee.name}!`,
    attendee,
  };
}

export async function undoCheckIn(passCode: string): Promise<CheckInResult> {
  loadState();
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
  saveAttendeesToFile();
  saveLogsToFile();

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
  loadState();
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

  saveAttendeesToFile();
  saveEmailsToFile();
}

export async function getEmailLogs(): Promise<EmailDeliveryRecord[]> {
  loadState();
  return [...emailsMemory];
}

export async function deleteAttendee(id: string): Promise<boolean> {
  loadState();
  const index = attendeesMemory.findIndex((a) => a.id === id);
  if (index !== -1) {
    attendeesMemory.splice(index, 1);
    saveAttendeesToFile();
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
  saveAttendeesToFile();
  saveLogsToFile();
  saveEmailsToFile();
}

export async function getDeskStats(): Promise<DeskStats> {
  loadState();
  const totalRegistered = attendeesMemory.length;
  const totalCheckedIn = attendeesMemory.filter((a) => a.status === 'checked_in').length;
  const totalPending = totalRegistered - totalCheckedIn;
  const checkInRatePercent = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
  const totalEmailsSent = attendeesMemory.filter((a) => a.emailStatus === 'sent').length;
  const totalEmailsPending = attendeesMemory.filter((a) => a.emailStatus === 'pending').length;

  const collegeCountMap: Record<string, { total: number; checkedIn: number }> = {};
  for (const att of attendeesMemory) {
    const col = att.college || 'Other';
    if (!collegeCountMap[col]) {
      collegeCountMap[col] = { total: 0, checkedIn: 0 };
    }
    collegeCountMap[col].total++;
    if (att.status === 'checked_in') {
      collegeCountMap[col].checkedIn++;
    }
  }

  const collegeBreakdown = Object.entries(collegeCountMap).map(([college, stats]) => ({
    college,
    total: stats.total,
    checkedIn: stats.checkedIn,
  })).sort((a, b) => b.total - a.total);

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
