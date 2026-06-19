import { NextResponse } from 'next/server';
import { mockProducts, mockCoupons, mockCategories } from '@/lib/mockData';
import { saveProduct, saveCoupon, saveCategory } from '@/lib/firebaseServices';

export async function GET() {
  try {
    let productsCount = 0;
    let couponsCount = 0;
    let categoriesCount = 0;

    for (const category of mockCategories) {
      await saveCategory(category);
      categoriesCount++;
    }

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
      categoriesSeeded: categoriesCount,
      productsSeeded: productsCount,
      couponsSeeded: couponsCount
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
