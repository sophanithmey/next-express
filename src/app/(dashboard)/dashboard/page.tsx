import React from 'react';
import Link from 'next/link';
import { expressApiClient } from '@/server/api/express-api-client';
import { sessionService } from '@/server/auth/session-service';
import { DashboardStats } from '@/components/organisms/dashboard-stats';
import { Button } from '@/components/atoms/button';
import { PlusCircle, ArrowRight, Package } from 'lucide-react';
import { DashboardRecentDeliveries } from '@/features/dashboard/components/dashboard-recent-deliveries';

export default async function DashboardPage() {
  const session = await sessionService.getSession();
  const stats = await expressApiClient.getDashboardStatistics();
  const recentOrders = await expressApiClient.getBookings(
    { page: 1, limit: 6 },
    session?.accessToken
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-brand-100 bg-white p-6 shadow-2xs">
        <div>
          <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider block">
            Seller Dispatch Operations
          </span>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {session?.user.shopName || session?.user.name || 'Merchant'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Here is your live delivery overview and COD collections for today
          </p>
        </div>

        <div className="flex items-center gap-3">
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
      </div>

      {/* Key Metrics */}
      <DashboardStats stats={stats} />

      {/* Recent Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Deliveries</h2>
          </div>
          <Link
            href="/bookings"
            className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition"
          >
            <span>View All History</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <DashboardRecentDeliveries initialOrders={recentOrders.items} />
      </div>
    </div>
  );
}

