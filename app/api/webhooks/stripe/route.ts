// Stripe webhook handler
// Processes Stripe webhook events (subscriptions, payments, etc.)
// Environment variable required: STRIPE_WEBHOOK_SECRET
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getStripeClient, handleWebhookEvent } from '@/lib/stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const stripe = getStripeClient();
    
    if (!stripe) {
      // eslint-disable-next-line no-console
      console.error('Stripe is not configured');
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    await handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}

