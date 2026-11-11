import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
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

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
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
          <span>{t('badge')}</span>
        </div>

        {/* Typography */}
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
          {t('description')}
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
              {t('bookDelivery')}
            </Button>
          </Link>
          <Link href="/bookings" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<PackageSearch className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              {t('myBookings')}
            </Button>
          </Link>
        </div>

        {/* Express Quick Link Cards */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="mb-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {t('quickLinksTitle')}
          </p>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
            <Link
              href="/"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-700">
                  {t('bookDelivery')}
                </p>
                <p className="text-xs text-slate-500">{t('homeDesc')}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>

            <Link
              href="/bookings"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div>
                <p className="text-xs font-semibold text-slate-800 group-hover:text-brand-700">
                  {t('myBookings')}
                </p>
                <p className="text-xs text-slate-500">{t('bookingsDesc')}</p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </Link>
          </div>
        </div>

        {/* Customer Support Reassurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <Headphones className="h-3.5 w-3.5 text-slate-400" />
          <span>{t('needHelp')}</span>
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
  );
}
