'use client';

import React from 'react';
import { Landmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';

interface WingBankAccountUpdates {
  settlementBank?: string;
  settlementAccountName?: string;
  settlementAccountNumber?: string;
}

interface WingBankAccountFieldsProps {
  idPrefix: string;
  settlementBank?: string;
  accountName?: string;
  accountNumber?: string;
  isRequired: boolean;
  accountNameError?: string;
  accountNumberError?: string;
  onChange: (updates: WingBankAccountUpdates) => void;
}

/**
 * Collapsible Wing Bank payout fields triggered from the pickup optional pills.
 * Account Name and Account Number become mandatory when Cash on Delivery (COD) is enabled.
 */
export function WingBankAccountFields({
  idPrefix,
  settlementBank,
  accountName,
  accountNumber,
  isRequired,
  accountNameError,
  accountNumberError,
  onChange,
}: WingBankAccountFieldsProps) {
  const tPickup = useTranslations('Pickup');
  const accountNameId = `${idPrefix}-wing-account-name`;
  const accountNumberId = `${idPrefix}-wing-account-number`;

  const handleFieldChange = (field: 'name' | 'number', value: string) => {
    const nextName = field === 'name' ? value : (accountName ?? '');
    const nextNumber = field === 'number' ? value : (accountNumber ?? '');
    const hasAnyValue = Boolean(nextName.trim() || nextNumber.trim());

    onChange({
      settlementBank: hasAnyValue ? settlementBank || 'WING' : undefined,
      ...(field === 'name'
        ? { settlementAccountName: value }
        : { settlementAccountNumber: value }),
    });
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Landmark className="h-3.5 w-3.5 text-secondary-600 shrink-0" />
          <span>{tPickup('wingBankTitle')}</span>
        </div>
        <span
          className={
            isRequired
              ? 'inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800'
              : 'inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500'
          }
        >
          {isRequired
            ? tPickup('wingBankRequiredBadge')
            : tPickup('wingBankOptionalBadge')}
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        {isRequired
          ? tPickup('wingBankRequiredHint')
          : tPickup('wingBankOptionalHint')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <Label
            htmlFor={accountNameId}
            required={isRequired}
            optional={!isRequired}
          >
            {tPickup('wingAccountNameLabel')}
          </Label>
          <Input
            id={accountNameId}
            sizeVariant="md"
            value={accountName ?? ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder={tPickup('wingAccountNamePlaceholder')}
            error={Boolean(accountNameError)}
          />
          {accountNameError && (
            <p className="text-xs text-red-500 mt-1">{accountNameError}</p>
          )}
        </div>

        <div>
          <Label
            htmlFor={accountNumberId}
            required={isRequired}
            optional={!isRequired}
          >
            {tPickup('wingAccountNumberLabel')}
          </Label>
          <Input
            id={accountNumberId}
            sizeVariant="md"
            inputMode="numeric"
            value={accountNumber ?? ''}
            onChange={(e) => handleFieldChange('number', e.target.value)}
            placeholder={tPickup('wingAccountNumberPlaceholder')}
            error={Boolean(accountNumberError)}
          />
          {accountNumberError && (
            <p className="text-xs text-red-500 mt-1">{accountNumberError}</p>
          )}
        </div>
      </div>
    </div>
  );
}

