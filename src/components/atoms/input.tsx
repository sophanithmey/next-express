import React from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  sizeVariant?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      leftIcon,
      rightIcon,
      disabled,
      sizeVariant = 'md',
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-9 text-xs px-3',
      md: 'h-10 text-sm px-3.5',
      lg: 'h-12 text-sm px-4',
    }[sizeVariant];

    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 pointer-events-none text-slate-400 flex items-center flex-shrink-0 z-10">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border bg-white py-2 text-slate-900 font-medium transition-all duration-150 shadow-2xs',
            'placeholder:text-slate-400 placeholder:font-normal',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed disabled:shadow-none hover:disabled:border-slate-200',
            'read-only:bg-slate-50/60 read-only:text-slate-800 read-only:cursor-default read-only:border-slate-200',
            sizeClasses,
            Boolean(leftIcon) && (sizeVariant === 'sm' ? 'pl-9' : 'pl-10'),
            Boolean(rightIcon) && (sizeVariant === 'sm' ? 'pr-9' : 'pr-10'),
            error
              ? 'border-danger-500 hover:border-danger-600 focus:border-danger-600 focus:ring-danger-500/20'
              : 'border-slate-300 hover:border-slate-400 focus:border-secondary-500 focus:ring-secondary-500/20',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 pointer-events-none text-slate-400 flex items-center flex-shrink-0 z-10">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
