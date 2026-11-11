'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Coins,
  Banknote,
  Wallet,
  CreditCard,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { fullImageUrl } from '@/lib/image-url';
import { PaymentOptionItem } from '@/features/payment/types/payment-types';
import { normalizePaymentKind } from '@/features/payment/utils/payment-provider-helpers';

interface PaymentOptionCardProps {
  option: PaymentOptionItem;
  isSelected: boolean;
  defaultLabel: string;
  onSelect: (providerCode: string) => void;
}

function FallbackMethodIcon({ providerCode }: { providerCode: string }) {
  const kind = normalizePaymentKind(providerCode);
  if (kind === 'wingpoint') return <Coins className="h-5 w-5 text-amber-500" />;
  if (kind === 'wallet') return <Wallet className="h-5 w-5 text-blue-600" />;
  if (kind === 'cop') return <Banknote className="h-5 w-5 text-emerald-600" />;
  if (kind === 'card') return <CreditCard className="h-5 w-5 text-purple-600" />;
  return <QrCode className="h-5 w-5 text-secondary-600" />;
}

function PaymentLogoImage({
  src,
  alt,
  providerCode,
}: {
  src: string;
  alt: string;
  providerCode: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="h-full w-full bg-slate-50 flex items-center justify-center">
        <FallbackMethodIcon providerCode={providerCode} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-full w-full object-contain"
    />
  );
}

function SubtitleImageBadge({ src }: { src: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => setHasError(true)}
      className="h-4 w-auto max-w-16 object-contain rounded-xs"
    />
  );
}

export function PaymentOptionCard({
  option,
  isSelected,
  defaultLabel,
  onSelect,
}: PaymentOptionCardProps) {
  const isUnavailable = !option.isAvailable;
  const resolvedLogoUrl = fullImageUrl(option.logoPath);
  const resolvedSubtitleImages = option.subtitleImages
    .map((img) => fullImageUrl(img))
    .filter(Boolean);

  return (
    <button
      type="button"
      disabled={isUnavailable}
      onClick={() => onSelect(option.providerCode)}
      className={cn(
        'text-left p-3.5 rounded-xl border transition flex items-start gap-3 relative',
        isUnavailable
          ? 'border-slate-200 bg-slate-50/70 opacity-60 cursor-not-allowed'
          : 'cursor-pointer',
        !isUnavailable && isSelected
          ? 'border-secondary-600 bg-secondary-50/40 shadow-2xs ring-1 ring-secondary-600/20'
          : !isUnavailable
          ? 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
          : '',
      )}
    >
      <div className="h-11 w-11 rounded-xl overflow-hidden bg-white ring-1 ring-slate-200/80 flex items-center justify-center shrink-0">
        <PaymentLogoImage
          key={resolvedLogoUrl || option.providerCode}
          src={resolvedLogoUrl}
          alt={option.title}
          providerCode={option.providerCode}
        />
      </div>

      <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-xs text-slate-900 truncate">
            {option.title}
          </span>
          {option.isDefault && (
            <span className="text-[10px] font-semibold text-secondary-700 bg-secondary-100/80 px-1.5 py-0.5 rounded-full leading-none">
              {defaultLabel}
            </span>
          )}
        </div>

        {(option.unavailableReason || option.subtitle) && (
          <p
            className={cn(
              'text-[11px] leading-snug',
              isUnavailable ? 'text-danger-600 font-medium' : 'text-slate-500',
            )}
          >
            {isUnavailable && option.unavailableReason
              ? option.unavailableReason
              : option.subtitle}
          </p>
        )}

        {resolvedSubtitleImages.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            {resolvedSubtitleImages.map((src, index) => (
              <SubtitleImageBadge key={`${src}-${index}`} src={src} />
            ))}
          </div>
        )}
      </div>

      <div
        className={cn(
          'h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-1',
          isSelected
            ? 'border-secondary-600 bg-secondary-600 text-white'
            : 'border-slate-300 bg-white',
        )}
      >
        {isSelected && <Check className="h-2.5 w-2.5 stroke-3" />}
      </div>
    </button>
  );
}
