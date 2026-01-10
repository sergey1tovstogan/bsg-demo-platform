import { LoadingSection as LoadingSectionType } from '@/lib/template-types';
import { Loader2 } from 'lucide-react';

interface LoadingSectionProps extends LoadingSectionType {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSection({ style = 'spinner', message, size = 'md' }: LoadingSectionProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const skeletonHeight = {
    sm: 'h-20',
    md: 'h-32',
    lg: 'h-48'
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-12"
      role="status"
      aria-live="polite"
      data-size={size}
    >
      {/* Spinner Style */}
      {style === 'spinner' && (
        <Loader2
          className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400 animate-spin`}
          data-testid="loading-spinner"
          aria-hidden="true"
        />
      )}

      {/* Skeleton Style */}
      {style === 'skeleton' && (
        <div
          className={`w-full max-w-md space-y-4`}
          data-testid="loading-skeleton"
        >
          <div className={`${skeletonHeight[size]} bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse`} />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
        </div>
      )}

      {/* Pulse Style */}
      {style === 'pulse' && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse`}
          data-testid="loading-pulse"
          aria-hidden="true"
        />
      )}

      {/* Message */}
      {message && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 text-center">
          {message}
        </p>
      )}

      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
