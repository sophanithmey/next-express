'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BookingOrder, DropoffStop } from '@/features/booking/types/booking-types';
import { BookingDetailTimeline } from '@/features/booking/components/booking-detail-timeline';
import { BookingDetailRoute } from '@/features/booking/components/booking-detail-route';
import { BookingDetailParcel } from '@/features/booking/components/booking-detail-parcel';
import { BookingJiraModalSidebar } from '../molecules/booking-jira-modal-sidebar';
import { StatusBadge } from '../molecules/status-badge';
import { buildDefaultTimeline, formatOrderTimestamp } from '@/features/booking/services/booking-detail-helpers';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';

interface BookingJiraDetailModalProps {
  order: BookingOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onBookAgain?: (order: BookingOrder) => void;
}

/**
 * Large, Jira-style modal for inspecting delivery booking details directly on the Kanban board.
 */
export function BookingJiraDetailModal({
  order,
  isOpen,
  onClose,
  onBookAgain,
}: BookingJiraDetailModalProps) {
  const [showMap, setShowMap] = useState(true);
  const [showFullLog, setShowFullLog] = useState(false);
  const [isCopiedId, setIsCopiedId] = useState(false);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const timelineEvents = useMemo(() => {
    if (!order) return [];
    return order.timeline?.length ? order.timeline : buildDefaultTimeline(order);
  }, [order]);

  const destinationStops: DropoffStop[] = useMemo(() => {
    if (!order) return [];
    return order.dropoffs?.length
      ? order.dropoffs
      : [{ id: 'stop-1', recipient: order.recipient, dropoff: order.dropoff }];
  }, [order]);

  if (!isOpen || !order) return null;

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(order.trackingNumber);
    setIsCopiedId(true);
    toast.success(`Copied: ${order.trackingNumber}`);
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl xl:max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Jira-Style Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 sm:px-6 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-mono font-bold text-xs text-primary-950 bg-primary-50 border border-primary-300 px-2 py-0.5 rounded-md">
              [EXP] {order.trackingNumber}
            </span>

            <button
              type="button"
              onClick={handleCopyId}
              title="Copy Tracking ID"
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              {isCopiedId ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>

            <StatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/bookings/${order.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
              title="Open full page"
            >
              <span className="hidden sm:inline">Open in full page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Jira Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Headline Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {order.parcel.description || order.parcel.sellerOrderRef || 'Express Courier Dispatch'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Created {formatOrderTimestamp(order.createdAt)} · Pickup from {order.pickup.name || 'Warehouse'}
            </p>
          </div>

          {/* 2-Column Main Layout: Details Left + Sidebar Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              <BookingDetailTimeline
                order={order}
                timelineEvents={timelineEvents}
                showFullLog={showFullLog}
                onToggleLog={() => setShowFullLog((prev) => !prev)}
              />

              <BookingDetailRoute
                order={order}
                destinationStops={destinationStops}
                showMap={showMap}
                onToggleMap={() => setShowMap((prev) => !prev)}
              />

              <BookingDetailParcel order={order} />
            </div>

            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-0">
              <BookingJiraModalSidebar
                order={order}
                onBookAgain={onBookAgain}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
