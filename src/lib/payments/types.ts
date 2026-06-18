export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  clientSecret?: string;
  providerData?: any; // e.g., redirectUrl for PayPal
  error?: string;
}

export interface PaymentProvider {
  /**
   * Initializes a transaction with the specific payment provider.
   * @param amount The total amount in the smallest currency unit (e.g., cents)
   * @param currency The currency code (e.g., 'NZD')
   * @param orderId Our internal order ID
   * @param customerEmail The customer's email address
   */
  createTransaction(
    amount: number,
    currency: string,
    orderId: string,
    customerEmail: string
  ): Promise<TransactionResult>;

  /**
   * Verifies the status of a payment after it's processed.
   * @param transactionId The provider's transaction ID
   */
  verifyPayment(transactionId: string): Promise<boolean>;
}
