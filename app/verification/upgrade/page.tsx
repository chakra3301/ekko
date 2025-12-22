// Verification tier upgrade page with Stripe checkout
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
export default function UpgradeVerificationPage() {
  const { data: session } = useSession();
  const [selectedTier] = useState<'RED' | 'BLACK' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to upgrade your verification tier</p>
          <a
            href="/api/auth/signin"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  if (session.user.role !== 'ARTIST') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Only artists can upgrade verification tiers</p>
        </div>
      </div>
    );
  }

  const handleUpgrade = async (tier: 'RED' | 'BLACK') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  const tiers = [
    {
      name: 'RED',
      displayName: 'Red Verification',
      price: '$9.99',
      pricePerMonth: '/month',
      description: 'Basic verification tier with enhanced profile visibility',
      features: [
        'Verified badge',
        'Priority in search results',
        'Enhanced profile features',
      ],
    },
    {
      name: 'BLACK',
      displayName: 'Black Verification',
      price: '$29.99',
      pricePerMonth: '/month',
      description: 'Premium verification tier with maximum visibility',
      features: [
        'Premium verified badge',
        'Top priority in search results',
        'All Red tier features',
        'Advanced analytics',
        'Priority support',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Verification Tier</h1>
          <p className="text-lg text-gray-600">
            Choose a verification tier to enhance your profile visibility and credibility
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-white rounded-lg shadow-sm border-2 p-8 ${
                selectedTier === tier.name ? 'border-blue-600' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.displayName}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                  <span className="text-gray-600 ml-2">{tier.pricePerMonth}</span>
                </div>
                <p className="text-gray-600 mt-2">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(tier.name as 'RED' | 'BLACK')}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedTier === tier.name
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : `Upgrade to ${tier.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Payment is processed securely through Stripe. You can cancel your subscription at any time.
          </p>
        </div>
      </div>
    </div>
  );
}

