import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG, getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_CONFIG.cookieName)?.value;
  const user = getSessionUser(token);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: user.email,
      deskName: user.deskName,
      location: user.location,
      role: user.role,
    },
  });
}
