'use client';

import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export default function StripeCheckoutForm({
  onSuccess,
  totalAmount,
}: {
  onSuccess: () => void;
  totalAmount: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // We handle success manually instead of redirecting
    });

    if (error) {
      setErrorMessage(error.message || 'An unknown error occurred during payment.');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      setIsLoading(false);
      onSuccess();
    } else {
      setErrorMessage('Payment failed or is still processing.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-outline-variant/20 shadow-sm">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }} 
        />
      </div>

      {errorMessage && (
        <div className="bg-error/10 text-error p-4 rounded-xl flex items-center gap-3 text-sm font-semibold">
          <span className="material-symbols-outlined">error</span>
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 ${
          !stripe || isLoading
            ? 'bg-surface-container-low text-outline cursor-wait shadow-none'
            : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
        }`}
      >
        {isLoading ? (
          <>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Processing Payment...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">lock</span>
            Pay ${totalAmount.toFixed(2)} Securely
          </>
        )}
      </button>
      
      <p className="text-center text-xs text-outline mt-4 font-semibold flex items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">verified_user</span>
        Payments are secured and encrypted by Stripe
      </p>
    </form>
  );
}
