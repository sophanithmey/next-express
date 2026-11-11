'use client';

import React from 'react';
import { Banknote } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';

interface StopCodInputProps {
  id: string;
  value?: number;
  onChange: (amount: number) => void;
  error?: string;
}

/**
 * Compact optional Cash on Delivery (COD) input for an individual multi-drop stop.
 */
export function StopCodInput({ id, value, onChange, error }: StopCodInputProps) {
  const tRecipient = useTranslations('Recipient');
  const tCommon = useTranslations('Common');

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} optional>
          {tRecipient('stopCodLabel')}
        </Label>
        <span className="text-[10px] font-medium text-slate-400">
          {tCommon('usd')}
        </span>
      </div>
      <Input
        id={id}
        type="number"
        min="0"
        step="0.5"
        placeholder={tRecipient('stopCodPlaceholder')}
        value={typeof value === 'number' && value > 0 ? value : ''}
        onChange={(e) => {
          const parsed = parseFloat(e.target.value);
          onChange(Number.isFinite(parsed) && parsed >= 0 ? parsed : 0);
        }}
        leftIcon={<Banknote className="h-4 w-4 text-amber-600" />}
        className="font-mono font-semibold"
        error={Boolean(error)}
        sizeVariant="md"
      />
      {error && <p className="text-xs font-medium text-danger-600">{error}</p>}
    </div>
  );
}

