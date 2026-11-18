import { NextResponse } from 'next/server';
import { resetToDemoData } from '@/lib/store';

export async function POST() {
  try {
    await resetToDemoData();
    return NextResponse.json({ success: true, message: 'Platform reset to official demo state' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
