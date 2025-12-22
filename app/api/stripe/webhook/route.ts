// API route for Stripe webhook events
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripeClient } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { VerificationTier } from '@prisma/client';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 * In development, this can be stubbed or tested with Stripe CLI
 */
export async function POST(req: Request): Promise<NextResponse<{ received: boolean } | { error: string }>> {
  const stripe = getStripeClient();
  
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // In development, skip signature verification
      // eslint-disable-next-line no-console
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
    }

    let event: Stripe.Event;
    
    try {
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } else {
        // In development, parse without verification
        event = JSON.parse(body) as Stripe.Event;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get metadata
      const userId = session.metadata?.userId;
      const artistId = session.metadata?.artistId;
      const requestedTier = session.metadata?.requestedTier as VerificationTier;

      if (!userId || !artistId || !requestedTier) {
        // eslint-disable-next-line no-console
        console.error('Missing metadata in checkout session:', session.metadata);
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Update artist profile verification tier
      await prisma.artistProfile.update({
        where: { id: artistId },
        data: {
          verificationTier: requestedTier,
        },
      });

      // Artist tier updated successfully
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    // Error processing webhook - log to error tracking service
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

