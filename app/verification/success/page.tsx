// Success page after Stripe checkout
'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerificationSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm max-w-md">
        <div className="text-green-600 text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
        <p className="text-gray-600 mb-4">
          Your verification tier upgrade is being processed. You&apos;ll receive a confirmation email shortly.
        </p>
        {sessionId && (
          <p className="text-xs text-gray-500 mb-4">Session ID: {sessionId}</p>
        )}
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

