import { NextRequest, NextResponse } from 'next/server';
import { deleteAttendee, getAttendeeById } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attendee = await getAttendeeById(id);
    if (!attendee) {
      return NextResponse.json({ success: false, error: 'Attendee not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, attendee });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteAttendee(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Attendee not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
