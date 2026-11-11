'use client';

import React from 'react';
import { BookingOrder } from '../types/booking-types';
import { useLiveTracking } from '../hooks/use-live-tracking';
import { LiveTrackingMapHero } from './live-tracking-map-hero';
import { LiveTrackingRouteCard } from './live-tracking-route-card';
import { LiveTrackingSidebar } from './live-tracking-sidebar';

interface LiveTrackingViewProps {
  order: BookingOrder;
}

/**
 * Receiver-focused live tracking layout with a prominent interactive Google Map
 * hero at the top followed by compact route milestones, courier contact, and COD details.
 */
export function LiveTrackingView({
  order: initialOrder,
}: LiveTrackingViewProps) {
  const {
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
  } = useLiveTracking(initialOrder);

  return (
    <div className='mx-auto max-w-7xl w-full py-6 sm:py-8 space-y-6'>
      <LiveTrackingMapHero
        order={order}
        isCancelled={isCancelled}
        isRefreshing={isRefreshing}
        formattedUpdatedAt={formattedUpdatedAt}
        onRefresh={handleRefresh}
      />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12 items-start'>
        <div className='lg:col-span-7 xl:col-span-8'>
          <LiveTrackingRouteCard
            order={order}
            activeStep={activeStep}
            etaLabel={etaLabel}
            isCancelled={isCancelled}
            destinationStops={destinationStops}
          />
        </div>

        <div className='lg:col-span-5 xl:col-span-4'>
          <LiveTrackingSidebar
            order={order}
            isCourierAssigned={isCourierAssigned}
            courierName={courierName}
            courierVehicle={courierVehicle}
            courierPhone={courierPhone}
          />
        </div>
      </div>
    </div>
  );
}
