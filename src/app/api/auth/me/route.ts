import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG, verifySessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_CONFIG.cookieName)?.value;
  const isAuthenticated = verifySessionToken(token);

  if (!isAuthenticated) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: AUTH_CONFIG.email,
      role: 'Staff Coordinator',
    },
  });
}
