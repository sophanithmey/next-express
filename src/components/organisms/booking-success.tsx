'use client';

import React, { useState } from 'react';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { Button } from '../atoms/button';
import { StatusBadge } from '../molecules/status-badge';
import { APP_CONFIG } from '@/lib/constants';
import { CheckCircle2, Copy, Check, Share2, Plus, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface BookingSuccessProps {
  order: BookingOrder;
  onBookAnother: () => void;
}

export function BookingSuccess({ order, onBookAnother }: BookingSuccessProps) {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedShareMsg, setCopiedShareMsg] = useState(false);

  const shareText = `Your parcel has been booked!\n\nTracking number: ${order.trackingNumber}\nTrack your delivery here: ${order.trackingUrl}`;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleShareMessage = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShareMsg(true);
    setTimeout(() => setCopiedShareMsg(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Delivery Successfully Booked!</h2>
        <p className="text-xs text-slate-500">
          Our express driver will arrive for pickup shortly. Share the tracking number with your buyer.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Tracking Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-lg font-bold text-slate-900">
                {order.trackingNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 transition"
              >
                {copiedTracking ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Recipient</span>
            <span className="font-semibold text-slate-900">{order.recipient.name}</span>
            <span className="text-slate-500 block">{order.recipient.phoneNumber}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Drop-off Destination</span>
            <span className="text-slate-700 line-clamp-2">{order.dropoff.address}</span>
          </div>

          <div>
            <span className="text-slate-400 block">Delivery Fee</span>
            <span className="font-bold text-slate-900">
              {APP_CONFIG.currencySymbol}
              {order.deliveryFee.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block">COD Collection</span>
            <span className="font-bold text-emerald-600">
              {order.cod.isCod
                ? `${APP_CONFIG.currencySymbol}${order.cod.amount.toFixed(2)}`
                : 'No COD'}
            </span>
          </div>
        </div>

        {/* Customer Share Box */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-900 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-brand-600" />
              <span>Customer Notification Message</span>
            </span>
            <button
              type="button"
              onClick={handleShareMessage}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              {copiedShareMsg ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedShareMsg ? 'Copied Message!' : 'Copy For Telegram/Messenger'}</span>
            </button>
          </div>
          <p className="rounded bg-white p-2.5 font-mono text-xs text-slate-700 border border-brand-100 whitespace-pre-line">
            {shareText}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBookAnother}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Book Another Delivery
        </Button>

        <Link href="/bookings">
          <Button
            type="button"
            variant="primary"
            size="md"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View in Booking History
          </Button>
        </Link>
      </div>
    </div>
  );
}
