// VerificationBadge component - displays artist verification tier
import { cn } from '@/lib/utils';

export type VerificationTier = 'NONE' | 'RED' | 'BLACK' | 'PLATINUM';

interface VerificationBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * VerificationBadge component
 * Displays artist verification tier with appropriate styling
 */
export function VerificationBadge({
  tier,
  size = 'md',
  className,
}: VerificationBadgeProps) {
  const tierConfig = {
    NONE: {
      label: 'Unverified',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-600',
      borderColor: 'border-gray-300',
    },
    RED: {
      label: 'Verified',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
    },
    BLACK: {
      label: 'Premium',
      bgColor: 'bg-gray-900',
      textColor: 'text-white',
      borderColor: 'border-gray-900',
    },
    PLATINUM: {
      label: 'Platinum',
      bgColor: 'bg-gradient-to-r from-gray-200 to-gray-400',
      textColor: 'text-gray-900',
      borderColor: 'border-gray-400',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const config = tierConfig[tier];

  if (tier === 'NONE') {
    return null; // Don't show badge for unverified
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-semibold border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        sizeClasses[size],
        className
      )}
    >
      {tier === 'PLATINUM' && (
        <svg
          className="w-3 h-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {config.label}
    </span>
  );
}

