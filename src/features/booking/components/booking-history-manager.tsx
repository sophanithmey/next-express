'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BookingOrder } from '../types/booking-types';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { SearchInput } from '@/components/molecules/search-input';
import { Button } from '@/components/atoms/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface BookingHistoryManagerProps {
  initialOrders: BookingOrder[];
  initialTotal: number;
  initialTotalPages: number;
}

export function BookingHistoryManager({
  initialOrders,
  initialTotal,
  initialTotalPages,
}: BookingHistoryManagerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<BookingOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (statusFilter !== 'all') params.set('status', statusFilter);
        params.set('page', String(page));
        params.set('limit', '10');

        const res = await fetch(`/api/bookings?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.items);
          setTotalPages(data.pagination.totalPages);
        }
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchOrders, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, page]);

  const handleRepeatBooking = (order: BookingOrder) => {
    router.push(`/bookings/new?repeat=${order.id}`);
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending Pickup' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'out_for_delivery', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Booking History
          </h1>
          <p className="text-xs text-slate-500">
            Track, search, and manage your delivery dispatch records
          </p>
        </div>

        <Link href="/bookings/new">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="h-4 w-4" />}
          >
            New Delivery
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors',
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <SearchInput
            placeholder="Search tracking, phone, or ref..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            onClear={() => {
              setSearch('');
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400">
          Loading bookings...
        </div>
      ) : (
        <BookingHistoryTable
          orders={orders}
          onRepeatBooking={handleRepeatBooking}
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

