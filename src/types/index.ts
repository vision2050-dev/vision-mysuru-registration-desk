export interface StudentAttendee {
  id: string;
  passCode: string; // e.g. "VM2050-8491-MYS"
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  usn: string; // University Seat Number or Roll Number
  registrationType: 'Student Delegate' | 'Paper Presenter' | 'Ideathon Finalist' | 'Faculty / Mentor' | 'VIP Guest';
  status: 'registered' | 'checked_in' | 'cancelled';
  checkedInAt: string | null;
  checkedInBy: string | null; // e.g. "Registration Desk 1 (Auditorium)"
  emailStatus: 'pending' | 'sent' | 'failed';
  emailSentAt: string | null;
  createdAt: string;
  notes?: string;
}

export interface EventInfo {
  title: string;
  subtitle: string;
  theme: string;
  date: string;
  time: string;
  reportingTime: string;
  venue: string;
  venueDetails: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
}

export interface CheckInLog {
  id: string;
  attendeeId: string;
  attendeeName: string;
  college: string;
  passCode: string;
  timestamp: string;
  deskName: string;
  type: 'check_in' | 'undo_check_in';
}

export interface EmailDeliveryRecord {
  id: string;
  attendeeId: string;
  attendeeName: string;
  recipientEmail: string;
  passCode: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'simulated';
  messageId?: string;
  errorMessage?: string;
}

export interface DeskStats {
  totalRegistered: number;
  totalCheckedIn: number;
  totalPending: number;
  checkInRatePercent: number;
  totalEmailsSent: number;
  totalEmailsPending: number;
  collegeBreakdown: { college: string; total: number; checkedIn: number }[];
  deskBreakdown?: { deskName: string; checkedIn: number }[];
  recentLogs: CheckInLog[];
}
