import React from 'react';
import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const generatedId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={generatedId}
            checked={checked}
            className={cn(
              'peer h-4 w-4 appearance-none rounded border border-slate-300 bg-white transition checked:border-brand-600 checked:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            {...props}
          />
          <Check className="pointer-events-none absolute left-0.5 top-1 h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </div>
        {(label || description) && (
          <label htmlFor={generatedId} className="cursor-pointer select-none">
            {label && <p className="text-sm font-medium text-slate-800">{label}</p>}
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
