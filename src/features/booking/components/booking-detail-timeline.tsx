'use client';

import React from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  XCircle,
} from 'lucide-react';
import { BookingOrder, TimelineEvent } from '../types/booking-types';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';

interface BookingDetailTimelineProps {
  order: BookingOrder;
  timelineEvents: TimelineEvent[];
  showFullLog: boolean;
  onToggleLog: () => void;
}

export function BookingDetailTimeline({
  order,
  timelineEvents,
  showFullLog,
  onToggleLog,
}: BookingDetailTimelineProps) {
  const tDetails = useTranslations('BookingDetails');
  const isCancelled = order.status === 'cancelled';

  const completedCount = timelineEvents.filter((e) => e.completed).length;
  const currentIndex = timelineEvents.findIndex((e) => e.current);
  const progressSteps = Math.max(
    0,
    currentIndex >= 0 ? currentIndex : Math.max(0, completedCount - 1)
  );
  const progressPct =
    timelineEvents.length > 1
      ? Math.min(100, (progressSteps / (timelineEvents.length - 1)) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="h-4 w-4 text-secondary-600" />
          <span>{tDetails('liveProgressTitle')}</span>
        </h3>

        <button
          type="button"
          onClick={onToggleLog}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
        >
          <span>{showFullLog ? tDetails('hideLog') : tDetails('viewActivityLog')}</span>
          {showFullLog ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {isCancelled ? (
        <div className="rounded-xl border border-danger-200 bg-danger-50/80 p-3.5 text-xs text-danger-800 flex items-start gap-2.5">
          <XCircle className="h-4 w-4 text-danger-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-danger-900">{tDetails('bookingCancelled')}</p>
            <p className="text-danger-700">
              {order.cancellationReason || tDetails('cancelledBeforeDispatch')}
            </p>
            {order.cancelledAt && (
              <p className="font-mono text-danger-600/80">
                {order.cancelledAt}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative overflow-x-auto pb-1">
          <div className="relative min-w-96 grid grid-cols-6 gap-2 pt-1">
            {/* Horizontal connecting line */}
            <div
              aria-hidden="true"
              className="absolute top-4 inset-x-0 mx-auto h-0.5 w-5/6 bg-slate-200"
            >
              <div
                className="h-full bg-success-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {timelineEvents.map((evt, idx) => (
              <div
                key={`${evt.status}-${idx}`}
                className="relative z-10 flex flex-col items-center text-center gap-1.5"
              >
                <div
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all',
                    evt.completed && !evt.current
                      ? 'border-success-500 bg-success-500 text-white'
                      : evt.current
                      ? 'border-secondary-600 bg-white text-secondary-700 ring-4 ring-secondary-100'
                      : 'border-slate-200 bg-white text-slate-300'
                  )}
                >
                  {evt.completed && !evt.current ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : evt.current ? (
                    <CircleDot className="h-3.5 w-3.5 animate-pulse" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs leading-tight',
                    evt.current
                      ? 'font-bold text-secondary-900'
                      : evt.completed
                      ? 'font-semibold text-slate-700'
                      : 'font-medium text-slate-400'
                  )}
                >
                  {evt.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expandable Chronological Activity Log */}
      {showFullLog && (
        <div className="border-t border-slate-100 pt-4 relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-5 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timelineEvents.map((evt, idx) => (
            <div key={`log-${evt.status}-${idx}`} className="relative text-xs">
              <span
                className={cn(
                  'absolute -left-5 top-1 h-3 w-3 rounded-full border-2',
                  evt.current
                    ? 'border-secondary-600 bg-white'
                    : evt.completed
                    ? 'border-success-500 bg-success-500'
                    : 'border-slate-300 bg-white'
                )}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-800">{evt.title}</span>
                <span className="font-mono text-xs text-slate-400">
                  {evt.timestamp}
                </span>
              </div>
              {evt.description && (
                <p className="text-slate-500 mt-0.5">{evt.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
