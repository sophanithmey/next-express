'use client';

import React from 'react';
import { QrCode, Banknote, Wallet, CreditCard, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { APP_CONFIG } from '@/lib/constants';

export type PaymentMethodType = 'khqr' | 'cop' | 'wallet' | 'card';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  deliveryFee: number;
}

interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  deliveryFee,
}: PaymentMethodSelectorProps) {
  const options: PaymentOption[] = [
    {
      id: 'khqr',
      title: 'Wing Bank KHQR / Bakong',
      badge: 'Popular • Instant',
      description: 'Scan QR with Wing Bank, ABA, ACLEDA, or any Bakong banking app',
      icon: <QrCode className="h-5 w-5 text-emerald-600" />,
    },
    {
      id: 'cop',
      title: 'Cash on Pickup (COP)',
      badge: 'Pay Rider',
      description: 'Pay cash directly to the courier when picking up parcels',
      icon: <Banknote className="h-5 w-5 text-amber-600" />,
    },
    {
      id: 'wallet',
      title: 'Seller Balance (Wallet)',
      badge: '$142.50 Available',
      description: 'Deduct fee directly from your seller remittance balance',
      icon: <Wallet className="h-5 w-5 text-blue-600" />,
    },
    {
      id: 'card',
      title: 'Credit / Debit Card',
      badge: 'Visa / Mastercard',
      description: 'Pay securely using any local or international bank card',
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Payment Method</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              <span>Zero Processing Fees</span>
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select how delivery fees will be paid upon dispatch
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selectedMethod === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectMethod(opt.id)}
              className={cn(
                'text-left p-3.5 rounded-xl border transition flex flex-col justify-between relative',
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs ring-1 ring-emerald-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {opt.icon}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded inline-block mt-0.5">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={cn(
                    'h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5',
                    isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  )}
                >
                  {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* KHQR Preview Dropdown if KHQR is selected */}
      {selectedMethod === 'khqr' && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <div className="h-24 w-24 bg-white border border-emerald-200 rounded-xl p-1.5 flex flex-col items-center justify-center shadow-xs flex-shrink-0">
            <QrCode className="h-16 w-16 text-slate-800" />
            <span className="text-[9px] font-bold text-emerald-700 tracking-wider">KHQR BAKONG</span>
          </div>
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-bold text-slate-900 text-xs block">
              Scan to Pay {APP_CONFIG.currencySymbol}{deliveryFee.toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-600">
              Open Wing Bank, ABA, or any Bakong-enabled banking app on your phone to scan and approve.
            </p>
            <span className="text-[10px] text-emerald-800 font-semibold inline-block">
              ✓ Instant payment verification upon QR scan
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
