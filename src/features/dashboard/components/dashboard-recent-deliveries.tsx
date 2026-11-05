'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingOrder } from '@/features/booking/types/booking-types';
import { BookingHistoryTable } from '@/components/organisms/booking-history-table';
import { SearchInput } from '@/components/molecules/search-input';
import { cn } from '@/lib/cn';

interface DashboardRecentDeliveriesProps {
  initialOrders: BookingOrder[];
}

export function DashboardRecentDeliveries({
  initialOrders,
}: DashboardRecentDeliveriesProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<BookingOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.trackingNumber.toLowerCase().includes(q) ||
      order.recipient.name.toLowerCase().includes(q) ||
      order.recipient.phoneNumber.includes(q) ||
      (order.parcel.sellerOrderRef &&
        order.parcel.sellerOrderRef.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const handleRepeatBooking = (order: BookingOrder) => {
    router.push(`/bookings/new?repeat=${order.id}`);
  };

  const statusTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'out_for_delivery', label: 'In Transit' },
    { id: 'delivered', label: 'Delivered' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
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

        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search tracking, phone, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>
      </div>

      <BookingHistoryTable
        orders={filteredOrders}
        onRepeatBooking={handleRepeatBooking}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
      />
    </div>
  );
}

