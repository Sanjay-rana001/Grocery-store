import { NextResponse } from 'next/server';
import * as firebaseServices from '@/lib/firebaseServices';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    const orders = email ? await firebaseServices.getOrdersByEmail(email) : await firebaseServices.getOrders();

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await firebaseServices.createOrder(body);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 400 });
  }
}
