'use client';

import React from 'react';
import { CodInfo } from '@/features/booking/types/booking-types';
import { Switch } from '../atoms/switch';
import { FormField } from '../molecules/form-field';
import { Input } from '../atoms/input';
import { DollarSign, ShieldAlert, Banknote } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

interface CodSectionProps {
  cod: CodInfo;
  onChangeCod: (cod: CodInfo) => void;
}

export function CodSection({ cod, onChangeCod }: CodSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Cash on Delivery (COD)</h3>
        <p className="text-xs text-slate-500">
          Collect item payment directly from the recipient upon delivery
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-5">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">
                Collect Payment from Recipient (COD)
              </h4>
              <p className="text-xs text-slate-500">
                Driver will collect this amount in cash before handing over the parcel
              </p>
            </div>
          </div>

          <Switch
            checked={cod.isCod}
            onChange={(checked) =>
              onChangeCod({
                isCod: checked,
                amount: checked ? cod.amount || 10 : 0,
              })
            }
          />
        </div>

        {cod.isCod && (
          <div className="space-y-4 pt-2">
            <FormField
              label="COD Collection Amount"
              required
              hint="Amount to collect from customer. This money belongs to the seller."
            >
              <Input
                type="number"
                step="0.01"
                min="0.10"
                value={cod.amount || ''}
                onChange={(e) =>
                  onChangeCod({
                    ...cod,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                leftIcon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                placeholder="0.00"
                required
              />
            </FormField>

            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-amber-800 text-xs">
              <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Important Distinction:</p>
                <p className="mt-0.5 leading-relaxed">
                  COD is <strong>not</strong> a delivery charge. The full COD amount ({APP_CONFIG.currencySymbol}
                  {cod.amount.toFixed(2)}) is collected on your behalf and remitted directly to your merchant account.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
