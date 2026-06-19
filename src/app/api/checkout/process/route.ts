import { NextResponse } from 'next/server';
import { getActivePaymentProvider } from '@/lib/payments/gateway';

export async function POST(request: Request) {
  try {
    const { amount, currency, orderId, customerEmail, forcedProvider } = await request.json();

    if (!amount || !currency || !orderId || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the active provider (e.g., Stripe, PayPal, Mock) based on Firebase Settings
    const { name, provider } = await getActivePaymentProvider(forcedProvider);

    // Tell the active provider to initialize a transaction
    const result = await provider.createTransaction(amount, currency, orderId, customerEmail);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Return the required information back to the client to render the correct UI
    return NextResponse.json({
      providerName: name,
      clientSecret: result.clientSecret,
      transactionId: result.transactionId,
      providerData: result.providerData,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Checkout Processing Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
