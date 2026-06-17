import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function GET() {
  try {
    const stats = await firebaseServices.getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
