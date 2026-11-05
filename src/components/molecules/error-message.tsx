import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-rose-800',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider">{title}</h4>
        <p className="mt-1 text-xs text-rose-700 leading-relaxed">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-xs font-semibold text-rose-800 underline hover:text-rose-900"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

