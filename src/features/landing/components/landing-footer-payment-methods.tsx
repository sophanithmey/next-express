'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

export function LandingFooterPaymentMethods() {
  const t = useTranslations('Footer');

  return (
    <div className="space-y-2 pt-2.5 border-t border-slate-100">
      <span className="text-[11px] font-bold text-slate-800 tracking-tight block">
        {t('weAccept')}
      </span>
      <div className="flex flex-wrap items-center gap-1.5">
        {/* KHQR Badge (from Vireak Buntham) */}
        <div
          title="KHQR (National QR Code Standard)"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-[#CE0E2D] shadow-2xs overflow-hidden hover:scale-105 transition-transform cursor-pointer p-0.5"
        >
          <img
            src="/images/payments/khqr.svg"
            alt="KHQR"
            width={44}
            height={26}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Wing Bank Badge (from Vireak Buntham) */}
        <div
          title="Wing Bank Digital Payments"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-white border border-slate-200/90 shadow-2xs overflow-hidden hover:scale-105 transition-transform cursor-pointer"
        >
          <img
            src="/images/payments/wing-bank.jpg"
            alt="Wing Bank"
            width={44}
            height={26}
            className="h-full w-full object-cover"
          />
        </div>

        {/* VISA Badge */}
        <div
          title="Visa"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-[#1A1F71] shadow-2xs overflow-hidden hover:scale-105 transition-transform cursor-pointer"
        >
          <svg viewBox="0 0 52 28" className="h-full w-full" aria-hidden="true">
            <text
              x="26"
              y="19"
              fill="#FFFFFF"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle="italic"
              fontWeight="900"
              fontSize="13.5"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              VISA
            </text>
          </svg>
        </div>

        {/* Mastercard Badge */}
        <div
          title="Mastercard"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-[#18181B] shadow-2xs overflow-hidden hover:scale-105 transition-transform cursor-pointer"
        >
          <svg viewBox="0 0 52 28" className="h-full w-full" aria-hidden="true">
            <circle cx="21" cy="14" r="7.5" fill="#EB001B" />
            <circle cx="31" cy="14" r="7.5" fill="#F79E1B" fillOpacity="0.88" />
          </svg>
        </div>

        {/* UnionPay Badge */}
        <div
          title="UnionPay"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-white border border-slate-200/90 shadow-2xs overflow-hidden relative hover:scale-105 transition-transform cursor-pointer"
        >
          <svg viewBox="0 0 52 28" className="h-full w-full" aria-hidden="true">
            <rect x="0" y="0" width="22" height="28" fill="#D81E06" />
            <rect x="22" y="0" width="13" height="28" fill="#004B87" />
            <rect x="35" y="0" width="17" height="28" fill="#008069" />
            <g transform="skewX(-14) translate(8, 0)">
              <text
                x="14"
                y="13"
                fill="#FFFFFF"
                fontFamily="system-ui, sans-serif"
                fontWeight="800"
                fontSize="5"
                textAnchor="middle"
              >
                UnionPay
              </text>
              <text
                x="14"
                y="21"
                fill="#FFFFFF"
                fontFamily="system-ui, sans-serif"
                fontWeight="900"
                fontSize="6.5"
                textAnchor="middle"
              >
                银联
              </text>
            </g>
          </svg>
        </div>

        {/* JCB Badge */}
        <div
          title="JCB"
          className="flex h-6.5 w-11 shrink-0 items-center justify-center rounded bg-white border border-slate-200/90 shadow-2xs overflow-hidden hover:scale-105 transition-transform cursor-pointer"
        >
          <svg viewBox="0 0 52 28" className="h-full w-full" aria-hidden="true">
            <g transform="translate(10, 4)">
              <rect x="0" y="0" width="10" height="20" rx="3" fill="#003A8F" />
              <text x="5" y="15" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">J</text>
              <rect x="11" y="0" width="10" height="20" rx="3" fill="#E60012" />
              <text x="16" y="15" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">C</text>
              <rect x="22" y="0" width="10" height="20" rx="3" fill="#00873C" />
              <text x="27" y="15" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">B</text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
