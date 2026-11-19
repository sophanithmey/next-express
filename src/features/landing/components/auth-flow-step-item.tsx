import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthFlowStepItemProps {
  stepNumber?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  isLast?: boolean;
  accent?: 'secondary' | 'brand';
  spacing?: 'normal' | 'relaxed';
}

/**
 * Reusable visual process step with icon timeline node and vertical connector.
 */
export function AuthFlowStepItem({
  icon: Icon,
  title,
  description,
  isLast = false,
  accent = 'secondary',
  spacing = 'normal',
}: AuthFlowStepItemProps) {
  const isBrand = accent === 'brand';
  const isRelaxed = spacing === 'relaxed';

  const nodeStyle = isBrand
    ? 'border-brand-200/90 bg-brand-50/80 text-brand-700'
    : 'border-secondary-200/90 bg-secondary-50/80 text-secondary-600';

  const lineHeightClass = isRelaxed
    ? 'min-h-[48px] sm:min-h-[54px]'
    : 'min-h-[38px] sm:min-h-[42px]';

  const paddingBottomClass = !isLast
    ? isRelaxed
      ? 'pb-7 sm:pb-9'
      : 'pb-5 sm:pb-6'
    : 'pb-1';

  return (
    <div className='relative flex items-start gap-3.5 sm:gap-4 group'>
      {/* Icon node on timeline with vertical connecting line */}
      <div className='flex flex-col items-center shrink-0 self-stretch'>
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-2xs transition-transform duration-200 group-hover:scale-105 ${nodeStyle}`}
        >
          <Icon className='h-4 w-4' />
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 bg-slate-200/90 my-1 rounded-full ${lineHeightClass}`}
          />
        )}
      </div>

      {/* Content Column: Title + Description */}
      <div className={`min-w-0 flex-1 pt-1 ${paddingBottomClass}`}>
        <h4 className='text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug'>
          {title}
        </h4>
        <p className='mt-1 text-xs sm:text-[13px] text-slate-500 leading-relaxed'>
          {description}
        </p>
      </div>
    </div>
  );
}
