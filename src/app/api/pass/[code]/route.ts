import { NextRequest, NextResponse } from 'next/server';
import { getAttendeeByPassCode } from '@/lib/store';
import { generateQRCodeDataURL } from '@/lib/qrcode';
import { EVENT_DETAILS } from '@/lib/constants';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const attendee = await getAttendeeByPassCode(code);

    if (!attendee) {
      return NextResponse.json({ success: false, error: 'E-Pass not found or invalid' }, { status: 404 });
    }

    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const passUrl = `${origin}/pass/${attendee.passCode}`;
    const qrDataUrl = await generateQRCodeDataURL(passUrl);

    return NextResponse.json({
      success: true,
      attendee,
      qrDataUrl,
      event: EVENT_DETAILS,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
