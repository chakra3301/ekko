// AvailabilityPill component - displays artist availability status
import { cn } from '@/lib/utils';

export type AvailabilityStatus = 'OPEN' | 'LIMITED' | 'CLOSED';

interface AvailabilityPillProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * AvailabilityPill component
 * Displays artist availability with color-coded status
 */
export function AvailabilityPill({
  status,
  size = 'md',
  className,
}: AvailabilityPillProps) {
  const statusConfig = {
    OPEN: {
      label: 'Available',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500',
    },
    LIMITED: {
      label: 'Limited',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      dotColor: 'bg-yellow-500',
    },
    CLOSED: {
      label: 'Not Available',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        config.bgColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
    >
      <span
        className={cn('w-2 h-2 rounded-full', config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

