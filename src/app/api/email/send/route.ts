import { NextRequest, NextResponse } from 'next/server';
import { getAttendeeById, getAttendees, recordEmailSent } from '@/lib/store';
import { sendEPassEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const originUrl = req.nextUrl.origin || 'http://localhost:3000';
    const body = await req.json();

    // Bulk send
    if (body.action === 'bulk') {
      const allAttendees = await getAttendees();
      // Target pending or specific IDs
      const targetAttendees = body.attendeeIds && Array.isArray(body.attendeeIds)
        ? allAttendees.filter((a) => body.attendeeIds.includes(a.id))
        : allAttendees.filter((a) => a.emailStatus === 'pending');

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const att of targetAttendees) {
        const res = await sendEPassEmail(att, originUrl);
        await recordEmailSent(att.id, {
          attendeeName: att.name,
          recipientEmail: att.email,
          passCode: att.passCode,
          sentAt: new Date().toISOString(),
          status: res.success ? (res.mode === 'simulated' ? 'simulated' : 'sent') : 'failed',
          messageId: res.messageId,
          errorMessage: res.error,
        });

        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }

        results.push({
          id: att.id,
          name: att.name,
          email: att.email,
          success: res.success,
          mode: res.mode,
        });
      }

      return NextResponse.json({
        success: true,
        sent: successCount,
        failed: failCount,
        totalTargeted: targetAttendees.length,
        results,
      });
    }

    // Single send
    const attendeeId = body.attendeeId;
    if (!attendeeId) {
      return NextResponse.json({ success: false, error: 'attendeeId is required' }, { status: 400 });
    }

    const attendee = await getAttendeeById(attendeeId);
    if (!attendee) {
      return NextResponse.json({ success: false, error: 'Attendee not found' }, { status: 404 });
    }

    const result = await sendEPassEmail(attendee, originUrl);

    await recordEmailSent(attendee.id, {
      attendeeName: attendee.name,
      recipientEmail: attendee.email,
      passCode: attendee.passCode,
      sentAt: new Date().toISOString(),
      status: result.success ? (result.mode === 'simulated' ? 'simulated' : 'sent') : 'failed',
      messageId: result.messageId,
      errorMessage: result.error,
    });

    return NextResponse.json({
      success: result.success,
      mode: result.mode,
      messageId: result.messageId,
      error: result.error,
      attendee,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
