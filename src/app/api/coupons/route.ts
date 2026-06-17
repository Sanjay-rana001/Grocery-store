import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function GET() {
  try {
    const coupons = await firebaseServices.getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coupon = await firebaseServices.saveCoupon(body);
    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save coupon' }, { status: 400 });
  }
}
