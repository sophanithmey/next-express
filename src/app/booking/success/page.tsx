'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Copy,
  Check,
  Plus,
  ArrowRight,
  MapPin,
  Navigation,
  User,
  DollarSign,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/atoms/button';
import { PublicHeader } from '@/components/organisms/public-header';

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'REF-84920';
  const tracking = searchParams.get('tracking') || 'EXP-88239012';
  const pickup = searchParams.get('pickup') || 'Central Warehouse (Main)';
  const dropoff = searchParams.get('dropoff') || 'BKK1, Khan Boeng Keng Kang, Phnom Penh';
  const recipient = searchParams.get('recipient') || 'Sokha Chan';
  const cod = searchParams.get('cod') || '0';
  const stops = searchParams.get('stops') || '1';

  const [copied, setCopied] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  const shareText = `Delivery Confirmed!\nTracking No: ${tracking}\nRecipient: ${recipient}\nDestination: ${dropoff}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(tracking);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl py-8 px-4 sm:px-6 space-y-6">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Booking Confirmed</h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Courier has been dispatched. Share tracking number with your recipient.
        </p>
      </div>

      {/* Main Confirmation Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Tracking & Ref Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Tracking Number
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-lg font-bold text-slate-900">{tracking}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Booking Ref
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">{ref}</span>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-400 block font-medium">Pickup Point</span>
              <p className="font-semibold text-slate-900 truncate">{pickup}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Navigation className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 block font-medium">Drop-off Destination</span>
                {parseInt(stops) > 1 && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    {stops} Stops (Multi-Drop)
                  </span>
                )}
              </div>
              <p className="font-semibold text-slate-900 truncate mt-0.5">{dropoff}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Recipient</span>
              <p className="font-semibold text-slate-900">{recipient}</p>
            </div>
          </div>
        </div>

        {/* COD Info */}
        {parseFloat(cod) > 0 && (
          <div className="rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="font-medium">Cash on Delivery (COD):</span>
            </div>
            <span className="font-bold font-mono text-sm">${parseFloat(cod).toFixed(2)}</span>
          </div>
        )}

        {/* Customer Notification Box */}
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-brand-900 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-brand-600" />
              <span>Share with Buyer</span>
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              {copiedMsg ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copiedMsg ? 'Message Copied!' : 'Copy Text'}</span>
            </button>
          </div>
          <p className="font-mono text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-brand-100 whitespace-pre-line leading-relaxed">
            {shareText}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="md"
            className="w-full"
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Book Another Delivery
          </Button>
        </Link>

        <Link href="/bookings" className="w-full sm:w-auto">
          <Button
            type="button"
            variant="primary"
            size="md"
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View in Booking History
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PublicHeader />
      <main className="flex-1">
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading booking status…</div>}>
          <BookingSuccessContent />
        </Suspense>
      </main>
    </div>
  );
}

