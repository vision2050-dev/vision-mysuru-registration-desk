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

    const isValid = validateCredentials(email, password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials. Only authorized SDMIMD desk staff may log in.',
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(email);

    const response = NextResponse.json({
      success: true,
      user: {
        email: AUTH_CONFIG.email,
        role: 'Staff Coordinator',
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
