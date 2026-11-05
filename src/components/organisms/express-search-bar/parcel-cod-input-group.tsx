'use client';

import React from 'react';
import { ParcelInfo, CodInfo } from '@/features/booking/types/booking-types';

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
      <label className="block text-[11px] font-semibold text-slate-400 tracking-tight uppercase leading-none mb-1.5">
        Parcel &amp; COD Amount
      </label>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={parcel.description || ''}
            onChange={(e) => onChangeParcel({ ...parcel, description: e.target.value })}
            placeholder="e.g. Clothes, Food"
            className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent"
          />
        </div>

        <span className="hidden sm:inline text-slate-300 text-xs">/</span>

        <div className="relative flex-1 flex items-center gap-1">
          <span className="text-xs font-bold text-emerald-600">$</span>
          <input
            type="number"
            step="0.5"
            min="0"
            value={cod.amount || ''}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              onChangeCod({
                isCod: val > 0,
                amount: val,
              });
            }}
            placeholder="0.00"
            className="w-full text-sm font-bold text-emerald-700 placeholder:text-slate-300 placeholder:font-normal focus:outline-none bg-transparent font-mono"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] mt-0.5">
        <span className="text-slate-400 truncate">
          {cod.isCod && cod.amount > 0 ? (
            <span className="text-emerald-700 font-semibold">
              Buyer pays ${cod.amount.toFixed(2)} COD
            </span>
          ) : (
            'Prepaid Delivery (No COD)'
          )}
        </span>
        <span className="text-slate-400 hidden sm:inline">Qty: {parcel.quantity || 1}</span>
      </div>
    </div>
  );
}
