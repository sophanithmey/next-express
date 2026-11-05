import React from 'react';
import { cn } from '@/lib/cn';
import { APP_CONFIG } from '@/lib/constants';

interface PriceRowProps {
  label: string;
  amount: number;
  isTotal?: boolean;
  isDiscount?: boolean;
  subtitle?: string;
  className?: string;
}

export function PriceRow({
  label,
  amount,
  isTotal = false,
  isDiscount = false,
  subtitle,
  className,
}: PriceRowProps) {
  const formattedAmount = `${APP_CONFIG.currencySymbol}${amount.toFixed(2)}`;

  return (
    <div
      className={cn(
        'flex items-baseline justify-between py-1.5',
        isTotal ? 'border-t border-slate-200 pt-3' : '',
        className
      )}
    >
      <div>
        <span
          className={cn(
            isTotal ? 'text-sm font-semibold text-slate-900' : 'text-xs text-slate-600'
          )}
        >
          {label}
        </span>
        {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
      </div>

      <span
        className={cn(
          isTotal
            ? 'text-base font-bold text-slate-900'
            : isDiscount
            ? 'text-xs font-semibold text-emerald-600'
            : 'text-xs font-medium text-slate-700'
        )}
      >
        {isDiscount ? `-${formattedAmount}` : formattedAmount}
      </span>
    </div>
  );
}
