import { PaymentProvider } from './types';
import { StripeProvider } from './providers/stripeProvider';
import { MockProvider } from './providers/mockProvider';
import { getSystemSettings } from '../firebaseServices';

// We can instantiate these once to avoid recreating them on every request
const providers = {
  stripe: new StripeProvider(),
  mock: new MockProvider(),
};

/**
 * Gets the currently active payment provider.
 */
export async function getActivePaymentProvider(forcedProvider?: 'stripe' | 'mock'): Promise<{ name: string, provider: PaymentProvider }> {
  
  // If we pass a forced provider (e.g. from a client request or admin setting), use it
  if (forcedProvider && providers[forcedProvider]) {
    return { name: forcedProvider, provider: providers[forcedProvider] };
  }

  try {
    // Read from Firebase System Settings so Admin can toggle it in real-time!
    const settings = await getSystemSettings();
    const active = settings.activePaymentProvider;
    if (active && active in providers) {
      const providerKey = active as keyof typeof providers;
      return { name: providerKey, provider: providers[providerKey] };
    }
  } catch (error) {
    console.error('Failed to get payment system settings, falling back to Environment Var');
  }

  // Fallback to Environment Variable
  const envProvider = process.env.ACTIVE_PAYMENT_PROVIDER as keyof typeof providers;
  
  if (envProvider && providers[envProvider]) {
    return { name: envProvider, provider: providers[envProvider] };
  }

  // Default to mock if nothing is configured to prevent crashes during testing
  return { name: 'mock', provider: providers.mock };
}
