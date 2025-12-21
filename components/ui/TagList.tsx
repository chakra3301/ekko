// TagList component - displays an array of tags/chips
import { cn } from '@/lib/utils';

interface TagListProps {
  tags: string[];
  variant?: 'default' | 'outline' | 'solid';
  size?: 'sm' | 'md';
  className?: string;
  maxTags?: number;
}

/**
 * TagList component
 * Displays an array of tags as chips
 */
export function TagList({
  tags,
  variant = 'default',
  size = 'md',
  className,
  maxTags,
}: TagListProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border border-gray-200',
    outline: 'bg-transparent text-gray-700 border border-gray-300',
    solid: 'bg-blue-600 text-white border border-blue-600',
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  };

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;

  if (tags.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500 italic', className)}>No tags</div>
    );
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayTags.map((tag, index) => (
        <span
          key={index}
          className={cn(
            'inline-flex items-center rounded-full font-medium',
            variantClasses[variant],
            sizeClasses[size]
          )}
        >
          {tag}
        </span>
      ))}
      {remainingCount > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full font-medium text-gray-600',
            variantClasses.default,
            sizeClasses[size]
          )}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

