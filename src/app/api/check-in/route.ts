import { NextRequest, NextResponse } from 'next/server';
import { checkInAttendee } from '@/lib/store';
import { extractPassCodeFromScan } from '@/lib/qrcode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body.passCode || body.code || '';
    const deskName = body.deskName || 'Main Registration Desk';

    if (!rawCode) {
      return NextResponse.json(
        { success: false, status: 'INVALID_CODE', message: 'No pass code provided' },
        { status: 400 }
      );
    }

    const passCode = extractPassCodeFromScan(rawCode);
    const result = await checkInAttendee(passCode, deskName);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, status: 'ERROR', message: err.message },
      { status: 500 }
    );
  }
}
