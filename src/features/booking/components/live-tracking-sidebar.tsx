'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  Bike,
  CheckCircle2,
  DollarSign,
  Headphones,
  Package,
  PhoneCall,
  Plus,
} from 'lucide-react';
import { BookingOrder } from '../types/booking-types';
import { Button } from '@/components/atoms/button';
import { APP_CONFIG } from '@/lib/constants';

interface LiveTrackingSidebarProps {
  order: BookingOrder;
  isCourierAssigned: boolean;
  courierName: string;
  courierVehicle: string;
  courierPhone: string;
}

/**
 * Sticky sidebar displaying assigned courier contact, COD/prepaid guidance,
 * parcel reference metadata, support hotline, and merchant booking CTA.
 */
export function LiveTrackingSidebar({
  order,
  isCourierAssigned,
  courierName,
  courierVehicle,
  courierPhone,
}: LiveTrackingSidebarProps) {
  const tLive = useTranslations('LiveTracking');
  const isCodOrder = Boolean(order.cod?.isCod && order.cod.amount > 0);

  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      {/* Assigned Express Courier Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-amber-800 border border-primary-200">
            <Bike className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {tLive('courierSection')}
            </span>
            <p className="text-sm font-extrabold text-slate-900 truncate">
              {isCourierAssigned ? courierName : tLive('courierAssigning')}
            </p>
            {isCourierAssigned && (
              <p className="text-xs text-slate-500 font-mono mt-0.5">{courierVehicle}</p>
            )}
          </div>
        </div>

        {isCourierAssigned ? (
          <a
            href={`tel:${courierPhone.replace(/\s+/g, '')}`}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-secondary-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-secondary-700 active:scale-95 transition"
          >
            <PhoneCall className="h-4 w-4 text-primary-400" />
            <span>
              {tLive('callCourier')} · {courierPhone}
            </span>
          </a>
        ) : (
          <p className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 leading-relaxed">
            {tLive('assigningHint')}
          </p>
        )}
      </div>

      {/* COD Collection or Prepaid Confirmation Card */}
      {isCodOrder ? (
        <div className="rounded-2xl border border-primary-200 bg-primary-50/90 p-4 text-xs text-primary-950 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-bold">
              <DollarSign className="h-4 w-4 text-primary-700 shrink-0" />
              <span>{tLive('codAmountTitle')}</span>
            </span>
            <span className="font-mono text-lg font-black text-slate-900 shrink-0">
              {APP_CONFIG.currencySymbol}
              {order.cod.amount.toFixed(2)}
            </span>
          </div>
          <p className="text-primary-800 leading-relaxed">{tLive('codHelper')}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-success-200 bg-success-50/80 p-4 text-xs text-success-900 flex items-start gap-2.5 shadow-2xs">
          <CheckCircle2 className="h-4 w-4 text-success-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">{tLive('noCodTitle')}</p>
            <p className="text-success-700 mt-0.5 leading-relaxed">{tLive('noCodHelper')}</p>
          </div>
        </div>
      )}

      {/* Parcel Summary Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <Package className="h-4 w-4 text-secondary-600" />
          <h3 className="font-bold text-slate-900 text-sm">{tLive('parcelCardTitle')}</h3>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-slate-500">{tLive('orderRefLabel')}</span>
          <span className="font-mono font-bold text-slate-900">
            {order.parcel?.sellerOrderRef || order.trackingNumber}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-slate-500 shrink-0">{tLive('parcelDescLabel')}</span>
          <span className="font-semibold text-slate-800 text-right">
            {order.parcel?.description || tLive('defaultParcelDesc')}
          </span>
        </div>
      </div>

      {/* Support & Merchant Booking CTA */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-secondary-600">
            <Headphones className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">{tLive('needHelpTitle')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{tLive('supportHours')}</p>
            <a
              href={`tel:${APP_CONFIG.supportPhoneRaw}`}
              className="mt-1 inline-block font-mono text-xs font-black text-secondary-700 hover:underline"
            >
              {APP_CONFIG.supportPhone}
            </a>
          </div>
        </div>

        <Link href="/booking" className="block">
          <Button
            type="button"
            variant="outline"
            size="md"
            leftIcon={<Plus className="h-4 w-4" />}
            className="w-full justify-center rounded-xl font-bold cursor-pointer"
          >
            {tLive('bookOwn')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

