import { NextResponse } from 'next/server';
import * as serverDb from '@/lib/serverDb';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> | { code: string } }
) {
  try {
    const resolvedParams = await params;
    const { code } = resolvedParams;
    const success = serverDb.deleteCoupon(code);
    if (!success) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
