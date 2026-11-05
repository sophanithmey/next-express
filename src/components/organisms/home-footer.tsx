import React from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';

export function HomeFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Truck className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">Express Seller</span>
          <span className="text-xs text-slate-400">| Wing Delivery Network</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <Link href="/login" className="hover:text-slate-800 transition">
            Merchant Sign In
          </Link>
          <Link href="/bookings/new" className="hover:text-slate-800 transition">
            Book Express
          </Link>
          <span>&copy; {new Date().getFullYear()} Express Seller Platform. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

