import { NextRequest, NextResponse } from 'next/server';
import { AUTH_CONFIG, validateCredentials, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials. Only authorized SDMIMD desk staff may log in.',
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        deskName: user.deskName,
        location: user.location,
        role: user.role,
      },
    });

    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_CONFIG.sessionMaxAge,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed' },
      { status: 500 }
    );
  }
}
