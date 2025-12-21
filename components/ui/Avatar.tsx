// Avatar component - displays user profile picture or initials
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Note: For Next.js Image component, you may need to configure image domains
// in next.config.js if using external image URLs

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Avatar component
 * Displays user profile picture or fallback with initials
 */
export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium overflow-hidden',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          fill
          className="object-cover"
          sizes={`${size === 'sm' ? '32px' : size === 'md' ? '48px' : size === 'lg' ? '64px' : '96px'}`}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

