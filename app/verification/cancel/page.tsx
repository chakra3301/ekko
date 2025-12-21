// Cancel page if user cancels Stripe checkout
'use client';

import React from 'react';
import Link from 'next/link';

export default function VerificationCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
        <div className="text-gray-400 text-5xl mb-4">✕</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
        <p className="text-gray-600 mb-4">
          Your payment was cancelled. No charges were made.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/verification/upgrade"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard"
            className="inline-block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

