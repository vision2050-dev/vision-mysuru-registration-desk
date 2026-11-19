import { NextRequest, NextResponse } from 'next/server';
import { generateQRCodeBuffer } from '@/lib/qrcode';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return new NextResponse('Pass code required', { status: 400 });
    }

    const origin = req.nextUrl.origin || 'https://vision-mysuru-desk.vercel.app';
    const passUrl = `${origin}/pass/${code.toUpperCase()}`;
    const buffer = await generateQRCodeBuffer(passUrl);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error generating QR: ${err.message}`, { status: 500 });
  }
}
