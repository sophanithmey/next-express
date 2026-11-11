'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';

function mapStatusToStep(status: BookingOrder['status']): number {
  if (status === 'delivered') return 3;
  if (status === 'out_for_delivery') return 2;
  return 1;
}

/**
 * Manages live tracking state, status refresh, and derived display metadata for receivers.
 */
export function useLiveTracking(initialOrder: BookingOrder) {
  const tLive = useTranslations('LiveTracking');
  const tPayment = useTranslations('Payment');
  const locale = useLocale();

  const [order, setOrder] = useState<BookingOrder>(initialOrder);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `/api/bookings/${encodeURIComponent(order.trackingNumber)}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const latest: BookingOrder = await res.json();
        if (latest?.id) setOrder(latest);
      }
    } catch {
      // Keep current visible tracking state if transient fetch fails
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, order.trackingNumber]);

  const isCancelled = order.status === 'cancelled';
  const activeStep = mapStatusToStep(order.status);
  const isCourierAssigned =
    order.status === 'assigned' ||
    order.status === 'out_for_delivery' ||
    order.status === 'delivered';

  const courierName = order.deliverer?.name
    ? `${order.deliverer.name} • Wing Express`
    : tLive('courierAssigned');
  const courierVehicle = order.deliverer?.plateNumber || tLive('courierVehicle');
  const courierPhone = order.deliverer?.phone || APP_CONFIG.supportPhone;

  const etaLabel =
    order.status === 'delivered'
      ? tPayment('stepDelivered')
      : order.deliveryOption === 'same_day'
      ? tPayment('etaSameDay')
      : order.deliveryOption === 'scheduled'
      ? tPayment('etaScheduled')
      : tPayment('etaInstant');

  const destinationStops: DropoffStop[] = useMemo(() => {
    if (order.dropoffs && order.dropoffs.length > 0) return order.dropoffs;
    return [{ id: 'stop-1', recipient: order.recipient, dropoff: order.dropoff }];
  }, [order.dropoffs, order.recipient, order.dropoff]);

  const formattedUpdatedAt = useMemo(() => {
    try {
      const target = order.updatedAt || order.createdAt;
      return new Intl.DateTimeFormat(locale === 'km' ? 'km-KH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(target));
    } catch {
      return '';
    }
  }, [order.updatedAt, order.createdAt, locale]);

  return {
    order,
    isRefreshing,
    activeStep,
    isCancelled,
    isCourierAssigned,
    courierName,
    courierVehicle,
    courierPhone,
    etaLabel,
    destinationStops,
    formattedUpdatedAt,
    handleRefresh,
  };
}
