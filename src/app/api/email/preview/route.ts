import { NextRequest, NextResponse } from 'next/server';
import { getAttendeeById, getAttendees } from '@/lib/store';
import { buildInvitationEmailHtml } from '@/lib/emailService';
import { generateQRCodeDataURL } from '@/lib/qrcode';

export async function GET(req: NextRequest) {
  try {
    const originUrl = req.nextUrl.origin || 'http://localhost:3000';
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let attendee = null;
    if (id) {
      attendee = await getAttendeeById(id);
    } else {
      const all = await getAttendees();
      attendee = all[0];
    }

    if (!attendee) {
      return new NextResponse('No attendee found to preview', { status: 404 });
    }

    const passUrl = `${originUrl}/pass/${attendee.passCode}`;
    const qrDataUrl = await generateQRCodeDataURL(passUrl);
    const html = buildInvitationEmailHtml(attendee, qrDataUrl, passUrl);

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (err: any) {
    return new NextResponse(`Error generating preview: ${err.message}`, { status: 500 });
  }
}
