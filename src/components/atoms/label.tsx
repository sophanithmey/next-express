import React from 'react';
import { cn } from '@/lib/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-xs font-semibold text-slate-700 tracking-wide uppercase', className)}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-rose-500">*</span>}
    </label>
  );
}

