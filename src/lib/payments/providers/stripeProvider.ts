import { PaymentProvider, TransactionResult } from '../types';
import Stripe from 'stripe';

export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;

  constructor() {
    // We use a dummy test key if the environment variable is not set yet
    // In a real production scenario, it would throw an error if missing.
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeKeyForDevelopmentPurposesOnlyDoNotUse';
    this.stripe = new Stripe(secretKey, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: '2026-05-27.dahlia' as any, // Cast as any to bypass strict literal type matching
    });
  }

  async createTransaction(
    amount: number,
    currency: string,
    orderId: string,
    customerEmail: string
  ): Promise<TransactionResult> {
    try {
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount, // Amount must be in cents (or smallest currency unit)
        currency,
        receipt_email: customerEmail,
        metadata: {
          orderId,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        transactionId: paymentIntent.id,
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Stripe API Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize Stripe payment intent',
      };
    }
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(transactionId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Stripe Verification Error:', error);
      return false;
    }
  }
}
