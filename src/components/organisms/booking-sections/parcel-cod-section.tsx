'use client';

import React, { useState } from 'react';
import { ParcelInfo, CodInfo } from '@/features/booking/types/booking-types';
import { Input } from '../../atoms/input';
import { Label } from '../../atoms/label';
import { Switch } from '../../atoms/switch';
import { Package, Banknote, DollarSign, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ParcelCodSectionProps {
  parcel: ParcelInfo;
  cod: CodInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onChangeCod: (cod: CodInfo) => void;
  error?: string;
  defaultExpanded?: boolean;
}

export function ParcelCodSection({
  parcel,
  cod,
  onChangeParcel,
  onChangeCod,
  error,
  defaultExpanded = true,
}: ParcelCodSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const hasCustomData =
    Boolean(parcel.sellerOrderRef?.trim()) ||
    Boolean(parcel.description?.trim()) ||
    cod.isCod;

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition-all">
      {/* Header: Title, Optional Tag, and Collapse Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-xs font-bold font-mono">
            C
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Parcel &amp; Payment Options
            </h2>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer select-none py-1 px-2 rounded-lg hover:bg-brand-50/60 transition"
        >
          <span>{isExpanded ? 'Less options' : 'More options'}</span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* Collapsed Compact Preview */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          className="mt-3 flex items-center justify-between rounded-xl bg-slate-50/80 px-3.5 py-2.5 border border-slate-100 cursor-pointer hover:bg-slate-100/70 transition text-xs text-slate-600"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Package className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">
              {parcel.sellerOrderRef || 'No order ID'} •{' '}
              {parcel.description || 'General parcel'} •{' '}
              {cod.isCod && cod.amount > 0 ? (
                <span className="font-semibold text-emerald-700">
                  ${cod.amount.toFixed(2)} COD
                </span>
              ) : (
                'Prepaid (No COD)'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasCustomData && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Configured
              </span>
            )}
            <span className="text-[11px] font-semibold text-brand-600 flex-shrink-0">
              Edit
            </span>
          </div>
        </div>
      )}

      {/* Expanded Compact Form */}
      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in fade-in duration-150">
          {/* Row 1: Parcel inputs (Tight 2-column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="parcel-ref" className="text-xs text-slate-600">
                Order ID / Reference{' '}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="parcel-ref"
                placeholder="e.g. LIVE-0914"
                value={parcel.sellerOrderRef || ''}
                onChange={(e) =>
                  onChangeParcel({ ...parcel, sellerOrderRef: e.target.value })
                }
                leftIcon={<Package className="h-4 w-4 text-slate-400" />}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="parcel-desc" className="text-xs text-slate-600">
                Parcel Description{' '}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="parcel-desc"
                placeholder="e.g. Apparel / Retail Parcel"
                value={parcel.description || ''}
                onChange={(e) =>
                  onChangeParcel({ ...parcel, description: e.target.value })
                }
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Streamlined COD Toggle */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 flex-shrink-0">
                  <Banknote className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Collect Cash on Delivery (COD)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Courier collects payment from recipient upon delivery
                  </p>
                </div>
              </div>

              <Switch
                checked={cod.isCod}
                onChange={(checked) =>
                  onChangeCod({
                    isCod: checked,
                    amount: checked ? (cod.amount || 25) : 0,
                  })
                }
                aria-label="Toggle Cash on Delivery"
              />
            </div>

            {/* If COD is Enabled: Inline Amount Input */}
            {cod.isCod && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2.5">
                  <Label htmlFor="cod-amount" className="text-xs font-bold text-emerald-950 flex-shrink-0">
                    COD Amount (USD):
                  </Label>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                      $
                    </span>
                    <input
                      id="cod-amount"
                      type="number"
                      min="0.5"
                      step="0.5"
                      placeholder="25.00"
                      value={cod.amount || ''}
                      onChange={(e) =>
                        onChangeCod({
                          ...cod,
                          isCod: true,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border border-emerald-300 bg-white pl-6 pr-2.5 py-1 text-xs font-bold font-mono text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800">
                  <Check className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Directly remitted to seller balance (separate from delivery fee)</span>
                </div>
              </div>
            )}

            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
          </div>
        </div>
      )}
    </section>
  );
}