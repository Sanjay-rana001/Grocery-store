import { PaymentProvider, TransactionResult } from '../types';

export class MockProvider implements PaymentProvider {
  async createTransaction(
    amount: number,
    currency: string,
    orderId: string,
    customerEmail: string
  ): Promise<TransactionResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return a fake client secret and transaction ID
    return {
      success: true,
      clientSecret: 'mock_secret_key_12345',
      transactionId: `mock_txn_${Date.now()}`,
    };
  }

  async verifyPayment(transactionId: string): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Always succeed for mock payments
    return transactionId.startsWith('mock_txn_');
  }
}
