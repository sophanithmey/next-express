import React from 'react';
import { Label } from '../atoms/label';
import { cn } from '@/lib/cn';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  optional,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label required={required} optional={optional}>
          {label}
        </Label>
      )}
      {children}
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
      {!error && hint && <p className="text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}
