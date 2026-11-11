'use client';

import React, { useId } from 'react';
import { AsYouType } from 'libphonenumber-js/max';
import { cn } from '@/lib/cn';
import {
  DEFAULT_CALLING_CODE,
  isValidCambodiaPhoneNumber,
  normalizePhoneNumber,
  sanitizeCambodiaPhoneInput,
} from '@/lib/phone-number';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string | boolean;
  helperText?: string;
  sizeVariant?: 'sm' | 'md' | 'lg';
  countryCode?: string;
  onValueChange?: (formattedValue: string, e164: string, isValid: boolean) => void;
}

/**
 * Formats a raw number as the user types using Cambodia's national numbering plan,
 * ensuring a leading '0' when omitted (e.g. '12888999' -> '012 888 999').
 */
function formatKhAsYouType(raw: string): string {
  const sanitized = sanitizeCambodiaPhoneInput(raw);
  if (!sanitized) return '';
  const ayt = new AsYouType('KH');
  return ayt.input(sanitized);
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      id: propId,
      name,
      label,
      required,
      optional,
      error,
      helperText,
      sizeVariant = 'md',
      countryCode = DEFAULT_CALLING_CODE,
      className,
      value,
      defaultValue,
      onChange,
      onBlur,
      onValueChange,
      disabled,
      placeholder = '012 345 678',
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = propId || generatedId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawVal = e.target.value;
      const formatted = formatKhAsYouType(rawVal);
      e.target.value = formatted;

      onChange?.(e);

      if (onValueChange) {
        const e164 = normalizePhoneNumber(formatted);
        const valid = isValidCambodiaPhoneNumber(formatted);
        onValueChange(formatted, e164, valid);
      }
    };

    const hasError = Boolean(error);
    const errorMessage = typeof error === 'string' ? error : undefined;

    // Size styling
    const sizeClasses = {
      sm: 'h-9 text-xs pl-[90px]',
      md: 'h-10 text-sm pl-[92px]',
      lg: 'h-12 text-sm pl-[96px]',
    }[sizeVariant];

    return (
      <div className="w-full space-y-1">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="text-xs font-semibold text-slate-800 block select-none"
            >
              {label}
              {required && <span className="text-danger-500 font-bold ml-0.5">*</span>}
            </label>
            {optional && (
              <span className="text-[11px] text-slate-400 font-normal">
                (Optional)
              </span>
            )}
          </div>
        )}

        <div className="relative flex w-full items-center">
          {/* Cambodia Flag & Calling Code Badge */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center gap-1.5 border-r border-slate-200 pr-2.5 text-xs font-semibold text-slate-700 pointer-events-none select-none">
            <span className="text-base leading-none" role="img" aria-label="Cambodia flag">
              🇰🇭
            </span>
            <span className="font-mono text-slate-900 font-bold">{countryCode}</span>
          </div>

          <input
            id={inputId}
            name={name}
            ref={ref}
            type="tel"
            inputMode="tel"
            disabled={disabled}
            placeholder={placeholder}
            value={value !== undefined ? formatKhAsYouType(String(value)) : undefined}
            defaultValue={
              defaultValue !== undefined ? formatKhAsYouType(String(defaultValue)) : undefined
            }
            onChange={handleChange}
            onBlur={onBlur}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={cn(
              'w-full rounded-xl border bg-white pr-3 text-slate-900 font-medium transition-all duration-150 shadow-2xs font-mono tracking-tight',
              'placeholder:text-slate-400 placeholder:font-normal placeholder:font-sans',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed disabled:shadow-none hover:disabled:border-slate-200',
              'read-only:bg-slate-50/60 read-only:text-slate-800 read-only:cursor-default read-only:border-slate-200',
              sizeClasses,
              hasError
                ? 'border-danger-500 hover:border-danger-600 focus:border-danger-600 focus:ring-danger-500/20'
                : 'border-slate-300 hover:border-slate-400 focus:border-secondary-500 focus:ring-secondary-500/20',
              className
            )}
            {...props}
          />
        </div>

        {errorMessage && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-danger-600">
            {errorMessage}
          </p>
        )}

        {!errorMessage && helperText && (
          <p id={`${inputId}-helper`} className="text-[11px] text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
