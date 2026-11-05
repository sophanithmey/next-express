'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecipientRecord } from '@/features/booking/types/booking-types';
import { SearchInput } from '@/components/molecules/search-input';
import { Button } from '@/components/atoms/button';
import { EmptyState } from '@/components/molecules/empty-state';
import { Users, Phone, MapPin, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RecipientsManagerProps {
  initialRecipients: RecipientRecord[];
}

export function RecipientsManager({ initialRecipients }: RecipientsManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = initialRecipients.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.phoneNumber.replace(/[^\d]/g, '').includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Saved Recipients & Customers
          </h1>
          <p className="text-xs text-slate-500">
            Quickly book deliveries for frequent buyers and repeat customer addresses
          </p>
        </div>

        <Link href="/bookings/new">
          <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
            New Delivery
          </Button>
        </Link>
      </div>

      <div className="w-full sm:w-72">
        <SearchInput
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No recipients found"
          description="Recipients are automatically saved whenever you complete a delivery booking."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">{r.name}</h3>
                  <span className="text-[10px] text-slate-400">
                    {new Date(r.lastUsedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{r.phoneNumber}</span>
                </div>

                {r.lastAddress && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{r.lastAddress}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  href={`/bookings/new`}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  <span>Book Delivery</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

