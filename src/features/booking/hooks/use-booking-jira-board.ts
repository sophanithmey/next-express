'use client';

import { useState, useMemo } from 'react';
import { BookingOrder } from '../types/booking-types';

interface UseBookingJiraBoardProps {
  orders: BookingOrder[];
}

export function useBookingJiraBoard({ orders }: UseBookingJiraBoardProps) {
  const [isDark, setIsDark] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);

  // Partition orders by the 5 operational lifecycle statuses
  const columnsData = useMemo(() => {
    const pending: BookingOrder[] = [];
    const accepted: BookingOrder[] = [];
    const inTransit: BookingOrder[] = [];
    const fulfilled: BookingOrder[] = [];
    const cancelled: BookingOrder[] = [];

    for (const order of orders) {
      if (
        order.status === 'draft' ||
        order.status === 'pending' ||
        order.status === 'confirmed'
      ) {
        pending.push(order);
      } else if (order.status === 'assigned') {
        accepted.push(order);
      } else if (order.status === 'out_for_delivery') {
        inTransit.push(order);
      } else if (order.status === 'delivered') {
        fulfilled.push(order);
      } else if (order.status === 'cancelled') {
        cancelled.push(order);
      }
    }

    return { pending, accepted, inTransit, fulfilled, cancelled };
  }, [orders]);

  const handleCardClick = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId);
    if (found) {
      setSelectedOrder(found);
    }
  };

  const handleCloseModal = () => setSelectedOrder(null);
  const toggleDark = () => setIsDark((prev) => !prev);

  return {
    isDark,
    toggleDark,
    selectedOrder,
    columnsData,
    handleCardClick,
    handleCloseModal,
  };
}
