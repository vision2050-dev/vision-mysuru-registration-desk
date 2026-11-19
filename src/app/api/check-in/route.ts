import { NextRequest, NextResponse } from 'next/server';
import { checkInAttendee } from '@/lib/store';
import { extractPassCodeFromScan } from '@/lib/qrcode';
import { AUTH_CONFIG, getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawCode = body.passCode || body.code || '';

    // Enforce immutable desk identity strictly from the user's authenticated session
    const token = req.cookies.get(AUTH_CONFIG.cookieName)?.value;
    const sessionUser = getSessionUser(token);
    const deskName = sessionUser?.deskName || body.deskName || 'Registration Desk';

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
