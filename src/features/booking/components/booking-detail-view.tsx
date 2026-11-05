'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingOrder } from '../types/booking-types';
import { StatusBadge } from '@/components/molecules/status-badge';
import { Button } from '@/components/atoms/button';
import { PriceRow } from '@/components/molecules/price-row';
import { APP_CONFIG } from '@/lib/constants';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Repeat,
  MapPin,
  User,
  Package,
  Banknote,
  Bike,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DeliveryMap = dynamic(
  () => import('@/components/organisms/delivery-map').then((m) => m.DeliveryMap),
  { ssr: false }
);

interface BookingDetailViewProps {
  order: BookingOrder;
}

export function BookingDetailView({ order }: BookingDetailViewProps) {
  const router = useRouter();
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const shareText = `Your parcel has been booked!\n\nTracking number: ${order.trackingNumber}\nTrack your delivery here: ${order.trackingUrl}`;

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleRepeatBooking = () => {
    router.push(`/bookings/new?repeat=${order.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-slate-900">
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
            <p className="text-xs text-slate-500">
              Booked on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={copiedShare ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
          >
            {copiedShare ? 'Copied Message!' : 'Share Tracking'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRepeatBooking}
            leftIcon={<Repeat className="h-3.5 w-3.5" />}
          >
            Book Again
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Route Map & Locations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand-600" />
                <span>Delivery Route & Status</span>
              </h3>
              <StatusBadge status={order.status} />
            </div>

            <DeliveryMap
              pickupCoords={order.pickup.coordinates}
              dropoffCoords={order.dropoff.coordinates}
              isDraggableDropoff={false}
              className="h-64 w-full"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="font-semibold text-brand-700 block mb-1">
                  Pickup Point (P)
                </span>
                <p className="font-bold text-slate-900">{order.pickup.name}</p>
                <p className="text-slate-600 mt-0.5">{order.pickup.address}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="font-semibold text-rose-700 block mb-1">
                  Drop-off Destination (D)
                </span>
                <p className="font-bold text-slate-900">{order.recipient.name}</p>
                <p className="text-slate-600 mt-0.5">{order.dropoff.address}</p>
                {order.dropoff.landmark && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    Landmark: {order.dropoff.landmark}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deliverer / Driver Info if assigned */}
          {order.deliverer && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Bike className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block">
                    Assigned Express Courier
                  </span>
                  <p className="text-sm font-bold text-slate-900">{order.deliverer.name}</p>
                  <p className="text-xs text-slate-500">Contact: {order.deliverer.phone}</p>
                </div>
              </div>
              {order.deliverer.plateNumber && (
                <div className="rounded bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-700 border border-brand-200">
                  {order.deliverer.plateNumber}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recipient & Pricing Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-brand-600" />
              <span>Recipient Details</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-semibold text-slate-900">{order.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-semibold text-slate-900">{order.recipient.phoneNumber}</span>
              </div>
              {order.recipient.notes && (
                <div className="pt-2 border-t border-slate-100 text-slate-600">
                  <span className="font-medium">Instructions: </span>
                  {order.recipient.notes}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Package className="h-4 w-4 text-brand-600" />
              <span>Parcel Details</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Order Ref:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {order.parcel.sellerOrderRef || 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="font-semibold text-slate-900">{order.parcel.quantity || 1}</span>
              </div>
              {order.parcel.description && (
                <div className="text-slate-600">
                  <span className="font-medium">Description: </span>
                  {order.parcel.description}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Banknote className="h-4 w-4 text-brand-600" />
              <span>Payment & Charges</span>
            </h3>
            <div className="space-y-1">
              <PriceRow label="Delivery Fee" amount={order.deliveryFee} />
              <PriceRow
                label="Total Delivery Charge"
                amount={order.deliveryFee}
                isTotal
              />
              {order.cod.isCod && (
                <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs border border-emerald-200 flex justify-between items-center text-emerald-900">
                  <span className="font-medium">COD To Collect From Buyer:</span>
                  <span className="font-bold text-base">
                    {APP_CONFIG.currencySymbol}
                    {order.cod.amount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
