import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, ...props }, ref) => {
    return (
      <div className='relative flex items-center w-full'>
        {leftIcon && (
          <div className='absolute left-3 pointer-events-none text-slate-400 flex items-center'>
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
            Boolean(leftIcon) && 'pl-10',
            Boolean(rightIcon) && 'pr-10',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500/20',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <div className='absolute right-3 pointer-events-none text-slate-400 flex items-center'>
            {rightIcon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
