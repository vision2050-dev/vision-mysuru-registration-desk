import { NextRequest, NextResponse } from 'next/server';
import { getAttendees, createAttendee, bulkCreateAttendees, getDeskStats } from '@/lib/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';
    const college = searchParams.get('college') || '';

    let attendees = await getAttendees();

    if (search) {
      attendees = attendees.filter(
        (a) =>
          a.name.toLowerCase().includes(search) ||
          a.email.toLowerCase().includes(search) ||
          a.passCode.toLowerCase().includes(search) ||
          a.usn.toLowerCase().includes(search) ||
          a.college.toLowerCase().includes(search)
      );
    }

    if (status) {
      attendees = attendees.filter((a) => a.status === status);
    }

    if (college) {
      attendees = attendees.filter((a) => a.college === college);
    }

    const stats = await getDeskStats();

    return NextResponse.json({
      success: true,
      count: attendees.length,
      attendees,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'bulk') {
      const items = body.attendees;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: 'attendees array is required' }, { status: 400 });
      }
      const result = await bulkCreateAttendees(items);
      return NextResponse.json({ success: true, ...result });
    }

    // Single creation
    if (!body.name || !body.email) {
      return NextResponse.json({ success: false, error: 'Name and Email are required' }, { status: 400 });
    }

    const created = await createAttendee({
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      college: body.college || 'SDMIMD Mysuru',
      branch: body.branch || 'Management / Engineering',
      usn: body.usn || '',
      registrationType: body.registrationType || 'Student Delegate',
      notes: body.notes || '',
    });

    return NextResponse.json({ success: true, attendee: created });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
