import Link from 'next/link';
import './globals.css';
import { Button } from '@/components/atoms/button';
import {
  PackageSearch,
  Truck,
  ArrowRight,
  Headphones,
  PhoneCall,
  MapPinOff,
} from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

export default function RootNotFound() {
  return (
    <html lang="km">
      <body className="min-h-screen bg-slate-50 antialiased flex flex-col font-sans">
        <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-xl shadow-slate-200/50 sm:p-10">
            {/* Subtle decorative background circles */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-primary-100/40 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-secondary-100/40 blur-2xl"
            />

            {/* Central Express Icon Composition */}
            <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-amber-50/80 ring-1 ring-amber-200/60 shadow-inner" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <PackageSearch className="h-10 w-10 text-amber-500" strokeWidth={1.8} />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md ring-2 ring-white">
                <MapPinOff className="h-4 w-4" />
              </span>
            </div>

            {/* Status Pill */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-semibold text-amber-800 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>404 • Destination Missing / មិនមានទិសដៅនេះទេ</span>
            </div>

            {/* Typography */}
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Page Not Found
            </h1>
            <p className="mt-1 text-base font-medium text-slate-700">
              រកមិនឃើញទំព័រដឹកជញ្ជូននេះទេ
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              The delivery tracking link, parcel page, or address you are looking for might have been moved or does not exist.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Link href="/" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Truck className="h-4 w-4" />}
                  className="w-full shadow-md shadow-brand-600/20 sm:w-auto"
                >
                  Book New Delivery / កក់ការដឹកជញ្ជូន
                </Button>
              </Link>
            </div>

            {/* Customer Support Reassurance */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500">
              <Headphones className="h-3.5 w-3.5 text-slate-400" />
              <span>Need help? / ត្រូវការជំនួយ?</span>
              <a
                href={`tel:${APP_CONFIG.supportPhoneRaw}`}
                className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <PhoneCall className="h-3 w-3" />
                <span>{APP_CONFIG.supportPhone}</span>
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
