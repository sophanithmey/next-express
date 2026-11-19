'use client';

import React from 'react';
import { Bike, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface DelivererInfo {
  name: string;
  phone: string;
}

interface BookingJiraCourierCardProps {
  deliverer?: DelivererInfo | null;
}

export function BookingJiraCourierCard({ deliverer }: BookingJiraCourierCardProps) {
  const tDetails = useTranslations('BookingDetails');

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2 shadow-2xs">
      <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
        {tDetails('courierCardLabel')}
      </span>

      {deliverer ? (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-950 border border-primary-300 font-bold">
              <Bike className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xs">
                {deliverer.name}
              </p>
              <p className="font-mono text-[11px] text-slate-500">
                {deliverer.phone}
              </p>
            </div>
          </div>

          <a
            href={`tel:${deliverer.phone.replace(/\s+/g, '')}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
            title="Call driver"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : (
        <div className="flex items-center gap-2 py-1 text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-xs font-medium">
            {tDetails('matchingRider')}
          </span>
        </div>
      )}
    </div>
  );
}
