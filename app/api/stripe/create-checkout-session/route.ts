// API route for creating Stripe checkout session for verification tier subscription
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripeClient } from '@/lib/stripe';
import { VerificationTier } from '@prisma/client';
import type { CreateCheckoutSessionRequest, CreateCheckoutSessionResponse } from '@/lib/types/verification';

/**
 * POST /api/stripe/create-checkout-session
 * Create a Stripe checkout session for upgrading to RED or BLACK verification tier
 * Requires authentication and ARTIST role
 */
export async function POST(
  req: Request
): Promise<NextResponse<CreateCheckoutSessionResponse | { error: string }>> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only artists can upgrade
  if (session.user.role !== 'ARTIST') {
    return NextResponse.json({ error: 'Only artists can upgrade verification tier' }, { status: 403 });
  }

  try {
    const body: CreateCheckoutSessionRequest = await req.json();

    // Validation
    if (!body.tier || (body.tier !== 'RED' && body.tier !== 'BLACK')) {
      return NextResponse.json({ error: 'Tier must be RED or BLACK' }, { status: 400 });
    }

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!artistProfile) {
      return NextResponse.json({ error: 'Artist profile not found' }, { status: 404 });
    }

    // Check if already at or above requested tier
    const tierHierarchy: Record<VerificationTier, number> = {
      NONE: 0,
      RED: 1,
      BLACK: 2,
      PLATINUM: 3,
    };

    const requestedTierValue = tierHierarchy[body.tier];
    const currentTierValue = tierHierarchy[artistProfile.verificationTier];

    if (currentTierValue >= requestedTierValue) {
      return NextResponse.json({ error: `You are already at or above ${body.tier} tier` }, { status: 400 });
    }

    // Get Stripe client
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
    }

    // Define pricing (in cents)
    const pricing: Record<'RED' | 'BLACK', number> = {
      RED: 999, // $9.99/month
      BLACK: 2999, // $29.99/month
    };

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${body.tier} Verification Tier`,
              description: `Upgrade to ${body.tier} verification tier on EKKO`,
            },
            recurring: {
              interval: 'month',
            },
            unit_amount: pricing[body.tier],
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      metadata: {
        userId: session.user.id,
        artistId: artistProfile.id,
        requestedTier: body.tier,
      },
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verification/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verification/cancel`,
    });

    const response: CreateCheckoutSessionResponse = {
      sessionId: checkoutSession.id,
      url: checkoutSession.url || '',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

