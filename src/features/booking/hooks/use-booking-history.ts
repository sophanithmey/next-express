'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isLocalDemoStorageEnabled } from '@/lib/local-demo-storage';
import { BookingOrder, DashboardStatistics } from '../types/booking-types';
import { useAuthState } from '@/features/auth/hooks/use-auth-state';
import { createPrefillFromOrder } from '../services/booking-form-helpers';
import { saveBookingDraft } from '../services/booking-draft-service';
import { buildTrackingSharePayload } from '../services/tracking-share-helper';
import { buildOrderStatusFilter } from '../services/booking-order-filter';
import { BookingDatePreset, isOrderInDatePreset } from '../services/booking-date-filter';
import { bookingApiService } from '../services/booking-api-service';
import { localDemoBookingStore } from '../services/local-demo-store';
import { bookingKeys } from './booking-keys';

function deriveStatsFromOrders(orders: BookingOrder[]): DashboardStatistics {
  let todayBookings = 0;
  let pendingPickup = 0;
  let accepted = 0;
  let inTransit = 0;
  let delivered = 0;
  let codCollection = 0;

  for (const order of orders) {
    if (isOrderInDatePreset(order.createdAt, 'today') && order.status !== 'draft') todayBookings += 1;
    if (order.status === 'pending' || order.status === 'draft' || order.status === 'confirmed') pendingPickup += 1;
    if (order.status === 'assigned') accepted += 1;
    if (order.status === 'out_for_delivery') inTransit += 1;
    if (order.status === 'delivered') delivered += 1;
    if (order.cod.isCod && order.status !== 'cancelled' && order.status !== 'draft') {
      codCollection += order.cod.amount;
    }
  }

  return {
    todayBookings,
    pendingPickup,
    accepted,
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
  rpp?: number;
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
  rpp = 10,
}: UseBookingHistoryProps) {
  const router = useRouter();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const tCommon = useTranslations('Common');
  const tHistory = useTranslations('BookingHistory');
  const tPayment = useTranslations('Payment');
  const localDemoMode = isLocalDemoStorageEnabled();
  const { isAuthenticated, openAuthModal } = useAuthState();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [datePreset, setDatePreset] = useState<BookingDatePreset>('today');
  const [page, setPage] = useState(1);
  const [copiedItem, setCopiedItem] = useState<CopiedState | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const activeFilter = useMemo(
    () => buildOrderStatusFilter(statusFilter),
    [statusFilter],
  );

  const isDefaultUnfilteredPage =
    page === 1 && !debouncedSearch && statusFilter === 'all' && datePreset === 'today';

  const bookingsQuery = useQuery({
    queryKey: [
      ...bookingKeys.list({
        page,
        rpp,
        search: debouncedSearch || undefined,
        status: statusFilter,
        datePreset,
        filter: activeFilter,
      }),
      locale,
      isAuthenticated ? 'auth' : 'guest',
    ],
    queryFn: ({ signal }) =>
      bookingApiService.listBookings(
        {
          page,
          rpp,
          search: debouncedSearch || undefined,
          datePreset,
          filter: activeFilter,
          locale,
        },
        signal,
      ),
    initialData:
      !localDemoMode && isDefaultUnfilteredPage
        ? {
            items: initialOrders,
            pagination: {
              page: 1,
              limit: rpp,
              total: initialTotal,
              totalPages: initialTotalPages,
            },
          }
        : undefined,
    placeholderData: keepPreviousData,
    staleTime: localDemoMode ? 0 : 15_000,
    refetchOnMount: localDemoMode ? 'always' : true,
  });

  const orders = bookingsQuery.data?.items ?? initialOrders;
  const totalCount = bookingsQuery.data?.pagination?.total ?? orders.length ?? 0;
  const totalPages = bookingsQuery.data?.pagination?.totalPages ?? 1;
  const isLoading = bookingsQuery.isFetching;

  const stats = useMemo<DashboardStatistics | undefined>(() => {
    if (localDemoMode && bookingsQuery.data) {
      return deriveStatsFromOrders(
        localDemoBookingStore.listOrders({ page: 1, rpp: 1000 }).items,
      );
    }
    if (isDefaultUnfilteredPage && bookingsQuery.data?.items) {
      return deriveStatsFromOrders(bookingsQuery.data.items);
    }
    return initialStats;
  }, [bookingsQuery.data, initialStats, isDefaultUnfilteredPage, localDemoMode]);

  const handleFilterChange = useCallback((nextStatus: string) => {
    setStatusFilter(nextStatus);
    setPage(1);
  }, []);

  const handleDatePresetChange = useCallback((preset: BookingDatePreset) => {
    setDatePreset(preset);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setDatePreset('today');
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

  const handleResetDemoData = useCallback(async () => {
    localDemoBookingStore.resetAllDemoData();
    setSearch('');
    setDebouncedSearch('');
    setStatusFilter('all');
    setPage(1);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['payments'] }),
    ]);
    toast.success(tHistory('demoResetSuccess'));
  }, [queryClient, tHistory]);

  return {
    orders,
    stats,
    totalCount,
    search,
    statusFilter,
    datePreset,
    page,
    totalPages,
    isLoading,
    isLocalDemoMode: localDemoMode,
    isAuthenticated,
    openAuthModal,
    copiedItem,
    setPage,
    handleFilterChange,
    handleDatePresetChange,
    handleSearchChange,
    handleClearFilters,
    handleRefresh: () => void bookingsQuery.refetch(),
    handleResetDemoData,
    handleCopyTrackingId,
    handleCopyLiveLink,
    handleRepeatBooking,
    handleNavigateDetail,
  };
}

