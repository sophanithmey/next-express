'use client';

import React from 'react';
import { ParcelInfo, CodInfo } from '@/features/booking/types/booking-types';
import { Package, DollarSign, Check } from 'lucide-react';

interface ParcelCodInputGroupProps {
  parcel: ParcelInfo;
  cod: CodInfo;
  onChangeParcel: (parcel: ParcelInfo) => void;
  onChangeCod: (cod: CodInfo) => void;
}

export function ParcelCodInputGroup({
  parcel,
  cod,
  onChangeParcel,
  onChangeCod,
}: ParcelCodInputGroupProps) {
  return (
    <div className="relative flex-1 p-3.5 hover:bg-slate-50/80 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <label className="block text-[11px] font-semibold text-slate-400 tracking-tight uppercase leading-none">
          Parcel &amp; COD Amount
        </label>
        <span className="text-[10px] text-slate-400 font-medium">Qty: {parcel.quantity || 1}</span>
      </div>

      {/* Primary Parcel Description (Full Width, No Cramping) */}
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={parcel.description || ''}
          onChange={(e) => onChangeParcel({ ...parcel, description: e.target.value })}
          placeholder="e.g. Apparel / Retail Parcel"
          className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent truncate"
        />
        <Package className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
      </div>

      {/* Secondary COD or Prepaid Status (Full Width) */}
      <div className="flex items-center gap-1.5 mt-0.5">
        {cod.isCod ? (
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 font-mono">
            <DollarSign className="h-3 w-3 text-emerald-600 flex-shrink-0" />
            <input
              type="number"
              step="0.5"
              min="0"
              value={cod.amount || ''}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onChangeCod({
                  isCod: true,
                  amount: val,
                });
              }}
              placeholder="0.00"
              className="w-16 font-mono text-xs font-bold text-emerald-700 focus:outline-none bg-transparent"
            />
            <span className="text-[11px] font-normal text-emerald-600">COD to collect</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Check className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11px]">Prepaid delivery (No COD)</span>
          </div>
        )}
      </div>
    </div>
  );
}

