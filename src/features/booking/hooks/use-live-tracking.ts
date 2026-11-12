'use client';

import { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { BookingOrder, DropoffStop } from '../types/booking-types';
import { APP_CONFIG } from '@/lib/constants';
import { bookingApiService } from '../services/booking-api-service';
import { localDemoBookingStore } from '../services/local-demo-store';
import { isLocalDemoStorageEnabled } from '@/lib/local-demo-storage';
import { scopeOrderToStop } from '../services/tracking-share-helper';
import { bookingKeys } from './booking-keys';

function mapStatusToStep(status: BookingOrder['status']): number {
  if (status === 'delivered') return 3;
  if (status === 'out_for_delivery') return 2;
  return 1;
}

/**
 * Manages live tracking state, status refresh, and derived display metadata for receivers.
 */
export function useLiveTracking(initialOrder: BookingOrder, scopedStopId?: string) {
  const tLive = useTranslations('LiveTracking');
  const tPayment = useTranslations('Payment');
  const locale = useLocale();
  const localDemoMode = isLocalDemoStorageEnabled();

  const targetId = initialOrder.trackingNumber || initialOrder.id;
  const trackingQuery = useQuery({
    queryKey: [...bookingKeys.detail(targetId), locale, 'tracking'],
    queryFn: async ({ signal }) => {
      if (localDemoMode) {
        return localDemoBookingStore.getOrderById(targetId) ?? initialOrder;
      }
      return bookingApiService.getBookingById(targetId, locale, signal);
    },
    initialData: initialOrder,
    staleTime: localDemoMode ? 0 : 15_000,
    refetchOnMount: localDemoMode ? 'always' : true,
    refetchOnWindowFocus: false,
  });

  const order = useMemo(
    () => scopeOrderToStop(trackingQuery.data ?? initialOrder, scopedStopId),
    [trackingQuery.data, initialOrder, scopedStopId]
  );
  const isRefreshing = trackingQuery.isFetching;

  const handleRefresh = useCallback(async () => {
    if (!targetId || trackingQuery.isFetching) return;
    await trackingQuery.refetch();
  }, [targetId, trackingQuery]);

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
