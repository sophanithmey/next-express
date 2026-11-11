'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { createPrefillFromOrder } from '../services/booking-form-helpers';
import { saveBookingDraft } from '../services/booking-draft-service';
import { buildTrackingSharePayload } from '../services/tracking-share-helper';

function deriveStatsFromOrders(orders: BookingOrder[]): DashboardStatistics {
  const today = new Date().toISOString().slice(0, 10);
  let todayBookings = 0;
  let pendingPickup = 0;
  let inTransit = 0;
  let delivered = 0;
  let codCollection = 0;

  for (const order of orders) {
    if (order.createdAt.slice(0, 10) === today && order.status !== 'draft') todayBookings += 1;
    if (order.status === 'pending' || order.status === 'confirmed') pendingPickup += 1;
    if (order.status === 'assigned' || order.status === 'out_for_delivery') inTransit += 1;
    if (order.status === 'delivered') delivered += 1;
    if (order.cod.isCod && order.status !== 'cancelled' && order.status !== 'draft') {
      codCollection += order.cod.amount;
    }
  }

  return {
    todayBookings,
    pendingPickup,
    inTransit,
    delivered,
    codCollection: Math.round(codCollection * 100) / 100,
  };
}

interface UseBookingHistoryProps {
  initialOrders: BookingOrder[];
  initialTotal: number;
  initialTotalPages: number;
  initialStats?: DashboardStatistics;
}

export interface CopiedState {
  id: string;
  type: 'id' | 'link';
}

/**
 * Manages booking operations filtering, debounced search, pagination, clipboard copy feedback,
 * and quick actions for the booking history dashboard.
 */
export function useBookingHistory({
  initialOrders,
  initialTotal,
  initialTotalPages,
  initialStats,
}: UseBookingHistoryProps) {
  const router = useRouter();
  const locale = useLocale();
  const tCommon = useTranslations('Common');
  const tPayment = useTranslations('Payment');
  const { isAuthenticated, openAuthModal } = useAuthState();
  const isFirstRender = useRef(true);
  const wasAuthenticatedRef = useRef(isAuthenticated);

  const [orders, setOrders] = useState<BookingOrder[]>(initialOrders);
  const [stats, setStats] = useState<DashboardStatistics | undefined>(initialStats);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedItem, setCopiedItem] = useState<CopiedState | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await fetch(`/api/bookings?${params.toString()}`, {
        headers: { 'Accept-Language': locale.toUpperCase() },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const nextOrders: BookingOrder[] = data.items || [];
        setOrders(nextOrders);
        setTotalCount(data.pagination?.total ?? nextOrders.length ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
        if (statusFilter === 'all' && !search.trim() && page === 1) {
          setStats(deriveStatsFromOrders(nextOrders));
        }
      }
    } catch {
      // Keep current visible orders if transient network error occurs
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, locale]);

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticatedRef.current) {
      void fetchOrders();
    }
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, fetchOrders]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const handleFilterChange = useCallback((nextStatus: string) => {
    setStatusFilter(nextStatus);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
  }, []);

  const handleCopyTrackingId = useCallback(
    async (order: BookingOrder) => {
      await navigator.clipboard.writeText(order.trackingNumber);
      setCopiedItem({ id: order.id, type: 'id' });
      toast.success(`${tCommon('copied')}: ${order.trackingNumber}`);
      setTimeout(() => setCopiedItem(null), 2000);
    },
    [tCommon]
  );

  const handleCopyLiveLink = useCallback(
    async (order: BookingOrder) => {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : '';
      const { fullTrackingUrl } = buildTrackingSharePayload({
        tracking: order.trackingNumber,
        locale,
        origin,
        recipient: order.recipient.name || 'Recipient',
        dropoff: order.dropoff.address,
        codAmount: order.cod?.isCod ? order.cod.amount : 0,
      });
      await navigator.clipboard.writeText(fullTrackingUrl);
      setCopiedItem({ id: order.id, type: 'link' });
      toast.success(tPayment('linkCopied'));
      setTimeout(() => setCopiedItem(null), 2000);
    },
    [locale, tPayment]
  );

  const handleRepeatBooking = useCallback(
    (order: BookingOrder) => {
      const draft = createPrefillFromOrder(order);
      saveBookingDraft(draft);
      router.push('/booking');
    },
    [router]
  );

  const handleNavigateDetail = useCallback(
    (orderId: string) => {
      router.push(`/bookings/${orderId}`);
    },
    [router]
  );

  return {
    orders,
    stats,
    totalCount,
    search,
    statusFilter,
    page,
    totalPages,
    isLoading,
    isAuthenticated,
    openAuthModal,
    copiedItem,
    setPage,
    handleFilterChange,
    handleSearchChange,
    handleClearFilters,
    handleRefresh: () => void fetchOrders(),
    handleCopyTrackingId,
    handleCopyLiveLink,
    handleRepeatBooking,
    handleNavigateDetail,
  };
}

