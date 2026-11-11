'use client';

import React from 'react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight, Package, ExternalLink, Store } from 'lucide-react';
import { UserProfile } from '@/features/auth/types/auth-types';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { StatusBadge } from '@/components/molecules/status-badge';

interface LandingAuthenticatedBannerProps {
  user: UserProfile | null;
  recentBookings: BookingOrder[];
}

export function LandingAuthenticatedBanner({
  user,
  recentBookings,
}: LandingAuthenticatedBannerProps) {
  const t = useTranslations('Home.authBanner');
  const sellerName = user?.shopName || user?.name || t('defaultSeller');

  return (
    <div className="rounded-2xl border border-secondary-200 bg-white p-5 sm:p-6 shadow-2xs space-y-4 mb-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-full border border-secondary-200">
            <Store className="h-3 w-3 text-secondary-600" />
            <span>{t('badge')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('welcome', { name: sellerName })}
          </h2>
          <p className="text-xs text-slate-500">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/bookings"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <Package className="h-4 w-4 text-slate-500" />
            <span>{t('myBookings')}</span>
          </Link>

          <Link
            href="/booking"
            prefetch={true}
            className="inline-flex items-center gap-1.5 rounded-xl bg-secondary-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-secondary-700 transition"
          >
            <span>{t('bookDelivery')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Compact Recent Bookings Strip */}
      {recentBookings && recentBookings.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
              {t('recentDispatches')}
            </span>
            <Link
              href="/bookings"
              className="text-[11px] font-semibold text-secondary-700 hover:underline"
            >
              {t('viewAllCount', { count: recentBookings.length })}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentBookings.slice(0, 3).map((order) => (
              <Link
                key={order.id}
                href={`/bookings/${order.id}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3 hover:bg-slate-100/70 hover:border-slate-200 transition text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 group-hover:text-secondary-700 transition flex items-center gap-1">
                    <span>{order.id}</span>
                    <ExternalLink className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 transition" />
                  </span>
                  <StatusBadge status={order.status} />
                </div>

                <div className="text-[11px] text-slate-600 truncate">
                  {t('toRecipient', {
                    recipient: order.recipient.name || t('defaultRecipient'),
                    address: order.dropoff.address.split(',')[0],
                  })}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
