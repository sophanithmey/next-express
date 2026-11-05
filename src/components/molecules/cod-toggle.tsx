'use client';

import React from 'react';
import { Switch } from '../atoms/switch';
import { Input } from '../atoms/input';
import { Label } from '../atoms/label';
import { DollarSign, Info } from 'lucide-react';

interface CodToggleProps {
  isCod: boolean;
  amount: number;
  onToggle: (checked: boolean) => void;
  onChangeAmount: (val: number) => void;
  error?: string;
}

export function CodToggle({
  isCod,
  amount,
  onToggle,
  onChangeAmount,
  error,
}: CodToggleProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-slate-50/80 p-3.5 border border-slate-200/80">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-slate-800 block">
            Collect money from recipient (COD)
          </span>
          <p className="text-[11px] text-slate-500">
            Courier will collect payment from buyer upon parcel delivery
          </p>
        </div>
        <Switch checked={isCod} onChange={onToggle} aria-label="Toggle Cash on Delivery" />
      </div>

      {isCod && (
        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 animate-in fade-in">
          <div className="space-y-1.5">
            <Label htmlFor="cod-amount-input">COD Collection Amount (USD)</Label>
            <div className="relative">
              <Input
                id="cod-amount-input"
                type="number"
                min="0.5"
                step="0.5"
                placeholder="25.00"
                value={amount || ''}
                onChange={(e) => onChangeAmount(parseFloat(e.target.value) || 0)}
                leftIcon={<DollarSign className="h-4 w-4 text-emerald-600" />}
                className="font-mono text-base font-bold text-emerald-950"
                error={Boolean(error)}
              />
            </div>
            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          </div>

          <div className="flex items-start gap-2 text-xs text-emerald-900 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
            <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Notice:</strong> This COD amount will be collected directly from the recipient
              and remitted to your merchant balance. It is separate from the delivery fee.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

