import { NextResponse } from 'next/server';
import { getAttendees } from '@/lib/store';
import Papa from 'papaparse';

export async function GET() {
  try {
    const attendees = await getAttendees();

    const data = attendees.map((a) => ({
      'Pass Code': a.passCode,
      'Full Name': a.name,
      'Email': a.email,
      'Phone': a.phone,
      'College / Institution': a.college,
      'Branch / Specialization': a.branch,
      'USN / Roll Number': a.usn,
      'Registration Type': a.registrationType,
      'Check-in Status': a.status === 'checked_in' ? 'Checked In' : 'Pending',
      'Check-in Time': a.checkedInAt || 'N/A',
      'Checked In By': a.checkedInBy || 'N/A',
      'Email Invitation': a.emailStatus,
      'Email Sent At': a.emailSentAt || 'N/A',
    }));

    const csv = Papa.unparse(data);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="VisionMysuru2050_Attendance_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
