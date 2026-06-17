import { NextResponse } from 'next/server';
import * as serverDb from '@/lib/serverDb';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    const result = serverDb.validateCoupon(code, subtotal);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
