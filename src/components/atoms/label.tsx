import React from 'react';
import { cn } from '@/lib/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  optional?: boolean;
}

export function Label({
  className,
  required,
  optional,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        'block text-xs font-semibold text-slate-800 tracking-normal select-none',
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        <span>{children}</span>
        {required && (
          <span className="text-danger-500 font-bold ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="text-[11px] font-normal text-slate-400 ml-1">
            (Optional)
          </span>
        )}
      </span>
    </label>
  );
}
