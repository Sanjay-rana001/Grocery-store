import { NextResponse } from 'next/server';
import { mockProducts, mockCoupons } from '@/lib/mockData';
import { saveProduct, saveCoupon } from '@/lib/firebaseServices';

export async function GET() {
  try {
    let productsCount = 0;
    let couponsCount = 0;

    for (const product of mockProducts) {
      await saveProduct(product);
      productsCount++;
    }

    for (const coupon of mockCoupons) {
      await saveCoupon(coupon);
      couponsCount++;
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Firestore seeded successfully!',
      productsSeeded: productsCount,
      couponsSeeded: couponsCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
