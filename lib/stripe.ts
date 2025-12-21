// Stripe integration helper
// Server-side Stripe client and utility functions
// Environment variable required: STRIPE_SECRET_KEY
import Stripe from 'stripe';

// Initialize Stripe client
// Only initialize if secret key is provided
let stripeClient: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
}

/**
 * Get Stripe client instance
 * Returns null if STRIPE_SECRET_KEY is not configured
 */
export function getStripeClient(): Stripe | null {
  return stripeClient;
}

/**
 * Create a Stripe checkout session
 * Placeholder function - implement based on your requirements
 */
export async function createCheckoutSession(params: {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer: params.customerId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session;
}

/**
 * Create a Stripe customer
 * Placeholder function - implement based on your requirements
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  const stripe = getStripeClient();

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });

  return customer;
}

/**
 * Handle Stripe webhook events
 * Placeholder function - implement webhook handlers
 */
export async function handleWebhookEvent(
  event: Stripe.Event
): Promise<{ received: boolean }> {
  // Implement webhook event handling
  // Example: handle subscription.created, payment_intent.succeeded, etc.
  // eslint-disable-next-line no-console
  console.log('Webhook event received:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      // Handle successful checkout
      break;
    case 'customer.subscription.updated':
      // Handle subscription updates
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    default:
      // eslint-disable-next-line no-console
      console.log(`Unhandled event type: ${event.type}`);
  }

  return { received: true };
}

