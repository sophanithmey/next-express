'use client';

import { useState, useEffect } from 'react';
import { BookingViewMode } from '../components/booking-history-toolbar';

const VIEW_MODE_STORAGE_KEY = 'wing_booking_view_mode';

export function useBookingViewMode(defaultMode: BookingViewMode = 'compact') {
  const [viewMode, setViewMode] = useState<BookingViewMode>(defaultMode);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY) as BookingViewMode;
      if (saved === 'table' || saved === 'compact') {
        setViewMode(saved);
      }
    } catch {
      // LocalStorage access may be restricted
    }
  }, []);

  const handleViewModeChange = (mode: BookingViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  };

  return {
    viewMode,
    handleViewModeChange,
  };
}
