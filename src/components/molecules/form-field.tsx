import React from 'react';
import { Label } from '../atoms/label';
import { cn } from '@/lib/cn';

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && <Label required={required}>{label}</Label>}
      {children}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

