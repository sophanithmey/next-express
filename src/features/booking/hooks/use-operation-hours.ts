'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getDefaultAvailableShift,
  getDefaultScheduleDay,
  isInstantDeliveryAvailable,
  isScheduleTodayAvailable,
} from '../services/operation-hours-service';

/**
 * Tracks current local time (updated every 30s) and derives live operation-hours availability
 * for Instant (6:00 AM – 9:30 PM) and Schedule delivery (today cutoff at 7:30 PM, up to 2 days ahead).
 */
export function useOperationHours() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    const isInstantAvailable = isInstantDeliveryAvailable(now);
    const isTodayScheduleAvailable = isScheduleTodayAvailable(now);
    const defaultScheduleDay = getDefaultScheduleDay(now);
    const defaultShift = getDefaultAvailableShift(defaultScheduleDay, now);

    return {
      now,
      isInstantAvailable,
      isTodayScheduleAvailable,
      defaultScheduleDay,
      defaultShift,
    };
  }, [now]);
}
